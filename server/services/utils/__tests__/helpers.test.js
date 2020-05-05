/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { mapKeysDeep, toSnake } from '../helpers';

describe('server helpers', () => {
  describe('mapKeysDeep', () => {
    test('should convert keys to snake_case', () => {
      const snake = mapKeysDeep({ helloWorld: 'value' }, toSnake);
      expect(snake).toEqual({ hello_world: 'value' });
    });
    test('should not convert keys to snake_case for filterQuery', () => {
      const snake = mapKeysDeep(
        {
          helloWorld: 'value',
          filterQuery: {
            aggs: { sumAggregation: { sum: { field: 'totalSales' } } },
          },
        },
        toSnake
      );
      expect(snake).toEqual({
        hello_world: 'value',
        filter_query: {
          aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
        },
      });
    });

    test('should not convert keys to snake_case for uiMetadata', () => {
      const snake = mapKeysDeep(
        {
          helloWorld: 'value',
          filterQuery: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
          uiMetadata: { newFeatures: [{ featureName: 'Name' }] },
        },
        toSnake
      );
      expect(snake).toEqual({
        hello_world: 'value',
        filter_query: {
          aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
        },
        ui_metadata: { new_features: [{ feature_name: 'Name' }] },
      });
    });
  });
});
