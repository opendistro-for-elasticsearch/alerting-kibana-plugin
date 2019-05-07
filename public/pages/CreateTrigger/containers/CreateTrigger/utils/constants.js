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

export const FORMIK_INITIAL_VALUES = {
  name: '',
  severity: '1',
  minTimeBetweenExecutions: null,
  rollingWindowSize: null,
  script: {
    lang: 'painless',
    source: `ctx.results[0].hits.total.value > 0`,
  },
  thresholdValue: 10000,
  thresholdEnum: 'ABOVE',
  actions: undefined,
};

export const HITS_TOTAL_RESULTS_PATH = 'ctx.results[0].hits.total.value';
export const AGGREGATION_RESULTS_PATH = 'ctx.results[0].aggregations.when.value';
