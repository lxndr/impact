module.exports = {
  setupFiles: [
    '<rootDir>/jestsetup.js',
  ],
  moduleNameMapper: {
    electron: '<rootDir>/__mocks__/electron.js',
  },
  timers: 'fake',
};
