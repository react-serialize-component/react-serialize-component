const webpack = require('webpack');
const path = require('path');
const base = require('./base');
const plugins = require('./plugin');
const loaders = require('./loaders');
const { express } = require('@jianxcao/mock');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const main = Object.assign({}, base, {
//   entry: ['./src/index.ts'],
//   output: {
//     filename: 'index.js',
//     path: base.context + '/dist',
//     libraryTarget: 'umd',
//     library: 'antdJSON',
//   },
//   module: {
//     rules: loaders,
//   },
//   plugins,
// });
const example = Object.assign({}, base, {
  entry: ['./example/index.tsx'],
  output: {
    filename: 'example.js',
    path: base.context + '/dist/example',
  },
  module: {
    rules: loaders,
  },
  plugins: [
    ...plugins,
    new HtmlWebpackPlugin({
      template: './view/view.html',
    }),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  devServer: {
    noInfo: true,
    disableHostCheck: true,
    port: 7001,
    before(app, server, compiler) {
      let errors = [];
      app.use(
        express({
          watch: true,
          cwd: path.resolve(__dirname, '../'),
          errors,
        })
      );

      if (errors.length) {
        console.error(errors);
        errors = [];
      }
    },
    writeToDisk: fileName => false,
  },
});

module.exports = example;
