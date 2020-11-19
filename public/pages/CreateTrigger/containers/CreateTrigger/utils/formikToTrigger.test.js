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
import { formikToTrigger, formikToTriggerUiMetadata, formikToCondition } from './formikToTrigger';

import { FORMIK_INITIAL_VALUES } from './constants';
import { SEARCH_TYPE } from '../../../../../utils/constants';

describe('formikToTrigger', () => {
  test('can create trigger', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToTrigger(formikValues)).toEqual({
      name: formikValues.name,
      severity: formikValues.severity,
      condition: { script: formikValues.script },
      actions: formikValues.actions,
      min_time_between_executions: formikValues.minTimeBetweenExecutions,
      rolling_window_size: formikValues.rollingWindowSize,
    });
  });
});

describe('formikToTriggerUiMetadata', () => {
  test('can create trigger metadata for AD monitors', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(
      formikToTriggerUiMetadata(formikValues, { search: { searchType: SEARCH_TYPE.AD } })
    ).toEqual({
      [formikValues.name]: {
        value: formikValues.thresholdValue,
        enum: formikValues.thresholdEnum,
        adTriggerMetadata: {
          triggerType: 'anomaly_detector_trigger',
          anomalyGrade: {
            value: 0.7,
            enum: 'ABOVE',
          },
          anomalyConfidence: {
            value: 0.7,
            enum: 'ABOVE',
          },
        },
      },
    });
  });

  test('can create metadata', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(
      formikToTriggerUiMetadata(formikValues, { search: { searchType: SEARCH_TYPE.QUERY } })
    ).toEqual({
      [formikValues.name]: {
        value: formikValues.thresholdValue,
        enum: formikValues.thresholdEnum,
      },
    });
  });
});

describe('formikToCondition', () => {
  test('can return condition when searchType is query', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToCondition(formikValues, { search: { searchType: 'query' } })).toEqual({
      script: formikValues.script,
    });
  });

  test('can return condition when searchType is ad', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToCondition(formikValues, { search: { searchType: 'ad' } })).toEqual({
      script: {
        lang: 'painless',
        source:
          'return ctx.results != null && ctx.results.length > 0 && ctx.results[0].aggregations.max_anomaly_grade.value != null && ctx.results[0].aggregations.max_anomaly_grade.value > 0.7 && ctx.results[0].hits.hits[0]._source.confidence > 0.7',
      },
    });
  });

  test('can return condition when there is no monitorUiMetadata', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToCondition(formikValues)).toEqual({ script: formikValues.script });
  });

  test('can return condition for count aggregation', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(
      formikToCondition(formikValues, { search: { searchType: 'graph', aggregationType: 'count' } })
    ).toEqual({ script: { lang: 'painless', source: `ctx.results[0].hits.total.value > 10000` } });
  });

  test('can return condition for other aggregations', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(
      formikToCondition(formikValues, { search: { searchType: 'graph', aggregationType: 'max' } })
    ).toEqual({
      script: {
        lang: 'painless',
        source: `return ctx.results[0].aggregations.when.value == null ? false : ctx.results[0].aggregations.when.value > 10000`,
      },
    });
  });
});
