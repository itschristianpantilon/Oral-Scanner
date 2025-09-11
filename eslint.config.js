// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Prevent automatic removal
      'no-unused-vars': 'warn', // or 'off' to completely ignore
      'unused-imports/no-unused-imports': 'off', // If you use this plugin
    },
  },
]);
