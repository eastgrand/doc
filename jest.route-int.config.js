const base = require('./jest.config');

module.exports = {
  ...base,
  testEnvironment: 'node',
  // Target only the new route integration tests under app/api/claude
  testMatch: [
    '<rootDir>/app/api/claude/generate-response/__tests__/route.spatialFilter.int.test.ts',
    '<rootDir>/app/api/claude/generate-response/__tests__/route.scope.integration.test.ts',
  ],
  // Reuse transforms but remove the ignore that blocks app/api/claude
  testPathIgnorePatterns: (base.testPathIgnorePatterns || []).filter(
    (p) => p !== '/app/api/claude/'
  ),
};
