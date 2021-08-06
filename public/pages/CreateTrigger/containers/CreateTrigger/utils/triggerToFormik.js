/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import _ from 'lodash';
import {
  FORMIK_INITIAL_TRIGGER_CONDITION_VALUES,
  FORMIK_INITIAL_TRIGGER_VALUES,
  TRIGGER_TYPE,
} from './constants';
import { MONITOR_TYPE } from '../../../../../utils/constants';
import {
  ACTIONABLE_ALERTS_OPTIONS_LABELS,
  NOTIFY_OPTIONS_VALUES,
} from '../../../components/Action/actions/Message';

export function triggerToFormik(trigger, monitor) {
  return _.isArray(trigger)
    ? triggerDefinitionsToFormik(trigger, monitor)
    : triggerDefinitionToFormik(trigger, monitor);
}

export function triggerDefinitionsToFormik(triggers, monitor) {
  const triggerDefinitions = triggers.map((trigger) => triggerDefinitionToFormik(trigger, monitor));
  return {
    triggerDefinitions: _.orderBy(triggerDefinitions, (trigger) => trigger.name),
  };
}

export function triggerDefinitionToFormik(trigger, monitor) {
  const isQueryLevelMonitor =
    _.get(monitor, 'monitor_type', MONITOR_TYPE.QUERY_LEVEL) === MONITOR_TYPE.QUERY_LEVEL;
  return isQueryLevelMonitor
    ? queryLevelTriggerToFormik(trigger, monitor)
    : bucketLevelTriggerToFormik(trigger, monitor);
}

export function queryLevelTriggerToFormik(trigger, monitor) {
  const {
    id,
    name,
    severity,
    condition: { script },
    actions,
    min_time_between_executions: minTimeBetweenExecutions,
    rolling_window_size: rollingWindowSize,
  } = trigger.query_level_trigger;
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

export function bucketLevelTriggerToFormik(trigger, monitor) {
  const {
    id,
    name,
    severity,
    condition,
    condition: { script, composite_agg_filter },
    actions,
    min_time_between_executions: minTimeBetweenExecutions,
    rolling_window_size: rollingWindowSize,
  } = trigger.bucket_level_trigger;

  const bucketSelector = JSON.stringify(condition, null, 4);
  const triggerConditions = getBucketLevelTriggerConditions(condition);
  const where = getWhereExpression(composite_agg_filter);

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
    bucketSelector,
    actions: getBucketLevelTriggerActions(actions),
    triggerConditions,
    minTimeBetweenExecutions,
    rollingWindowSize,
    thresholdEnum,
    thresholdValue,
    where,
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

export function getBucketLevelTriggerActions(actions) {
  const executionPolicyPath = 'action_execution_policy.action_execution_scope';
  return _.cloneDeep(actions).map((action) => {
    const actionExecutionPolicy = _.get(action, `${executionPolicyPath}`);
    switch (_.keys(actionExecutionPolicy)[0]) {
      case NOTIFY_OPTIONS_VALUES.PER_ALERT:
        const actionableAlerts = _.get(
          action,
          `${executionPolicyPath}.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`,
          []
        );
        return _.set(
          action,
          `${executionPolicyPath}.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`,
          actionableAlerts.map((entry) => {
            return { value: entry, label: ACTIONABLE_ALERTS_OPTIONS_LABELS[entry] };
          })
        );
      case NOTIFY_OPTIONS_VALUES.PER_EXECUTION:
        return _.set(action, `${executionPolicyPath}`, NOTIFY_OPTIONS_VALUES.PER_EXECUTION);
    }
  });
}

export function getBucketLevelTriggerConditions(condition) {
  return segmentArray(condition.script.source, 4).map((conditionArray) =>
    convertToTriggerCondition(conditionArray, condition)
  );
}

export function convertToTriggerCondition(conditionArray, condition) {
  const { buckets_path, gap_policy, parent_bucket_path, script } = condition;
  // TODO: Should move this to utils somewhere
  const relationalEnumOptions = {
    '>': 'ABOVE',
    '<': 'BELOW',
    '==': 'EXACTLY',
  };
  const logicalEnumOptions = {
    '&&': 'AND',
    '||': 'OR',
  };

  let queryMetric;
  let thresholdEnum;
  let thresholdValue;
  let andOrCondition;
  if (conditionArray.length === 4) {
    andOrCondition = logicalEnumOptions[conditionArray[0]];
    // TODO: Removing 'params'
    queryMetric = conditionArray[1].replace(/params\./g, '');
    thresholdEnum = relationalEnumOptions[conditionArray[2]];
    thresholdValue = conditionArray[3];
  } else {
    andOrCondition = FORMIK_INITIAL_TRIGGER_CONDITION_VALUES.andOrCondition;
    // TODO: Removing 'params'
    queryMetric = conditionArray[0].replace(/params\./g, '');
    thresholdEnum = relationalEnumOptions[conditionArray[1]];
    thresholdValue = conditionArray[2];
  }

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

export function getWhereExpression(composite_agg_filter) {
  if (composite_agg_filter === undefined) return;

  const fields = _.keys(composite_agg_filter);
  const field = fields[0];

  const fieldName = fields.map((field) => ({ label: field, type: `keyword` }));
  const operator = _.keys(composite_agg_filter[field])[0];
  const fieldValue = composite_agg_filter[field][operator];

  return {
    fieldName: fieldName,
    operator: operator,
    fieldValue: fieldValue,
  };
}

export function segmentArray(scriptSource, segmentSize) {
  const conditions = scriptSource.split(/\s/);
  const output = [];
  // TODO: Limiting the first segment since it should not include the and/or
  //  condition but this should be moved elsewhere if segmentArray is to be kept generic
  if (conditions.length > 0) output.push(conditions.slice(0, segmentSize - 1));
  for (let i = 3; i < conditions.length; i += segmentSize) {
    const segment = conditions.slice(i, i + segmentSize);
    output.push(segment);
  }
  return output;
}
