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

import moment from 'moment';
import { TIME_SERIES_ALERT_STATE } from '../../../../containers/MonitorHistory/utils/constants';
import { formatTooltip } from './helpers';

describe('Helpers', () => {
  describe('formatToolTip should generate tool tip', () => {
    const dataPointMetaData = {
      startTime: moment('2018-10-29T09:15:00').valueOf(),
      acknowledgedTime: moment('2018-10-29T09:17:00').valueOf(),
      endTime: moment('2018-10-29T09:18:00').valueOf(),
    };
    test('for NO_ALERTS state', () => {
      expect(
        formatTooltip({
          meta: {
            ...dataPointMetaData,
            acknowledgedTime: null,
          },
          state: TIME_SERIES_ALERT_STATE.NO_ALERTS,
        })
      ).toMatchSnapshot();
    });
    test('with TRIGGERED state', () => {
      expect(
        formatTooltip({
          meta: {
            ...dataPointMetaData,
            acknowledgedTime: null,
            state: 'COMPLETED',
          },
          state: TIME_SERIES_ALERT_STATE.TRIGGERED,
        })
      ).toMatchSnapshot();
    });
    test('with Acknowledge Time', () => {
      expect(
        formatTooltip({
          meta: {
            ...dataPointMetaData,
            state: 'COMPLETED',
          },
          state: TIME_SERIES_ALERT_STATE.ACKNOWLEDGED,
        })
      ).toMatchSnapshot();
    });
    test('with an Active Alert ', () => {
      expect(
        formatTooltip({
          meta: {
            ...dataPointMetaData,
            endTime: null,
            state: 'ACTIVE',
          },
          state: TIME_SERIES_ALERT_STATE.ACKNOWLEDGED,
        })
      ).toMatchSnapshot();
    });
  });
});
