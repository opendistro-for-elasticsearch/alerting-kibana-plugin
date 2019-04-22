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
import { formikToTrigger, formikToThresholds, formikToCondition } from './formikToTrigger';

import { FORMIK_INITIAL_VALUES } from './constants';

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

describe('formikToThresholds', () => {
  test('can create thresholds', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToThresholds(formikValues)).toEqual({
      [formikValues.name]: { value: formikValues.thresholdValue, enum: formikValues.thresholdEnum },
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

  test('can return condition when there is no monitorUiMetadata', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToCondition(formikValues)).toEqual({ script: formikValues.script });
  });

  test('can return condition for count aggregation', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(
      formikToCondition(formikValues, { search: { searchType: 'graph', aggregationType: 'count' } })
    ).toEqual({ script: { lang: 'painless', source: `ctx.results[0].hits.total > 10000` } });
  });

  test('can return condition for other aggregations', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(
      formikToCondition(formikValues, { search: { searchType: 'graph', aggregationType: 'max' } })
    ).toEqual({
      script: { lang: 'painless', source: `return ctx.results[0].aggregations.when.value == null ? false : ctx.results[0].aggregations.when.value > 10000` },
    });
  });
});
