module.exports = {
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
  presets: [
    '@babel/react',
    ['@babel/env', {
      modules: false,
      targets: {
        electron: '2.0.0',
      },
    }],
  ],
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
      ],
    },
  },
};
