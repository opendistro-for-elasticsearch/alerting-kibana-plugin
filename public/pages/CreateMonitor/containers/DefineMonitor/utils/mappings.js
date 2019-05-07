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

export function shouldSkip(mapping) {
  const isDisabled = mapping.enabled === false;
  const hasIndexDisabled = mapping.index === false;
  const isNestedDataType = mapping.type === 'nested';
  return isDisabled || hasIndexDisabled || isNestedDataType;
}

export function resolvePath(path, field) {
  if (path) return `${path}.${field}`;
  return field;
}

export function getFieldsFromProperties(properties, dataTypes, path) {
  Object.entries(properties).forEach(([field, value]) => {
    getTypeFromMappings(value, dataTypes, resolvePath(path, field));
  });
}

export function getTypeFromMappings(mappings, dataTypes, path = '') {
  if (shouldSkip(mappings)) return dataTypes;
  // if there are properties then type is inherently an object
  if (mappings.properties) {
    getFieldsFromProperties(mappings.properties, dataTypes, path);
    return dataTypes;
  }

  const type = mappings.type;

  if (dataTypes[type]) dataTypes[type].add(path);
  else dataTypes[type] = new Set([path]);
  return dataTypes;
}

export function getPathsPerDataType(mappings) {
  const dataTypes = {};
  Object.entries(mappings).forEach(([index, { mappings: docMappings }]) =>
    getTypeFromMappings(docMappings, dataTypes)
  );
  return dataTypes;
}
