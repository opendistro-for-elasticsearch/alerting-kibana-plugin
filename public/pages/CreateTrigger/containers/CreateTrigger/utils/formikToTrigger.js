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
import { AGGREGATION_RESULTS_PATH, HITS_TOTAL_RESULTS_PATH } from './constants';
import { SEARCH_TYPE } from '../../../../../utils/constants';

export function formikToTrigger(values, monitorUiMetadata = {}) {
  const condition = formikToCondition(values, monitorUiMetadata);
  return {
    id: values.id,
    name: values.name,
    severity: values.severity,
    condition,
    actions: values.actions,
    min_time_between_executions: values.minTimeBetweenExecutions,
    rolling_window_size: values.rollingWindowSize,
  };
}

export function formikToThresholds(values) {
  return { [values.name]: { value: values.thresholdValue, enum: values.thresholdEnum } };
}

export function formikToCondition(values, monitorUiMetadata = {}) {
  const { thresholdValue, thresholdEnum } = values;
  const searchType = _.get(monitorUiMetadata, 'search.searchType', 'query');
  const aggregationType = _.get(monitorUiMetadata, 'search.aggregationType', 'count');

  if (searchType === SEARCH_TYPE.QUERY) return { script: values.script };

  const resultsPath = getResultsPath(aggregationType);
  const operator = getOperator(thresholdEnum);
  return getCondition(resultsPath, operator, thresholdValue);
}

export function getCondition(resultsPath, operator, value) {
  return { script: { lang: 'painless', source: `${resultsPath} ${operator} ${value}` } };
}

export function getResultsPath(aggregationType) {
  if (aggregationType === 'count') return HITS_TOTAL_RESULTS_PATH;
  return AGGREGATION_RESULTS_PATH;
}

export function getOperator(thresholdEnum) {
  return { ABOVE: '>', BELOW: '<', EXACTLY: '==' }[thresholdEnum];
}
