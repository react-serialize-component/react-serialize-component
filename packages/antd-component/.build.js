module.exports = {
  watch: false,
  entry: 'src/index.ts',
  esm: true,
  cjs: true,
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
  babel: ['cjs', 'esm'],
  // less文件的配置
  lessOpt: {
    javascriptEnabled: true,
  },
};
