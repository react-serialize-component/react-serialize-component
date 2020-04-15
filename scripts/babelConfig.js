function getBabelConfig(opts = {}) {
  let type = opts.type;
  let typescript = opts.typescript;
  let runtimeHelpers = !!opts.runtimeHelpers;
  let lessInBabelMode = opts.lessInBabelMode;
  const presets = [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: { browsers: ['last 2 versions', 'IE 10'] },
        modules: type === 'esm' ? false : 'auto',
      },
    ],
    require.resolve('@babel/preset-react'),
  ];
  if (typescript) {
    presets.unshift(require.resolve('@babel/preset-typescript'));
  }

  const plugins = [
    ...(lessInBabelMode ? [transformImportLess2Css] : []),
    require.resolve('babel-plugin-react-require'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-export-namespace-from'),
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
  ];
  if (runtimeHelpers) {
    plugins.push([require.resolve('@babel/plugin-transform-runtime'), { useESModules: type === 'esm' }]);
  }
  // 覆盖率
  if (process.env.COVERAGE) {
    plugins.push(require.resolve('babel-plugin-istanbul'));
  }

  return {
    presets,
    plugins,
  };
}

function transformImportLess2Css() {
  return {
    name: 'transform-import-less-to-css',
    visitor: {
      ImportDeclaration(path, source) {
        const re = /\.less$/;
        if (re.test(path.node.source.value)) {
          path.node.source.value = path.node.source.value.replace(re, '.css');
        }
      },
    },
  };
}
module.exports = getBabelConfig;
