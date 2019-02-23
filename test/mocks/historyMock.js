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

const historyMock = {
  action: 'REPLACE', // PUSH, REPLACE, POP
  block: jest.fn(), // prevents navigation
  createHref: jest.fn(),
  go: jest.fn(), // moves the pointer in the history stack by n entries
  goBack: jest.fn(), // equivalent to go(-1)
  goForward: jest.fn(), // equivalent to go(1)
  length: 0, // number of entries in the history stack
  listen: jest.fn(),
  location: {
    hash: '', // URL hash fragment
    pathname: '', // path of URL
    search: '', // URL query string
    state: undefined, // location-specific state that was provided to e.g. push(path, state) when this location was pushed onto the stack
  },
  push: jest.fn(), // pushes new entry onto history stack
  replace: jest.fn(), // replaces current entry on history stack
};

export default historyMock;