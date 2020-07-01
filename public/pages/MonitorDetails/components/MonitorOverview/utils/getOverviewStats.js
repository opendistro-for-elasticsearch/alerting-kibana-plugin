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

import getScheduleFromMonitor from './getScheduleFromMonitor';
import { DEFAULT_EMPTY_DATA, SEARCH_TYPE } from '../../../../../utils/constants';

// TODO: used in multiple places, move into helper
function getTime(time) {
  // TODO: Use Kibanas saved timezone (if there is one, if not THEN default to using browser)
  const momentTime = moment.tz(time, moment.tz.guess());
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a z');
  return DEFAULT_EMPTY_DATA;
}

function getMonitorType(searchType) {
  switch (searchType) {
    case SEARCH_TYPE.GRAPH:
      return 'Visual Graph';
    case SEARCH_TYPE.AD:
      return 'Anomaly Detector';
    case SEARCH_TYPE.HTTP:
      return 'HTTP Input';
    default:
      return 'Extraction Query';
  }
}

export default function getOverviewStats(monitor, monitorId, monitorVersion, activeCount) {
  const searchType = _.get(monitor, 'ui_metadata.search.searchType', 'query');
  return [
    {
      header: 'State',
      value: monitor.enabled ? 'Enabled' : 'Disabled',
    },
    {
      header: 'Monitor definition type',
      value: getMonitorType(searchType),
    },
    {
      header: 'Total active alerts',
      value: activeCount,
    },
    {
      header: 'Schedule',
      value: getScheduleFromMonitor(monitor),
    },
    {
      header: 'Last updated',
      value: getTime(monitor.last_update_time),
    },
    {
      header: 'Monitor ID',
      value: monitorId,
    },
    {
      header: 'Monitor version number',
      value: monitorVersion,
    },
  ];
}
