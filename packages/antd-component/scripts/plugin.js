const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WebpackBar = require('webpackbar');
// const Declaration = require('declaration-bundler-webpack-plugin');

module.exports = [
  new CaseSensitivePathsPlugin(),
  // new Declaration({
  //   out: __dirname + '../lib',
  //   moduleName: 'AntdJSON',
  // }),
  new WebpackBar(),
];
