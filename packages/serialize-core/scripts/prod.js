const webpack = require('webpack');
const base = require('./base');
const plugins = require('./plugin');
const loaders = require('./loaders');
const path = require('path');

const main = Object.assign({}, base, {
  entry: './src/index.ts',
  module: {
    rules: loaders,
  },
  plugins,
});

const umd = Object.assign({}, main, {
  output: {
    filename: 'index.js',
    path: main.context + '/dist',
    libraryTarget: 'umd',
    library: 'antdJSON',
  },
});
const commonjs = Object.assign({}, main, {
  output: {
    filename: 'index.cmd.js',
    path: main.context + '/dist',
    libraryTarget: 'commonjs2',
  },
});

module.exports = [umd, commonjs];
