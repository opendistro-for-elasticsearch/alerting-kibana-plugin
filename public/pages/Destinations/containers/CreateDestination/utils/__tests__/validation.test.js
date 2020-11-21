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

import { validateDestinationName } from '../validations';

describe('destinations Validations', () => {
  const httpClient = {
    post: jest.fn(),
  };
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('validateDestinationName', () => {
    httpClient.post.mockResolvedValue({
      resp: { hits: { total: { value: 0, relation: 'eq' } } },
    });
    test('should be undefined if name is valid', () => {
      return expect(
        validateDestinationName(httpClient, null)('Valid Name')
      ).resolves.toBeUndefined();
    });
    test('should reject if name is empty', () => {
      return expect(validateDestinationName(httpClient, null)('')).rejects.toEqual('Required');
    });
    test('should reject if name already is being in used', () => {
      httpClient.post.mockResolvedValue({
        resp: { hits: { total: { value: 1, relation: 'eq' } } },
      });
      return expect(validateDestinationName(httpClient, null)('destinationName')).rejects.toEqual(
        'Destination name is already used'
      );
    });
    test('should reject if name already is being in used while editing destination', () => {
      httpClient.post.mockResolvedValue({
        resp: { hits: { total: { value: 1, relation: 'eq' } } },
      });
      return expect(
        validateDestinationName(httpClient, { name: 'destinationName' })('destinationName Existing')
      ).rejects.toEqual('Destination name is already used');
    });
    test('should rejects if network request has some error', () => {
      httpClient.post.mockRejectedValue({
        resp: { ok: false, error: 'There was an issue' },
      });
      return expect(validateDestinationName(httpClient, null)('destinationName')).rejects.toEqual(
        'There was a problem validating destination name. Please try again.'
      );
    });
  });
});
