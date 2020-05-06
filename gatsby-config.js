/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-alias-imports',
      options: {
        alias: {
          '@react-serialize-component/core': path.resolve(__dirname, '../packages/serialize-core'),
          '@react-serialize-component/antd': path.resolve(__dirname, '../packages/antd-component'),
          '@react-serialize-component/wap': path.resolve(__dirname, '../packages/wap-component'),
        },
      },
    },
  ],
};
