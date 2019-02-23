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

//TODO:: Confirm text with PM / UX
export const formatTooltip = ({ meta = {}, state: dataPointState }) => {
  const formatHintDisplayDate = date => moment(date).format('MMM Do YYYY, h:mm A');
  if (dataPointState == TIME_SERIES_ALERT_STATE.NO_ALERTS) {
    return meta.startTime && meta.endTime
      ? [
          {
            title: 'No Alerts',
            value: `Between ${formatHintDisplayDate(meta.startTime)} and ${formatHintDisplayDate(
              meta.endTime
            )}`,
          },
        ]
      : [];
  } else {
    const alertsToolTip = [];
    alertsToolTip.push({
      title: 'Alert Started at',
      value: formatHintDisplayDate(meta.startTime),
    });

    if (meta.acknowledgedTime) {
      alertsToolTip.push({
        title: 'Alert Acknowledged at',
        value: formatHintDisplayDate(meta.acknowledgedTime),
      });
    }

    if (meta.endTime) {
      alertsToolTip.push({
        title: 'Alert Ended at',
        value: formatHintDisplayDate(meta.endTime),
      });
    }

    alertsToolTip.push({
      title: 'State',
      value: meta.state,
    });

    if (meta.errorsCount) {
      alertsToolTip.push({
        title: 'Errors',
        value: meta.errorsCount,
      });
    }

    return alertsToolTip;
  }
};
