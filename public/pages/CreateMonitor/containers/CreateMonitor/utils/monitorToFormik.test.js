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
import monitorToFormik from './monitorToFormik';

import { FORMIK_INITIAL_VALUES, MATCH_ALL_QUERY } from './constants';

const exampleMonitor = {
  name: 'Example Monitor',
  enabled: true,
  schedule: {
    cron: { expression: '0 0 0/2 * * ?' },
  },
  inputs: [
    {
      search: {
        indices: ['test-index'],
        query: JSON.parse(MATCH_ALL_QUERY),
      },
    },
  ],
  triggers: [],
  ui_metadata: {
    schedule: {
      cronExpression: '0 0 0/2 * * ?',
      period: {
        unit: 'MINUTES',
        interval: 1,
      },
      daily: {
        hours: 0,
        gmt: -1,
      },
      monthly: {
        type: 'day',
        day: 1,
        ordinal: 'day',
      },
      weekly: {
        tue: false,
        wed: false,
        thur: false,
        sat: false,
        fri: false,
        mon: false,
        sun: false,
      },
      frequency: 'cronExpression',
    },
    search: {
      aggregationType: 'count',
      fieldName: '',
      timeField: 'somefield',
      overDocuments: 'all documents',
      searchType: 'graph',
      bucketValue: 1,
      groupedOverTop: 5,
      bucketUnitOfTime: 'h',
      groupedOverFieldName: 'bytes',
    },
  },
};

describe('monitorToFormik', () => {
  test("returns default formik values when monitor doesn't exist", () => {
    const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
    const monitor = null;
    expect(monitorToFormik(monitor)).toEqual(formikValues);
  });

  describe('extracts', () => {
    test('simple fields from monitor', () => {
      const formikValues = monitorToFormik(exampleMonitor);
      expect(formikValues.name).toBe(exampleMonitor.name);
      expect(formikValues.disabled).toBe(!exampleMonitor.enabled);
      expect(formikValues.query).toBe(
        JSON.stringify(exampleMonitor.inputs[0].search.query, null, 4)
      );
      expect(formikValues.index).toEqual(
        exampleMonitor.inputs[0].search.indices.map(index => ({ label: index }))
      );
    });

    test('empty fieldName from monitor', () => {
      const formikValues = monitorToFormik(exampleMonitor);
      expect(formikValues.fieldName).toEqual([]);
    });

    test('fieldName from monitor', () => {
      const localExampleMonitor = _.cloneDeep(exampleMonitor);
      localExampleMonitor.ui_metadata.search.fieldName = 'bytes';
      const formikValues = monitorToFormik(localExampleMonitor);
      expect(formikValues.fieldName).toEqual([{ label: 'bytes' }]);
    });

    test('timeField from monitor', () => {
      const localExampleMonitor = _.cloneDeep(exampleMonitor);
      const formikValues = monitorToFormik(localExampleMonitor);
      expect(formikValues.timeField).toBe(localExampleMonitor.ui_metadata.search.timeField);
    });

    test('default cronExpression when monitor has period schedule', () => {
      const localExampleMonitor = _.cloneDeep(exampleMonitor);
      localExampleMonitor.schedule = { period: { interval: 1, unit: 'MINUTES' } };
      const formikValues = monitorToFormik(localExampleMonitor);
      expect(formikValues.cronExpression).toBe(FORMIK_INITIAL_VALUES.cronExpression);
    });
    test('can build AD monitor', () => {
      const adMonitor = _.cloneDeep(exampleMonitor);
      adMonitor.ui_metadata.search.searchType = 'ad';
      adMonitor.inputs = [
        {
          search: {
            indices: ['.opendistro-anomaly-results*'],
            query: {
              aggregations: { max_anomaly_grade: { max: { field: 'anomaly_grade' } } },
              query: {
                bool: {
                  filter: [
                    {
                      range: {
                        end_time: {
                          from: '{{period_end}}||-2m',
                          include_lower: true,
                          include_upper: true,
                          to: '{{period_end}}',
                        },
                      },
                    },
                    {
                      term: {
                        detector_id: {
                          value: 'zIqG0nABwoJjo1UZKHnL',
                        },
                      },
                    },
                  ],
                },
              },
              size: 1,
              sort: [{ anomaly_grade: { order: 'desc' } }, { confidence: { order: 'desc' } }],
            },
          },
        },
      ];
      const formikValues = monitorToFormik(adMonitor);
      expect(formikValues.detectorId).toBe('zIqG0nABwoJjo1UZKHnL');
      expect(formikValues.query).toContain('zIqG0nABwoJjo1UZKHnL');
    });
  });
});
