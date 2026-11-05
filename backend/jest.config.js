export default {
  testEnvironment: "node",
  globalSetup: "<rootDir>/tests/globalSetup.js",
  setupFiles: ["<rootDir>/tests/helpers/testEnv.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  transform: {},
  maxWorkers: 1,
  restoreMocks: true,
  verbose: true,
};
