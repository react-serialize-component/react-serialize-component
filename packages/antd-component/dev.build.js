module.exports = {
  watch: true,
  entry: 'src/index.ts',
  runtimeHelpers: false,
  babel: ['esm', 'cjs'],
  // less文件的配置
  lessOpt: {
    javascriptEnabled: true,
  },
};
