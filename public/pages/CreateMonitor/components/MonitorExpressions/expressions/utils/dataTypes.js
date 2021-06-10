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

import { NUMBER_TYPES } from './constants';

export function getFieldsForType(dataTypes, type) {
  if (type === 'number') {
    return NUMBER_TYPES.reduce(
      (options, type) => options.concat(getFieldsForType(dataTypes, type)),
      []
    );
  }
  if (dataTypes[type]) {
    return [...dataTypes[type].values()];
  }
  return [];
}

export const getIndexFields = (dataTypes, allowedTypes) =>
  allowedTypes.map((type) => ({
    label: type,
    options: getFieldsForType(dataTypes, type).map((field) => ({ label: field, type })),
  }));

export const getFilteredIndexFields = (dataTypes, allowedTypes, fieldsToInclude) =>
  allowedTypes.map((type) => ({
    label: type,
    options: getFieldsForType(dataTypes, type)
      .filter((field) => fieldsToInclude.includes(field))
      .map((field) => ({ label: field, type })),
  }));
