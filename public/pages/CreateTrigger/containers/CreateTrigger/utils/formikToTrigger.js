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
  AGGREGATION_RESULTS_PATH,
  ANOMALY_CONFIDENCE_RESULT_PATH,
  ANOMALY_GRADE_RESULT_PATH,
  FORMIK_INITIAL_TRIGGER_VALUES,
  HITS_TOTAL_RESULTS_PATH,
  NOT_EMPTY_RESULT,
  TRIGGER_TYPE,
} from './constants';
import { MONITOR_TYPE, SEARCH_TYPE } from '../../../../../utils/constants';

export function formikToTrigger(values, monitorUiMetadata = {}) {
  const triggerDefinitions = _.get(values, 'triggerDefinitions');
  return triggerDefinitions === undefined
    ? formikToTriggerDefinition(values, monitorUiMetadata)
    : formikToTriggerDefinitions(triggerDefinitions, monitorUiMetadata);
}

export function formikToTriggerDefinitions(values, monitorUiMetadata) {
  return values.map((trigger) => formikToTriggerDefinition(trigger, monitorUiMetadata));
}

export function formikToTriggerDefinition(values, monitorUiMetadata) {
  const isTraditionalMonitor =
    _.get(monitorUiMetadata, 'monitor_type', MONITOR_TYPE.TRADITIONAL) === MONITOR_TYPE.TRADITIONAL;
  return isTraditionalMonitor
    ? formikToTraditionalTrigger(values, monitorUiMetadata)
    : formikToAggregationTrigger(values, monitorUiMetadata);
}

