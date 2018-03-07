require('@babel/register')({
  presets: [
    ['@babel/env', {
      targets: {
        electron: '1.8.2'
      }
    }],
    ['@babel/react']
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-decorators',
    ['@babel/plugin-proposal-class-properties', {loose: true}]
  ]
});

require('./index');
