require('@babel/register')({
  presets: [
    ['@babel/env', {
      targets: {
        electron: '1.8.2'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread'
  ]
});

require('./index');
