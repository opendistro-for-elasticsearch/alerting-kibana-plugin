/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

module.exports = {
  rootDir: '../',
  setupFiles: [
    '<rootDir>/test/polyfills.js',
    '<rootDir>/test/setupTests.js',
    '<rootDir>/test/enzyme.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.jest.js'],
  modulePaths: ['node_modules', `../../node_modules`],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/test/mocks/styleMock.js',
  },
  snapshotSerializers: ['../../node_modules/enzyme-to-json/serializer'],
  coverageReporters: ['lcov', 'text', 'cobertura'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/index.js',
    '!<rootDir>/public/actions/**',
    '!<rootDir>/public/components/Charts/Highlight/Highlight.js',
    '!<rootDir>/public/reducers/**',
    '!<rootDir>/public/store.js',
    '!<rootDir>/test/**',
    '!<rootDir>/server/**',
    '!<rootDir>/coverage/**',
    '!<rootDir>/scripts/**',
    '!<rootDir>/build/**',
    '!<rootDir>/gather-info.js',
    '!**/vendor/**',
  ],
};
