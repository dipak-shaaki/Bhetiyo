export default {
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/tests/**/*.js',
        '!src/server.js',
        '!src/app.js'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    transform: {}
};