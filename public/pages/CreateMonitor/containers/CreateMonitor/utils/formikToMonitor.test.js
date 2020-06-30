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
  formikToWhereClause,
  formikToAd,
  formikToInputs,
  formikToSearch,
  formikToHttp,
  formikToFullUrl,
  formikToCustomUrl,
} from './formikToMonitor';

import { FORMIK_INITIAL_VALUES } from './constants';
import { OPERATORS_MAP } from '../../../components/MonitorExpressions/expressions/utils/constants';

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
  test('can build monitor', () => {
    expect(formikToMonitor(formikValues)).toMatchSnapshot();
  });
});

describe('formikToInputs', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  test('can call formikToSearch', () => {
    expect(formikToInputs(formikValues)).toMatchSnapshot();
  });
  test('can call formikToHttp', () => {
    formikValues.searchType = 'http';
    expect(formikToInputs(formikValues)).toMatchSnapshot();
  });
});

describe('formikToSearch', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  test('can build search for non-AD monitor', () => {
    expect(formikToSearch(formikValues)).toMatchSnapshot();
  });
  test('can build search for AD monitor', () => {
    formikValues.searchType = 'ad';
    expect(formikToSearch(formikValues)).toMatchSnapshot();
  });
});

describe('formikToDetector', () => {
  test('can build detector', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    formikValues.detectorId = 'temp_detector';
    expect(formikToAd(formikValues)).toMatchSnapshot();
  });
});

describe('formikToHttp', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  test('can call formikToFullUrl', () => {
    expect(formikToHttp(formikValues)).toMatchSnapshot();
  });
  test('can call formikToCustomUrl', () => {
    formikValues.http.urlType = 'custom_url';
    expect(formikToHttp(formikValues)).toMatchSnapshot();
  });
});

describe('formikToFullUrl', () => {
  test('can build full url http request', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToFullUrl(formikValues)).toMatchSnapshot();
  });
});

describe('formikToCustomUrl', () => {
  test('can build custom url http request', () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    expect(formikToCustomUrl(formikValues)).toMatchSnapshot();
  });
});

describe('formikToUiSearch', () => {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  formikValues.fieldName = [{ label: 'bytes' }];
  formikValues.timeField = '@timestamp';
  test('can build ui search', () => {
    expect(formikToUiSearch(formikValues)).toMatchSnapshot();
  });
  test('can build ui search with term where field', () => {
    formikValues.where = {
      fieldName: [{ label: 'age', type: 'number' }],
      operator: OPERATORS_MAP.IS_GREATER_EQUAL,
      fieldValue: 20,
    };
    expect(formikToUiSearch(formikValues)).toMatchSnapshot();
  });

  test('can build ui search with range where field', () => {
    formikValues.where = {
      fieldName: [{ label: 'age', type: 'number' }],
      operator: OPERATORS_MAP.IN_RANGE,
      fieldRangeStart: 20,
      fieldRangeEnd: 40,
    };
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

describe('formikToWhereClause', () => {
  const numericFieldName = [{ label: 'age', type: 'number' }];
  const textField = [{ label: 'city', type: 'text' }];
  const keywordField = [{ label: 'city.keyword', type: 'keyword' }];

  test.each([
    [numericFieldName, OPERATORS_MAP.IS, 20, { term: { age: 20 } }],
    [textField, OPERATORS_MAP.IS, 'Seattle', { match_phrase: { city: 'Seattle' } }],
    [numericFieldName, OPERATORS_MAP.IS_NOT, 20, { bool: { must_not: { term: { age: 20 } } } }],
    [
      textField,
      OPERATORS_MAP.IS_NOT,
      'Seattle',
      { bool: { must_not: { match_phrase: { city: 'Seattle' } } } },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_NULL,
      undefined,
      { bool: { must_not: { exists: { field: 'age' } } } },
    ],
    [numericFieldName, OPERATORS_MAP.IS_NOT_NULL, undefined, { exists: { field: 'age' } }],
    [numericFieldName, OPERATORS_MAP.IS_GREATER, 20, { range: { age: { gt: 20 } } }],
    [numericFieldName, OPERATORS_MAP.IS_GREATER_EQUAL, 20, { range: { age: { gte: 20 } } }],
    [numericFieldName, OPERATORS_MAP.IS_LESS, 20, { range: { age: { lt: 20 } } }],
    [numericFieldName, OPERATORS_MAP.IS_LESS_EQUAL, 20, { range: { age: { lte: 20 } } }],
    [textField, OPERATORS_MAP.STARTS_WITH, 'Se', { prefix: { city: 'Se' } }],
    [textField, OPERATORS_MAP.ENDS_WITH, 'Se', { wildcard: { city: '*Se' } }],
    [
      textField,
      OPERATORS_MAP.CONTAINS,
      'Se',
      { query_string: { query: `*Se*`, default_field: 'city' } },
    ],
    [keywordField, OPERATORS_MAP.CONTAINS, 'Se', { wildcard: { 'city.keyword': '*Se*' } }],
    [
      textField,
      OPERATORS_MAP.NOT_CONTAINS,
      'Se',
      { bool: { must_not: { query_string: { query: `*Se*`, default_field: 'city' } } } },
    ],
  ])('.formikToWhereClause (%j,  %S)', (fieldName, operator, fieldValue, expected) => {
    expect(formikToWhereClause({ where: { fieldName, operator, fieldValue } })).toEqual(expected);
  });
});
