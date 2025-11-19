module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^express$': '<rootDir>/node_modules/express',
    '^express-async-errors$': '<rootDir>/node_modules/express-async-errors',
  },
  moduleDirectories: ['node_modules', 'src'],
};