const path = require('path');
// development production
const env = process.env.NODE_ENV;
const mode = env === 'prod' ? 'production' : 'development';
const context = path.resolve(__dirname, '../');
module.exports = {
  mode,
  context,
  target: 'web',
  devtool: 'source-map',
  watch: env !== 'prod',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'antd',
  },
};
