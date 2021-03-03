module.exports = {
  transform: {
    "^.+\\.ts?$": "babel-jest",
    "serverlessConfig.test.js": "babel-jest",
  },
  globalSetup: "./jest.globalSetup.ts",
};
