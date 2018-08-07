module.exports = {
  testURL: 'http://localhost/',
  timers: 'fake',
  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],
  moduleNameMapper: {
    electron: '<rootDir>/__mocks__/electron.js',
    '\\.(jpg|png|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
