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
import {
  AGGREGATION_RESULTS_PATH,
  HITS_TOTAL_RESULTS_PATH,
  TRIGGER_TYPE,
  ANOMALY_GRADE_RESULT_PATH,
  ANOMALY_CONFIDENCE_RESULT_PATH,
  NOT_EMPTY_RESULT,
} from './constants';
import { SEARCH_TYPE } from '../../../../../utils/constants';

export function formikToTrigger(values, monitorUiMetadata = {}) {
  const condition = formikToCondition(values, monitorUiMetadata);
  const actions = formikToAction(values);
  return {
    id: values.id,
    name: values.name,
    severity: values.severity,
    condition,
    actions: actions,
    min_time_between_executions: values.minTimeBetweenExecutions,
    rolling_window_size: values.rollingWindowSize,
  };
}

export function formikToAction(values) {
  const actions = values.actions;
  if (actions && actions.length > 0) {
    return actions.map((action) => {
      if (!action.throttle_enabled) return _.omit(action, ['throttle']);
      return action;
    });
  }
  return actions;
}

export function formikToTriggerUiMetadata(values, monitorUiMetadata) {
  const { anomalyDetector, thresholdEnum, thresholdValue } = values;
  const searchType = _.get(monitorUiMetadata, 'search.searchType', 'query');
  let triggerMetadata = { value: thresholdValue, enum: thresholdEnum };
  //Store AD values only if AD trigger.
  if (searchType === SEARCH_TYPE.AD && anomalyDetector.triggerType === TRIGGER_TYPE.AD) {
    triggerMetadata.adTriggerMetadata = {
      triggerType: anomalyDetector.triggerType,
      anomalyGrade: {
        value: anomalyDetector.anomalyGradeThresholdValue,
        enum: anomalyDetector.anomalyGradeThresholdEnum,
      },
      anomalyConfidence: {
        value: anomalyDetector.anomalyConfidenceThresholdValue,
        enum: anomalyDetector.anomalyConfidenceThresholdEnum,
      },
    };
  }
  return { [values.name]: triggerMetadata };
}

export function formikToCondition(values, monitorUiMetadata = {}) {
  const { thresholdValue, thresholdEnum } = values;
  const searchType = _.get(monitorUiMetadata, 'search.searchType', 'query');
  const aggregationType = _.get(monitorUiMetadata, 'search.aggregationType', 'count');

  if (searchType === SEARCH_TYPE.QUERY) return { script: values.script };
  if (searchType === SEARCH_TYPE.AD) return getADCondition(values);
  const isCount = aggregationType === 'count';
  const resultsPath = getResultsPath(isCount);
  const operator = getOperator(thresholdEnum);
  return getCondition(resultsPath, operator, thresholdValue, isCount);
}

export function getADCondition(values) {
  const { anomalyDetector } = values;
  if (anomalyDetector.triggerType === TRIGGER_TYPE.AD) {
    const anomalyGradeOperator = getOperator(anomalyDetector.anomalyGradeThresholdEnum);
    const anomalyConfidenceOperator = getOperator(anomalyDetector.anomalyConfidenceThresholdEnum);
    return {
      script: {
        lang: 'painless',
        source: `return ${NOT_EMPTY_RESULT} && ${ANOMALY_GRADE_RESULT_PATH} != null && ${ANOMALY_GRADE_RESULT_PATH} ${anomalyGradeOperator} ${anomalyDetector.anomalyGradeThresholdValue} && ${ANOMALY_CONFIDENCE_RESULT_PATH} ${anomalyConfidenceOperator} ${anomalyDetector.anomalyConfidenceThresholdValue}`,
      },
    };
  } else {
    return { script: values.script };
  }
}

export function getCondition(resultsPath, operator, value, isCount) {
  const baseSource = `${resultsPath} ${operator} ${value}`;
  return {
    script: {
      lang: 'painless',
      source: isCount ? baseSource : `return ${resultsPath} == null ? false : ${baseSource}`,
    },
  };
}

export function getResultsPath(isCount) {
  return isCount ? HITS_TOTAL_RESULTS_PATH : AGGREGATION_RESULTS_PATH;
}

export function getOperator(thresholdEnum) {
  return { ABOVE: '>', BELOW: '<', EXACTLY: '==' }[thresholdEnum];
}
