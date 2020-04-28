/* eslint-disable @typescript-eslint/no-var-requires */
// gatsby-node.js
const path = require('path');

console.log(path.resolve(__dirname, './packages/serialize-core'));
exports.onCreateWebpackConfig = args => {
  console.log('set webpack');
  args.actions.setWebpackConfig({
    resolve: {
      alias: {
        'serialize-core': path.resolve(__dirname, '../packages/serialize-core'),
      },
    },
  });
};
