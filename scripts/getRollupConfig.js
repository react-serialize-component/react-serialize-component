const path = require('path');
const isPro = process.env.NODE_ENV === 'production';
const getPlugins = require('./getPlugins');

const watch = {
  clearScreen: false,
  watch: {
    exclude: 'node_modules/**',
  },
};
function getOutput(opts = {}) {
  const cwd = opts.cwd;
  const entry = opts.entry;
  let basename = path.basename(entry);
  basename = basename.replace(path.extname(basename), '');
  const globals = Object.assign(
    {},
    {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    (opts.umd || {}).globals
  );

  const outputFile = {
    extend: true,
    sourcemap: !isPro,
  };
  const result = [];
  if (opts.umd) {
    result.push(
      Object.assign(
        {
          globals,
        },
        outputFile,
        {
          name: opts.umd.name,
          format: 'umd',
          exports: 'named',
          file: `${cwd}/dist/${basename || opts.umd.file}.umd.js`,
        }
      )
    );
  }
  if (opts.esm) {
    result.push(
      Object.assign({}, outputFile, {
        format: 'esm',
        exports: 'named',
        file: `${cwd}/dist/${basename || opts.esm.file}.esm.js`,
      })
    );
  }
  if (opts.cjs) {
    result.push(
      Object.assign({}, outputFile, {
        format: 'cjs',
        exports: 'named',
        file: `${cwd}/dist/${basename || opts.cjs.file}.cjs.js`,
      })
    );
  }
  return result;
}

module.exports = function (opts = {}) {
  let external = ['react', 'react-dom'];
  if (opts.external) {
    external = external.concat(opts.external);
  }
  const result = {
    input: opts.entry,
    external,
    output: getOutput(opts),
    plugins: getPlugins(opts),
  };
  if (opts.watch) {
    result.watch = watch;
  }
  return result;
};
