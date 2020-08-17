import { OPERATORS_MAP } from '../../../components/MonitorExpressions/expressions/utils/constants';
import { URL_TYPE } from '../../../../Destinations/containers/CreateDestination/utils/constants';

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

export const BUCKET_COUNT = 5;

export const MATCH_ALL_QUERY = JSON.stringify({ size: 0, query: { match_all: {} } }, null, 4);

export const FORMIK_INITIAL_VALUES = {
  /* CONFIGURE MONITOR */
  name: '',
  disabled: false,
  frequency: 'interval',
  timezone: [],
  daily: 0,
  period: { interval: 1, unit: 'MINUTES' },
  weekly: { mon: false, tue: false, wed: false, thur: false, fri: false, sat: false, sun: false },
  monthly: { type: 'day', day: 1 },
  cronExpression: '0 */1 * * *',

  /* DEFINE MONITOR */
  searchType: 'graph',
  http: {
    urlType: URL_TYPE.FULL_URL,
    url: '',
    scheme: 'https',
    host: '',
    port: '',
    path: '',
    queryParams: [
      {
        key: '',
        value: '',
      },
    ],
    connection_timeout: 5,
    socket_timeout: 60,
  },
  index: [],
  timeField: '',
  query: MATCH_ALL_QUERY,
  aggregationType: 'count',
  fieldName: [],
  overDocuments: 'all documents',
  groupedOverTop: 5,
  groupedOverFieldName: 'bytes',
  bucketValue: 1,
  bucketUnitOfTime: 'h', // m = minute, h = hour, d = day
  where: {
    fieldName: [],
    operator: OPERATORS_MAP.IS,
    fieldValue: '',
    fieldRangeStart: 0,
    fieldRangeEnd: 0,
  },
  detectorId: '',
};
