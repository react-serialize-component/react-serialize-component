module.exports = [
  {
    test: /\.tsx?$/,
    use: [
      'babel-loader',
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: false,
        },
      },
    ],
  },
  {
    test: /\.css?$/,
    use: ['css-loader'],
  },
  { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
];
