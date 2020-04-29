const path = require('path');
const isPro = process.env.NODE_ENV === 'production';
const { rollup, watch } = require('rollup');
const getRollupConfig = require('./getRollupConfig');
const babelBuild = require('./babel');
const rimraf = require('rimraf');
const { getExistFile } = require('./utils');
function getUserConfig(opts) {
  const cwd = opts.cwd;
  const filePath = getExistFile({
    cwd,
    files: isPro ? ['.build.js'] : ['dev.build.js', '.build.js'],
  });
  const userConfig = require(filePath);
  const entry = userConfig.entry;
  if (typeof entry === 'string') {
    return [Object.assign({ cwd }, userConfig)];
  }
  return entry.map(one => {
    return Object.assign({ cwd }, userConfig, { entry: one });
  });
}

function getConfig(opts = {}) {
  const userConfig = getUserConfig(opts);
  return userConfig.map(one => {
    return getRollupConfig(one);
  });
}

async function rollupBuild(opts = {}) {
  opts.cwd = opts.cwd || process.cwd();
  const configs = getConfig(opts);
  rimraf.sync(path.join(opts.cwd, 'dist'));
  for (let config of configs) {
    if (config.output && config.output.length) {
      if (config.watch) {
        const watcher = watch([
          {
            ...config,
            watch: {},
          },
        ]);
        watcher.on('event', event => {
          if (event.error) {
            console.error(event.error);
          } else if (event.code === 'START') {
            console.log(`Rebuild since file changed`);
          }
        });
        process.once('SIGINT', () => {
          watcher.close();
        });
      } else {
        const { output, ...input } = config;
        const bundle = await rollup(input); // eslint-disable-line
        for (let out of output) {
          await bundle.write(out); // eslint-disable-line
        }
      }
    }
  }
}

async function babelBuid(opts = {}) {
  opts.cwd = opts.cwd || process.cwd();
  const configs = getUserConfig(opts);
  for (let config of configs) {
    if (config.babel) {
      const babel = Array.isArray(config.babel) ? config.babel : [babel];
      const cfg = {
        cwd: config.cwd,
        entry: config.entry,
        runtimeHelpers: config.runtimeHelpers,
        lessOpt: config.lessOpt,
        watch: config.watch,
      };
      for (let type of babel) {
        if (type === 'esm') {
          await babelBuild(
            Object.assign(
              {
                type: 'esm',
              },
              cfg
            )
          );
        } else if (type === 'cjs') {
          await babelBuild(
            Object.assign(
              {
                type: 'cjs',
              },
              cfg
            )
          );
        }
      }
    }
  }
}

module.exports = function build(opts) {
  rollupBuild();
  babelBuid();
};

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
