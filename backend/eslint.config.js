export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: [
      "src/**/*.js",
      "db/**/*.js",
      "tests/**/*.js",
      "eslint.config.js",
      "jest.config.js",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        describe: "readonly",
        expect: "readonly",
        test: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
