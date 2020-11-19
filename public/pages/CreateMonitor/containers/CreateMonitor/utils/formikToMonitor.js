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
import moment from 'moment-timezone';
import { BUCKET_COUNT } from './constants';
import { SEARCH_TYPE } from '../../../../../utils/constants';
import { OPERATORS_QUERY_MAP } from './whereFilters';

export function formikToMonitor(values) {
  const uiSchedule = formikToUiSchedule(values);
  const schedule = buildSchedule(values.frequency, uiSchedule);
  const uiSearch = formikToUiSearch(values);
  return {
    name: values.name,
    type: 'monitor',
    enabled: !values.disabled,
    schedule,
    inputs: [formikToSearch(values)],
    triggers: [],
    ui_metadata: {
      schedule: uiSchedule,
      search: uiSearch,
    },
  };
}

export function formikToInputs(values) {
  const isAD = values.searchType === SEARCH_TYPE.AD;
  return [isAD ? formikToAd(values) : formikToSearch(values)];
}

export function formikToSearch(values) {
  const isAD = values.searchType === SEARCH_TYPE.AD;
  let query = isAD ? formikToAdQuery(values) : formikToQuery(values);
  const indices = isAD ? ['.opendistro-anomaly-results*'] : formikToIndices(values);

  return {
    search: {
      indices,
      query,
    },
  };
}

export function formikToAdQuery(values) {
  return {
    size: 1,
    sort: [{ anomaly_grade: 'desc' }, { confidence: 'desc' }],
    query: {
      bool: {
        filter: [
          {
            range: {
              execution_end_time: {
                from: '{{period_end}}||-' + values.period.interval + 'm',
                to: '{{period_end}}',
                include_lower: true,
                include_upper: true,
              },
            },
          },
          {
            term: {
              detector_id: {
                value: values.detectorId,
              },
            },
          },
        ],
      },
    },
    aggregations: {
      max_anomaly_grade: {
        max: {
          field: 'anomaly_grade',
        },
      },
    },
  };
}

export function formikToAd(values) {
  return {
    anomaly_detector: {
      detector_id: values.detectorId,
    },
  };
}
export function formikToUiSearch(values) {
  const {
    searchType,
    aggregationType,
    timeField,
    fieldName: [{ label: fieldName = '' } = {}],
    overDocuments,
    groupedOverTop,
    groupedOverFieldName,
    bucketValue,
    bucketUnitOfTime,
    where,
  } = values;
  return {
    searchType,
    aggregationType,
    timeField,
    fieldName,
    overDocuments,
    groupedOverTop,
    groupedOverFieldName,
    bucketValue,
    bucketUnitOfTime,
    where,
  };
}

export function formikToIndices(values) {
  return values.index.map(({ label }) => label);
}

export function formikToQuery(values) {
  const isGraph = values.searchType === SEARCH_TYPE.GRAPH;
  return isGraph ? formikToGraphQuery(values) : formikToExtractionQuery(values);
}

export function formikToExtractionQuery(values) {
  return JSON.parse(values.query);
}

export function formikToGraphQuery(values) {
  const { bucketValue, bucketUnitOfTime } = values;
  const whenAggregation = formikToWhenAggregation(values);
  const timeField = values.timeField;
  const filters = [
    {
      range: {
        [timeField]: {
          gte: `{{period_end}}||-${Math.round(bucketValue)}${bucketUnitOfTime}`,
          lte: '{{period_end}}',
          format: 'epoch_millis',
        },
      },
    },
  ];
  const whereClause = formikToWhereClause(values);
  if (whereClause) {
    filters.push({ ...whereClause });
  }
  return {
    size: 0,
    aggregations: whenAggregation,
    query: {
      bool: {
        filter: filters,
      },
    },
  };
}

export function formikToUiGraphQuery(values) {
  const { bucketValue, bucketUnitOfTime } = values;
  const overAggregation = formikToUiOverAggregation(values);
  const timeField = values.timeField;
  const filters = [
    {
      range: {
        [timeField]: {
          // default range window to [BUCKET_COUNT] * the date histogram interval
          gte: `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`,
          lte: 'now',
        },
      },
    },
  ];
  const whereClause = formikToWhereClause(values);
  if (whereClause) {
    filters.push({ ...whereClause });
  }
  return {
    size: 0,
    aggregations: overAggregation,
    query: {
      bool: {
        filter: filters,
      },
    },
  };
}

export function formikToUiOverAggregation(values) {
  const whenAggregation = formikToWhenAggregation(values);
  const { bucketValue, bucketUnitOfTime } = values;
  const timeField = values.timeField;

  return {
    over: {
      date_histogram: {
        field: timeField,
        interval: `${bucketValue}${bucketUnitOfTime}`,
        time_zone: moment.tz.guess(),
        min_doc_count: 0,
        extended_bounds: {
          min: `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`,
          max: 'now',
        },
      },
      aggregations: whenAggregation,
    },
  };
}

export function formikToWhereClause({ where }) {
  if (where.fieldName.length > 0) {
    return OPERATORS_QUERY_MAP[where.operator].query(where);
  }
}

export function formikToWhenAggregation(values) {
  const {
    aggregationType,
    fieldName: [{ label: field } = {}],
  } = values;
  if (aggregationType === 'count' || !field) return {};
  return { when: { [aggregationType]: { field } } };
}

export function formikToUiSchedule(values) {
  return {
    timezone: _.get(values, 'timezone[0].label', null),
    frequency: values.frequency,
    period: values.period,
    daily: values.daily,
    weekly: values.weekly,
    monthly: values.monthly,
    cronExpression: values.cronExpression,
  };
}

export function buildSchedule(scheduleType, values) {
  const {
    period,
    daily,
    weekly,
    monthly: { type, day },
    cronExpression,
    timezone,
  } = values;
  switch (scheduleType) {
    case 'interval': {
      return { period };
    }
    case 'daily': {
      return { cron: { expression: `0 ${daily} * * *`, timezone } };
    }
    case 'weekly': {
      const daysOfWeek = Object.entries(weekly)
        .filter(([day, checked]) => checked)
        .map(([day]) => day.toUpperCase())
        .join(',');
      return { cron: { expression: `0 ${daily} * * ${daysOfWeek}`, timezone } };
    }
    case 'monthly': {
      let dayOfMonth = '?';
      if (type === 'day') {
        dayOfMonth = day;
      }
      return { cron: { expression: `0 ${daily} ${dayOfMonth} */1 *`, timezone } };
    }
    case 'cronExpression':
      return { cron: { expression: cronExpression, timezone } };
  }
}
