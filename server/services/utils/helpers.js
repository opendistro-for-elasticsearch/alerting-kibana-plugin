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

import { map, mapKeys, mapValues, isPlainObject, snakeCase, camelCase } from 'lodash';

export function mapKeysDeep(obj, fn) {
  if (Array.isArray(obj)) {
    return map(obj, innerObj => mapKeysDeep(innerObj, fn));
  } else {
    return isPlainObject(obj) ? mapValues(mapKeys(obj, fn), value => mapKeysDeep(value, fn)) : obj;
  }
}

export const toSnake = (value, key) => snakeCase(key);

export const toCamel = (value, key) => camelCase(key);
