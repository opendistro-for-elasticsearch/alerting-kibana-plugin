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

import {
  validateUrl,
} from './validate';

import { URL_TYPE } from '../../../containers/CreateDestination/utils/constants';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('validateUrl', () => {
  const typeFullUrl = {"type": "custom_webhook", "custom_webhook": { "urlType": URL_TYPE.FULL_URL }}

  test('returns Required if is empty', () => {
    expect(validateUrl('', typeFullUrl)).toBe('Required');
  });

  test('returns undefined if valid', () => {
    expect(validateUrl('https://opendistro.github.io/for-elasticsearch/news.html', typeFullUrl)).toBeUndefined();
    expect(validateUrl("http://127.0.0.1:8080/", typeFullUrl)).toBeUndefined();
    expect(validateUrl("http://192.168.0.1/test.php?foo=bar&action=test", typeFullUrl)).toBeUndefined();
    expect(validateUrl("http://[2001:0db8:85a3:0000:0000:0000:0000:7344]", typeFullUrl)).toBeUndefined();
    expect(validateUrl("http://[2001:0db8:85a3:0:0:0:0:7344]", typeFullUrl)).toBeUndefined();
    expect(validateUrl("http://[2001:0db8:85a3::7344]", typeFullUrl)).toBeUndefined();
    expect(validateUrl("https://[::ff]", typeFullUrl)).toBeUndefined();
    expect(validateUrl("https://[2001:db8::ff00:42:8329]:443/?foo=bar", typeFullUrl)).toBeUndefined();
    expect(validateUrl("http://[64:ff9b::192.0.2.128]:80/", typeFullUrl)).toBeUndefined();
    expect(validateUrl("https://org.example/", typeFullUrl)).toBeUndefined();
  });

  test('returns error string if invalid', () => {
    const invalidText = 'Invalid URL';
    expect(validateUrl("opendistro.github.io", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("https://opendistro.github/", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("127.0.0.1", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("http://127.0.0.1.1", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("http://127.0.0.256:8080/", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("ftp://127.0.0.1", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("2001:0db8:85a3:0000:0000:0000:0000:7344", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("http://2001:0db8:85a3:0000:0000:0000:0000:7344", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("http://[2001:0db8:85a3:0000:0r00:0000:0000:7344]", typeFullUrl)).toBe(invalidText);
    expect(validateUrl("http://org.exampleexampleexampleexampleexampleexampleexampleexampleexampleexampleexampleexample", typeFullUrl)).toBe(invalidText);
  });
});