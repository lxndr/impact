module.exports = {
  module: {
    rules: [{
      test: /\.less$/,
      use: [{
        loader: 'css-loader',
        options: {
          modules: 'global',
          localIdentName: '[local]_[hash:base64:5]',
        },
      }],
    }],
  },
};
