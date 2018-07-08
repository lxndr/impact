module.exports = {
  timers: 'fake',
  setupFiles: [
    '<rootDir>/jestsetup.js',
  ],
  moduleNameMapper: {
    electron: '<rootDir>/__mocks__/electron.js',
    '\\.(jpg|png|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
