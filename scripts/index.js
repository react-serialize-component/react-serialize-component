const path = require('path');
const { rollup, watch } = require('rollup');
const getRollupConfig = require('./getRollupConfig');

function getConfig(opts = {}) {
  const cwd = opts.cwd;
  const userConfigPath = path.resolve(cwd, '.build.js');
  const userConfig = require(userConfigPath);
  const entry = userConfig.entry;
  if (typeof entry === 'string') {
    return [getRollupConfig(Object.assign({ cwd }, userConfig))];
  }
  return entry.map((one) => {
    return getRollupConfig(Object.assign({ cwd }, userConfig, { entry: one }));
  });
}

async function build(opts = {}) {
  opts.cwd = opts.cwd || process.cwd();
  const configs = getConfig(opts);
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

module.exports = build;

build();
