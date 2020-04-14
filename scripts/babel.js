const { join, extname, relative } = require('path');
const { existsSync, readFileSync, statSync } = require('fs');
const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
const gulpLess = require('gulp-less');
const gulpIf = require('gulp-if');
const babel = require('gulp-babel');
const getBabelConfig = require('./babelConfig');
const ts = require('typescript');
const rimraf = require('rimraf');

function isTsFile(path) {
  return /\.tsx?$/.test(path) && !path.endsWith('.d.ts');
}
module.exports = async function (opt = {}) {
  const { cwd, type = 'cjs', disableTypeCheck = false, entry } = opt;
  const srcPath = join(cwd, 'src');
  const typings = join(cwd, 'typings');
  const targetDir = type === 'esm' ? 'es' : 'lib';
  const targetPath = join(cwd, targetDir);
  const isTs = /tsx?/.test(entry);
  const tsconfigPath = join(cwd, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    throw new Error('tsconfig is required');
  }
  const tsProject = gulpTypescript.createProject(tsconfigPath, {});

  const babelConfig = getBabelConfig(
    Object.assign(opt, {
      typescript: isTs,
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
    `!${join(srcPath, 'example/**/*')}`,
    `!${join(srcPath, '**/*.+(test|e2e|spec|example).+(js|jsx|ts|tsx)')}`,
  ];
  gulp
    .src(patterns.concat(typings), {
      allowEmpty: true,
      base: srcPath,
    })
    .pipe(gulpIf((f) => !disableTypeCheck && isTsFile(f.path), tsProject()))
    .pipe(gulpIf(isTransform, babel(babelConfig)))
    .pipe(gulp.dest(targetPath));
};
