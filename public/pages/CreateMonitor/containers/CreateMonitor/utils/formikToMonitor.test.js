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
  formikToMonitor,
  formikToUiSearch,
  formikToIndices,
  formikToQuery,
  formikToExtractionQuery,
  formikToGraphQuery,
  formikToUiGraphQuery,
  formikToUiOverAggregation,
  formikToWhenAggregation,
  formikToUiSchedule,
  buildSchedule,
} from './formikToMonitor';

import { FORMIK_INITIAL_VALUES } from './constants';

jest.mock('moment-timezone', () => {
  const moment = require.requireActual('moment-timezone');
  moment.tz.guess = () => 'America/Los_Angeles';
  return moment;
});

describe('formikToMonitor', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  formikValues.name = 'random_name';
  formikValues.disabled = true;
  formikValues.index = [{ label: 'index1' }, { label: 'index2' }];
  formikValues.fieldName = [{ label: 'bytes' }];
  formikValues.timezone = [{ label: 'America/Los_Angeles' }];
  test.skip('can build monitor', () => {
    expect(formikToMonitor(formikValues)).toMatchSnapshot();
  });
});

describe('formikToUiSearch', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  formikValues.fieldName = [{ label: 'bytes' }];
  formikValues.timeField = '@timestamp';
  test('can build ui search', () => {
    expect(formikToUiSearch(formikValues)).toMatchSnapshot();
  });
});

describe('formikToIndices', () => {
  test('can build index', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    formikValues.index = [{ label: 'index1' }, { label: 'index2' }];
    expect(formikToIndices(formikValues)).toMatchSnapshot();
  });
});

describe('formikToQuery', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);

  test('can build graph query', () => {
    expect(formikToQuery({ ...formikValues, timeField: '@timestamp' })).toMatchSnapshot();
  });

  test('can build extraction query', () => {
    formikValues.searchType = 'query';
    expect(formikToQuery(formikValues)).toMatchSnapshot();
  });
});

describe('formikToExtractionQuery', () => {
  test('can extract query', () => {
    expect(formikToExtractionQuery(FORMIK_INITIAL_VALUES)).toMatchSnapshot();
  });
});

describe('formikToGraphQuery', () => {
  test('can build graph query', () => {
    expect(
      formikToGraphQuery({ ...FORMIK_INITIAL_VALUES, timeField: '@timestamp' })
    ).toMatchSnapshot();
  });
});

describe('formikToUiGraphQuery', () => {
  test('can build ui graph query', () => {
    expect(
      formikToUiGraphQuery({ ...FORMIK_INITIAL_VALUES, timeField: '@timestamp' })
    ).toMatchSnapshot();
  });
});

describe('formikToUiOverAggregation', () => {
  test('can build over aggregation', () => {
    expect(
      formikToUiOverAggregation({ ...FORMIK_INITIAL_VALUES, timeField: '@timestamp' })
    ).toMatchSnapshot();
  });
});

describe('formikToWhenAggregation', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);

  test('can build when (count) aggregation', () => {
    expect(formikToWhenAggregation(formikValues)).toMatchSnapshot();
  });

  test('can build when aggregation', () => {
    formikValues.aggregationType = 'avg';
    formikValues.fieldName = [{ label: 'bytes' }];
    expect(formikToWhenAggregation(formikValues)).toMatchSnapshot();
  });
});

describe('formikToUiSchedule', () => {
  test('can build uiSchedule', () => {
    expect(
      formikToUiSchedule({ ...FORMIK_INITIAL_VALUES, timezone: [{ label: 'America/Los_Angeles' }] })
    ).toMatchSnapshot();
  });
});

describe('buildSchedule', () => {
  let formikValues;
  let uiSchedule;
  beforeEach(() => {
    formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    formikValues.timezone = [{ label: 'America/Los_Angeles' }];
    uiSchedule = formikToUiSchedule(formikValues);
  });

  test('can build interval schedule', () => {
    expect(buildSchedule('interval', uiSchedule)).toMatchSnapshot();
  });

  test('can build daily schedule', () => {
    expect(buildSchedule('daily', uiSchedule)).toMatchSnapshot();
  });

  test('can build weekly schedule', () => {
    uiSchedule.weekly.tue = true;
    uiSchedule.weekly.thur = true;
    expect(buildSchedule('weekly', uiSchedule)).toMatchSnapshot();
  });

  test('can build monthly (day) schedule', () => {
    uiSchedule.monthly.type = 'day';
    expect(buildSchedule('monthly', uiSchedule)).toMatchSnapshot();
  });

  test('can build cron schedule', () => {
    expect(buildSchedule('cronExpression', uiSchedule)).toMatchSnapshot();
  });
});
