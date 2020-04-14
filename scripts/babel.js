const { join, extname, relative } = require('path');
const { existsSync, readFileSync, statSync } = require('fs');
const gulp = require('gulp');
const gulpTs = require('gulp-typescript');
const gulpLess = require('gulp-less');
const gulpIf = require('gulp-if');
const babel = require('gulp-babel');
const getBabelConfig = require('./babelConfig');
const ts = require('typescript');
const rimraf = require('rimraf');

function isTsFile(path) {
  return /\.tsx?$/.test(path) && !path.endsWith('.d.ts');
}
function parseTsconfig(path) {
  const readFile = (path) => readFileSync(path, 'utf-8');
  const result = ts.readConfigFile(path, readFile);
  if (result.error) {
    return;
  }
  return result.config;
}

function getTsconfigCompilerOptions(path) {
  const config = parseTsconfig(path);
  return config ? config.compilerOptions : undefined;
}

function getTSConfig(cwd) {
  const tsconfigPath = join(cwd, 'tsconfig.json');
  if (existsSync(tsconfigPath)) {
    return getTsconfigCompilerOptions(tsconfigPath) || {};
  }
  throw new Error(`${cwd}  tsconfig is missing`);
}

module.exports = async function (opt = {}) {
  const { cwd, type = 'cjs', disableTypeCheck = false, entry } = opt;
  const srcPath = join(cwd, 'src');
  const targetDir = type === 'esm' ? 'es' : 'lib';
  const targetPath = join(cwd, targetDir);
  const tsConfig = getTSConfig(cwd);
  const isTs = /tsx?/.test(entry);
  const babelConfig = getBabelConfig(
    Object.assign(opt, {
      typescript: true,
    })
  );
  const babelTransformRegexp = disableTypeCheck ? /\.(t|j)sx?$/ : /\.jsx?$/;
  function isTransform(file) {
    return babelTransformRegexp.test(file.path) && !file.path.endsWith('.d.ts');
  }
  rimraf.sync(targetPath);
  const patterns = [
    join(srcPath, '**/*'),
    `!${join(srcPath, '**/fixtures{,/**}')}`,
    `!${join(srcPath, '**/__test__{,/**}')}`,
    `!${join(srcPath, '**/*.mdx')}`,
    `!${join(srcPath, '**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)')}`,
  ];
  gulp
    .src(patterns, {
      allowEmpty: true,
      base: srcPath,
    })
    .pipe(gulpIf((f) => !disableTypeCheck && isTsFile(f.path), gulpTs(tsConfig)))
    .pipe(gulpIf(isTransform, babel(babelConfig)))
    .pipe(gulp.dest(targetPath));
};