export function formikToTraditionalTrigger(values, monitorUiMetadata) {
  const condition = formikToCondition(values, monitorUiMetadata);
  const actions = formikToAction(values);
  // TODO: We probably also want to wrap this with 'traditional_trigger' after
  //  confirming what will break in the frontend (when accessing the fields)
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

export function formikToAggregationTrigger(values, monitorUiMetadata) {
  const condition = formikToAggregationTriggerCondition(values, monitorUiMetadata);
  const actions = formikToAction(values);
  return {
    aggregation_trigger: {
      id: values.id,
      name: values.name,
      severity: values.severity,
      condition,
      actions: actions,
      min_time_between_executions: values.minTimeBetweenExecutions,
      rolling_window_size: values.rollingWindowSize,
    },
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
  switch (monitorUiMetadata.monitor_type) {
    case MONITOR_TYPE.TRADITIONAL:
      const searchType = _.get(monitorUiMetadata, 'search.searchType', 'query');
      const traditionalTriggersUiMetadata = {};
      _.get(values, 'triggerDefinitions', []).forEach((trigger) => {
        const { anomalyDetector, thresholdEnum, thresholdValue } = trigger;
        const triggerMetadata = { value: thresholdValue, enum: thresholdEnum };

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

        _.set(traditionalTriggersUiMetadata, `${trigger.name}`, triggerMetadata);
      });
      return traditionalTriggersUiMetadata;

    case MONITOR_TYPE.AGGREGATION:
      const aggregationTriggersUiMetadata = {};
      _.get(values, 'triggerDefinitions', []).forEach((trigger) => {
        const triggerMetadata = trigger.triggerConditions.map((condition) => ({
          value: condition.thresholdValue,
          enum: condition.thresholdEnum,
        }));
        _.set(aggregationTriggersUiMetadata, `${trigger.name}`, triggerMetadata);
      });
      return aggregationTriggersUiMetadata;
  }
}

export function formikToCondition(values, monitorUiMetadata = {}) {
  const { thresholdValue, thresholdEnum } = values;
  const searchType = _.get(monitorUiMetadata, 'search.searchType', 'query');
  const aggregationType = _.get(monitorUiMetadata, 'search.aggregationType', 'count');

  if (searchType === SEARCH_TYPE.QUERY || searchType === SEARCH_TYPE.LOCAL_URI)
    return { script: values.script };
  if (searchType === SEARCH_TYPE.AD) return getADCondition(values);

  const isCount = aggregationType === 'count';
  const resultsPath = getResultsPath(isCount);
  const operator = getRelationalOperator(thresholdEnum);
  return getCondition(resultsPath, operator, thresholdValue, isCount);
}

export function formikToAggregationTriggerCondition(values, monitorUiMetadata = {}) {
  const searchType = _.get(monitorUiMetadata, 'search.searchType', SEARCH_TYPE.QUERY);

  let bucketSelector = _.get(
    values,
    'bucketSelector',
    FORMIK_INITIAL_TRIGGER_VALUES.bucketSelector
  );
  try {
    // JSON.parse() throws an exception when the argument is a malformed JSON string.
    // This caused exceptions when tinkering with the JSON in the code editor.
    // This try/catch block will only parse the JSON string if it is not malformed.
    // It will otherwise store the JSON as a string for continued editing.
    bucketSelector = JSON.parse(bucketSelector);
  } catch (err) {}

  if (searchType === SEARCH_TYPE.QUERY) return bucketSelector;
  if (searchType === SEARCH_TYPE.GRAPH) return getAggregationTriggerCondition(values);
}

export function getADCondition(values) {
  const { anomalyDetector } = values;
  if (anomalyDetector.triggerType === TRIGGER_TYPE.AD) {
    const anomalyGradeOperator = getRelationalOperator(anomalyDetector.anomalyGradeThresholdEnum);
    const anomalyConfidenceOperator = getRelationalOperator(
      anomalyDetector.anomalyConfidenceThresholdEnum
    );
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

export function getAggregationTriggerCondition(values) {
  const conditions = values.triggerConditions;
  const bucketsPath = getBucketSelectorBucketsPath(conditions);
  const scriptSource = getBucketSelectorScriptSource(conditions);
  const composite_agg_filter = getCompositeAggFilter(values);

  return {
    parent_bucket_path: 'composite_agg',
    buckets_path: bucketsPath,
    script: {
      source: scriptSource,
    },
    composite_agg_filter: composite_agg_filter,
  };
}

export function getBucketSelectorBucketsPath(conditions) {
  const bucketsPath = {};
  conditions.forEach((condition) => {
    const { queryMetric } = condition;
    bucketsPath[queryMetric] = queryMetric;
  });
  return bucketsPath;
}

export function getBucketSelectorScriptSource(conditions) {
  const scriptSourceContents = [];
  conditions.forEach((condition) => {
    const { queryMetric, thresholdValue, thresholdEnum, andOrCondition } = condition;
    if (andOrCondition) {
      // TODO: If possible, adding parentheses around the AND statements of the resulting script
      //  would improve readability but it shouldn't affect the logical result
      const logicalOperator = getLogicalOperator(andOrCondition);
      scriptSourceContents.push(logicalOperator);
    }
    const relationalOperator = getRelationalOperator(thresholdEnum);
    const scriptCondition = `params.${queryMetric} ${relationalOperator} ${thresholdValue}`;
    scriptSourceContents.push(scriptCondition);
  });
  return scriptSourceContents.join(' ');
}

export function getResultsPath(isCount) {
  return isCount ? HITS_TOTAL_RESULTS_PATH : AGGREGATION_RESULTS_PATH;
}

export function getCompositeAggFilter({ where }) {
  const fieldName = _.get(where, 'fieldName', FORMIK_INITIAL_TRIGGER_VALUES.where.fieldName);
  const composite_agg_filter = {};
  if (fieldName.length > 0) {
    composite_agg_filter[where.fieldName[0].label] = {
      [where.operator]: where.fieldValue,
    };
    return composite_agg_filter;
  }
}

export function getRelationalOperator(thresholdEnum) {
  return { ABOVE: '>', BELOW: '<', EXACTLY: '==' }[thresholdEnum];
}

export function getLogicalOperator(logicalEnum) {
  return { AND: '&&', OR: '||' }[logicalEnum];
}
