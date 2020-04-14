const isPro = process.env.NODE_ENV === 'production';
const { terser } = require('rollup-plugin-terser');
// svg生成react组件
// const svgr = require('@svgr/rollup');
// const autoprefixer = require('autoprefixer');
// const postcss = require('rollup-plugin-postcss-umi');
// const NpmImport = require('less-plugin-npm-import');
const path = require('path');
const commonjs = require('@rollup/plugin-commonjs');
const tempDir = require('temp-dir');
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'];
const replace = require('@rollup/plugin-replace');
const babel = require('rollup-plugin-babel');
const inject = require('@rollup/plugin-inject');
const url = require('@rollup/plugin-url');
const json = require('@rollup/plugin-json');
const typescript2 = require('rollup-plugin-typescript2');
const nodeResolve = require('@rollup/plugin-node-resolve');

const getBabelConfig = require('./babelConfig');

function getTsConfig(opts = {}) {
  return typescript2(
    Object.assign(
      {
        cwd: opts.cwd,
        // @see https://github.com/ezolenko/rollup-plugin-typescript2/issues/105
        objectHashIgnoreUnknownHack: true,
        // @see https://github.com/umijs/father/issues/61#issuecomment-544822774
        clean: true,
        cacheRoot: `${tempDir}/.rollup_plugin_typescript2_cache`,
        useTsconfigDeclarationDir: true,
        // 比如 lerna 的场景不需要每个 package 有个 tsconfig.json
        tsconfig: path.join(opts.cwd, 'tsconfig.json'),
        tsconfigDefaults: {
          compilerOptions: {
            // Generate declaration files by default
            declaration: false,
          },
        },
        tsconfigOverride: {
          compilerOptions: {
            // Support dynamic import
            target: 'esnext',
          },
        },
        check: !opts.disableTypeCheck,
      },
      opts.typescriptOpts || {}
    )
  );
}

function getPlugins(opts = {}) {
  const result = [url()];
  if (opts.injectOpts) {
    result.push(inject(opts.injectOpts));
  }
  if (opts.replaceOpts) {
    result.push(replace(opt.replaceOpts));
  }
  result.push(commonjs());
  result.push(
    nodeResolve(
      Object.assign(
        {
          mainFields: ['module', 'jsnext:main', 'main'],
          extensions,
        },
        opts.nodeResolveOpts
      )
    )
  );
  if (/.tsx?$/.test(opts.entry)) {
    result.push(getTsConfig(opts));
  }

  result.push(json());
  const defaultConfig = { runtimeHelpers: !!opts.runtimeHelpers, extensions, exclude: /\/node_modules\// };
  result.push(
    babel(
      Object.assign(
        defaultConfig,
        getBabelConfig({
          type: 'auto',
          typescript: /tsx?$/.test(opts.entry),
        })
      )
    )
  );
  if (isPro) {
    result.push(terser());
  }
  return result;
}

module.exports = getPlugins;
