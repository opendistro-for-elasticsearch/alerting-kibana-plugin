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
  FORMIK_INITIAL_TRIGGER_CONDITION_VALUES,
  FORMIK_INITIAL_TRIGGER_VALUES,
  TRIGGER_TYPE,
} from './constants';

export function triggerToFormik(trigger, monitor) {
  // TODO: Should compare to this to some defined constant
  const isAggregationMonitor = _.get(monitor, 'monitor_type') === 'aggregation_monitor';
  return isAggregationMonitor
    ? aggregationTriggerToFormik(trigger, monitor)
    : traditionalTriggerToFormik(trigger, monitor);
}

export function traditionalTriggerToFormik(trigger, monitor) {
  const {
    id,
    name,
    severity,
    condition: { script },
    actions,
    min_time_between_executions: minTimeBetweenExecutions,
    rolling_window_size: rollingWindowSize,
  } = trigger.traditional_trigger;
  const thresholdEnum = _.get(
    monitor,
    `ui_metadata.triggers[${name}].enum`,
    FORMIK_INITIAL_TRIGGER_VALUES.thresholdEnum
  );
  const thresholdValue = _.get(
    monitor,
    `ui_metadata.triggers[${name}].value`,
    FORMIK_INITIAL_TRIGGER_VALUES.thresholdValue
  );
  const anomalyConfidenceThresholdValue = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyConfidence.value`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyConfidenceThresholdValue
  );
  const anomalyConfidenceThresholdEnum = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyConfidence.enum`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyConfidenceThresholdEnum
  );
  const anomalyGradeThresholdValue = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyGrade.value`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyGradeThresholdValue
  );
  const anomalyGradeThresholdEnum = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyGrade.enum`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyGradeThresholdEnum
  );
  const triggerType = _.get(monitor, `ui_metadata.triggers[${name}].adTriggerMetadata.triggerType`);
  return {
    ..._.cloneDeep(FORMIK_INITIAL_TRIGGER_VALUES),
    id,
    name,
    severity,
    script,
    actions,
    minTimeBetweenExecutions,
    rollingWindowSize,
    thresholdEnum,
    thresholdValue,
    anomalyDetector: {
      /*If trigger type doesn't exist fallback to query trigger with following reasons
        1. User has changed monitory type from normal monitor to AD monitor.
        2. User has created / updated from API and visiting Kibana to do other operations.
      */
      triggerType: triggerType ? triggerType : TRIGGER_TYPE.ALERT_TRIGGER,
      anomalyGradeThresholdValue,
      anomalyGradeThresholdEnum,
      anomalyConfidenceThresholdValue,
      anomalyConfidenceThresholdEnum,
    },
  };
}

export function aggregationTriggerToFormik(trigger, monitor) {
  const {
    id,
    name,
    severity,
    condition,
    condition: { script },
    actions,
    min_time_between_executions: minTimeBetweenExecutions,
    rolling_window_size: rollingWindowSize,
  } = trigger.aggregation_trigger;

  const triggerConditions = getAggregationTriggerConditions(condition);

  const thresholdEnum = _.get(
    monitor,
    `ui_metadata.triggers[${name}].enum`,
    FORMIK_INITIAL_TRIGGER_VALUES.thresholdEnum
  );
  const thresholdValue = _.get(
    monitor,
    `ui_metadata.triggers[${name}].value`,
    FORMIK_INITIAL_TRIGGER_VALUES.thresholdValue
  );
  const anomalyConfidenceThresholdValue = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyConfidence.value`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyConfidenceThresholdValue
  );
  const anomalyConfidenceThresholdEnum = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyConfidence.enum`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyConfidenceThresholdEnum
  );
  const anomalyGradeThresholdValue = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyGrade.value`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyGradeThresholdValue
  );
  const anomalyGradeThresholdEnum = _.get(
    monitor,
    `ui_metadata.triggers[${name}].adTriggerMetadata.anomalyGrade.enum`,
    FORMIK_INITIAL_TRIGGER_VALUES.anomalyDetector.anomalyGradeThresholdEnum
  );
  const triggerType = _.get(monitor, `ui_metadata.triggers[${name}].adTriggerMetadata.triggerType`);
  return {
    ..._.cloneDeep(FORMIK_INITIAL_TRIGGER_VALUES),
    id,
    name,
    severity,
    script,
    actions,
    triggerConditions,
    minTimeBetweenExecutions,
    rollingWindowSize,
    thresholdEnum,
    thresholdValue,
    anomalyDetector: {
      /*If trigger type doesn't exist fallback to query trigger with following reasons
        1. User has changed monitory type from normal monitor to AD monitor.
        2. User has created / updated from API and visiting Kibana to do other operations.
      */
      triggerType: triggerType ? triggerType : TRIGGER_TYPE.ALERT_TRIGGER,
      anomalyGradeThresholdValue,
      anomalyGradeThresholdEnum,
      anomalyConfidenceThresholdValue,
      anomalyConfidenceThresholdEnum,
    },
  };
}

export function getAggregationTriggerConditions(condition) {
  const triggerConditions = segmentArray(condition.script.source, 4).map((conditionArray) =>
    convertToTriggerCondition(conditionArray, condition)
  );

  return triggerConditions;
}

export function convertToTriggerCondition(conditionArray, condition) {
  const { buckets_path, gap_policy, parent_bucket_path, script } = condition;
  const enumOptions = {
    '>': 'ABOVE',
    '<': 'BELOW',
    '==': 'EXACTLY',
  };

  const queryMetric = conditionArray[0];
  const thresholdEnum = enumOptions[conditionArray[1]];
  const thresholdValue = conditionArray[2];
  const andOrCondition =
    conditionArray.length === 4
      ? conditionArray[4]
      : FORMIK_INITIAL_TRIGGER_CONDITION_VALUES.andOrCondition;

  return {
    ..._.cloneDeep(FORMIK_INITIAL_TRIGGER_CONDITION_VALUES),
    buckets_path,
    parent_bucket_path,
    script,
    gap_policy,
    queryMetric,
    thresholdEnum,
    thresholdValue,
    andOrCondition,
  };
}

export function segmentArray(scriptSource, segmentSize) {
  const spaceRegex = /\s/;
  const conditions = scriptSource.split(spaceRegex);
  const output = [];
  for (let i = 0; i < conditions.length; i += segmentSize) {
    const segment = conditions.slice(i, i + segmentSize);
    output.push(segment);
  }
  return output;
}
