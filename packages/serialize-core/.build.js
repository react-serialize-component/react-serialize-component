module.exports = {
  entry: 'src/index.ts',
  esm: {
    type: 'babel',
  },
  cjs: {
    type: 'babel',
  },
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
};
