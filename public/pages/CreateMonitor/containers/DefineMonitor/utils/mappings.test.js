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

import { getPathsPerDataType } from './mappings';

describe('getPathsPerDataType', () => {
  test('returns correct dataTypes', () => {
    const mappings = {
      random_index: {
        mappings: {
          properties: {
            '@message': { type: 'text' },
            '@timestamp': { type: 'date' },
            username: { type: 'keyword' },
            memory: { type: 'double' },
            phpmemory: { type: 'long' },
            bytes: { type: 'long' },
            clientip: { type: 'ip' },
            id: { type: 'integer' },
            ip: { type: 'ip' },
          },
        },
      },
    };
    expect(getPathsPerDataType(mappings)).toEqual({
      text: new Set(['@message']),
      date: new Set(['@timestamp']),
      keyword: new Set(['username']),
      double: new Set(['memory']),
      long: new Set(['phpmemory', 'bytes']),
      ip: new Set(['clientip', 'ip']),
      integer: new Set(['id']),
    });
  });
});
