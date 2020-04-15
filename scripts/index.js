const path = require('path');
const { rollup, watch } = require('rollup');
const getRollupConfig = require('./getRollupConfig');
const babelBuild = require('./babel');
const rimraf = require('rimraf');
function getUserConfig(opts) {
  const cwd = opts.cwd;
  const userConfigPath = path.resolve(cwd, '.build.js');
  const userConfig = require(userConfigPath);
  const entry = userConfig.entry;
  if (typeof entry === 'string') {
    return [Object.assign({ cwd }, userConfig)];
  }
  return entry.map((one) => {
    return Object.assign({ cwd }, userConfig, { entry: one });
  });
}

function getConfig(opts = {}) {
  const userConfig = getUserConfig(opts);
  return userConfig.map((one) => {
    return getRollupConfig(one);
  });
}

async function build(opts = {}) {
  opts.cwd = opts.cwd || process.cwd();
  const configs = getConfig(opts);
  rimraf.sync(path.join(opts.cwd, 'dist'));
  for (let config of configs) {
    if (opts.watch) {
      const watcher = watch([
        {
          ...rollupConfig,
          watch: {},
        },
      ]);
      watcher.on('event', (event) => {
        if (event.error) {
          signale.error(event.error);
        } else if (event.code === 'START') {
          log(`[${type}] Rebuild since file changed`);
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

module.exports = build;
// babelBuid();
build();

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
