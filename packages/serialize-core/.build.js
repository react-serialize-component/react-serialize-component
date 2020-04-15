module.exports = {
  entry: 'src/index.ts',
  esm: true,
  cjs: false,
  umd: {
    globals: {
      moment: 'moment',
      'dva-core': 'dvaCore',
      axios: 'axios',
      'react-redux': 'react-redux',
      redux: 'redux',
    },
    name: 'SerialCore',
  },
  external: ['moment', 'dva-core', 'axios', 'redux', 'react-redux'],
  runtimeHelpers: false,
  babel: ['cjs'],
  // less文件的配置
  lessOpt: {
    test: 1
  },
};
