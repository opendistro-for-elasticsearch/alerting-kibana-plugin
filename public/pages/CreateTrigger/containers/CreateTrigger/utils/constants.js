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

import { OPERATORS_MAP } from '../../../../CreateMonitor/components/MonitorExpressions/expressions/utils/constants';

export const TRIGGER_TYPE = {
  AD: 'anomaly_detector_trigger',
  ALERT_TRIGGER: 'alerting_trigger',
};

export const FORMIK_INITIAL_BUCKET_SELECTOR_VALUES = {
  buckets_path: {
    '': '',
  },
  parent_bucket_path: 'composite_agg',
  script: {
    source: 'params.',
  },
};

export const FORMIK_INITIAL_TRIGGER_CONDITION_VALUES = {
  thresholdValue: 10000,
  thresholdEnum: 'ABOVE',
  anomalyDetector: {
    triggerType: TRIGGER_TYPE.AD,
    anomalyGradeThresholdValue: 0.7,
    anomalyGradeThresholdEnum: 'ABOVE',
    anomalyConfidenceThresholdValue: 0.7,
    anomalyConfidenceThresholdEnum: 'ABOVE',
  },
  script: {
    lang: 'painless',
    source: 'ctx.results[0].hits.total.value > 0',
  },
  buckets_path: {},
  parent_bucket_path: 'composite_agg',
  gap_policy: '',
  queryMetric: '',
  andOrCondition: '',
};

export const FORMIK_INITIAL_TRIGGER_VALUES = {
  name: '',
  severity: '1',
  minTimeBetweenExecutions: null,
  rollingWindowSize: null,
  script: {
    lang: 'painless',
    source: `ctx.results[0].hits.total.value > 0`,
  },
  bucketSelector: JSON.stringify(FORMIK_INITIAL_BUCKET_SELECTOR_VALUES, null, 4), // TODO: To be used for Aggregation Triggers defined by query
  triggerConditions: [],
  thresholdValue: 10000,
  thresholdEnum: 'ABOVE',
  anomalyDetector: {
    triggerType: TRIGGER_TYPE.AD,
    anomalyGradeThresholdValue: 0.7,
    anomalyGradeThresholdEnum: 'ABOVE',
    anomalyConfidenceThresholdValue: 0.7,
    anomalyConfidenceThresholdEnum: 'ABOVE',
  },
  where: {
    fieldName: [],
    operator: OPERATORS_MAP.IS,
    fieldValue: '',
    fieldRangeStart: 0,
    fieldRangeEnd: 0,
  },
  actions: undefined,
};

export const HITS_TOTAL_RESULTS_PATH = 'ctx.results[0].hits.total.value';
export const AGGREGATION_RESULTS_PATH = 'ctx.results[0].aggregations.when.value';
export const ANOMALY_GRADE_RESULT_PATH = 'ctx.results[0].aggregations.max_anomaly_grade.value';
export const ANOMALY_CONFIDENCE_RESULT_PATH = 'ctx.results[0].hits.hits[0]._source.confidence';
export const NOT_EMPTY_RESULT =
  'ctx.results != null && ctx.results.length > 0 && ctx.results[0].aggregations != null && ctx.results[0].aggregations.max_anomaly_grade != null && ctx.results[0].hits.total.value > 0 && ctx.results[0].hits.hits[0]._source != null && ctx.results[0].hits.hits[0]._source.confidence != null';
