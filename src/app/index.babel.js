require('@babel/register')({
  presets: [
    ['@babel/env', {
      targets: {
        electron: '2.0.0-beta.2'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread'
  ]
});

require('./index');
