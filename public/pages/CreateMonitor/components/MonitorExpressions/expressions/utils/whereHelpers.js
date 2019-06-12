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

import _ from 'lodash';
import { COMPARISON_OPERATORS, OPERATORS_MAP } from './constants';

export const getOperators = fieldType =>
  COMPARISON_OPERATORS.reduce(
    (acc, currentOperator) =>
      currentOperator.dataTypes.includes(fieldType)
        ? [...acc, { text: currentOperator.text, value: currentOperator.value }]
        : acc,
    []
  );

export const isRangeOperator = selectedOperator =>
  [OPERATORS_MAP.IN_RANGE, OPERATORS_MAP.NOT_IN_RANGE].includes(selectedOperator);
export const isNullOperator = selectedOperator =>
  [OPERATORS_MAP.IS_NULL, OPERATORS_MAP.IS_NOT_NULL].includes(selectedOperator);

export const displayText = whereValues => {
  const whereFieldName = _.get(whereValues, 'fieldName[0].label', undefined);
  if (!whereFieldName) {
    return 'all fields are included';
  }
  const selectedOperator = _.get(whereValues, 'operator', 'is');
  const operatorObj =
    COMPARISON_OPERATORS.find(operator => operator.value === selectedOperator) || {};
  const initialText = `${whereFieldName} ${operatorObj.text || ''}`;

  if (isRangeOperator(selectedOperator)) {
    const startRange = _.get(whereValues, 'fieldRangeStart', 0);
    const endRange = _.get(whereValues, 'fieldRangeEnd', 0);
    return `${initialText} from ${startRange} to ${endRange}`;
  } else if (isNullOperator(selectedOperator)) {
    return `${initialText}`;
  } else {
    const value = _.get(whereValues, 'fieldValue', '');
    return `${initialText} ${value}`;
  }
};

export const validateRange = (value, whereFilters) => {
  if (value === '') return 'Required';
  if (whereFilters.fieldRangeEnd < value) {
    return 'Start should be less than end range';
  }
  if (value < whereFilters.fieldRangeStart) {
    return 'End should be greater than start range';
  }
};
