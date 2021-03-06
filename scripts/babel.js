const { join, extname, relative } = require('path');
const { existsSync, readFileSync, statSync } = require('fs');
const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
const gulpLess = require('gulp-less');
const chalk = require('chalk');
const gulpIf = require('gulp-if');
const babel = require('gulp-babel');
const getBabelConfig = require('./babelConfig');
const rimraf = require('rimraf');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const felxbugs = require('postcss-flexbugs-fixes');
const cssnano = require('cssnano');
const NpmImport = require('less-plugin-npm-import');
const plumber = require('gulp-plumber');
// less-plugin-npm-import

function isTsFile(path) {
  return /\.tsx?$/.test(path) && !path.endsWith('.d.ts');
}
module.exports = async function(opt = {}) {
  const { watch = false, cwd, type = 'cjs', lessOpt = {}, disableTypeCheck = false, entry, runtimeHelpers = false } = opt;
  const srcPath = join(cwd, 'src');
  const typings = join(cwd, 'typings');
  const targetDir = type === 'esm' ? 'es' : 'lib';
  const targetPath = join(cwd, targetDir);
  const isTs = /tsx?/.test(entry);
  const tsconfigPath = join(cwd, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    throw new Error('tsconfig is required');
  }
  const babelConfig = getBabelConfig(
    Object.assign(opt, {
      typescript: isTs,
      type: type,
      runtimeHelpers,
      lessInBabelMode: true,
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
  console.log(chalk.cyan(`babel build start type: ${type}`));
  function task(stream) {
    const tsProject = gulpTypescript.createProject(tsconfigPath, {});
    const lestOpt = Object.assign({ plugins: [new NpmImport({ prefix: '~' })] }, lessOpt);
    return stream
      .pipe(
        plumber({
          errorHandler(error) {
            console.error(error);
            this.emit('end');
          },
        })
      )
      .pipe(gulpIf(f => !disableTypeCheck && isTsFile(f.path), tsProject()))
      .pipe(gulpIf(f => /\.less$/.test(f.path), gulpLess(lestOpt)))
      .pipe(gulpIf(f => /\.css$/.test(f.path), postcss([autoprefixer(), felxbugs(), cssnano()])))
      .pipe(gulpIf(isTransform, babel(babelConfig)))
      .pipe(gulp.dest(targetPath));
  }
  const stream = gulp.src(patterns.concat(typings), {
    allowEmpty: true,
    base: srcPath,
  });
  task(stream).on('end', function() {
    console.log(chalk.cyan(`babel build end type: ${type}`));
    if (watch) {
      console.log(chalk.magenta(`start watching type: ${type}`));
      const watcher = gulp.watch(patterns);
      watcher.on('change', function(fullPath) {
        const relPath = fullPath.replace(srcPath, '');
        if (!existsSync(fullPath)) return;
        console.log(chalk.cyan(`watcher ${relPath}`));
        task(
          gulp.src(fullPath, {
            base: srcPath,
            allowEmpty: true,
          })
        ).on('end', function() {
          console.log(chalk.cyan('rebuild end'));
        });
      });
    }
  });
};
