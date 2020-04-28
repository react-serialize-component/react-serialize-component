/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-alias-imports',
      options: {
        alias: {
          'serialize-core': path.resolve(__dirname, '../packages/serialize-core'),
        },
      },
    },
  ],
};
