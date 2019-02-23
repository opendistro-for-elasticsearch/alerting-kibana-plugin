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

export const isToday = currentDate => currentDate.isSame(moment(Date.now()), 'day');

export const getRangeMaxTime = currentDate =>
  isToday(currentDate) ? moment(Date.now()) : currentDate.clone().endOf('day');

/*
    This function will find an interval (Moment Duration), Which will be within 30 days.
    Don't use if duration is more than 30 days.
*/
export const calculateInterval = duration => {
  const bucketWindows = [
    moment.duration(1, 'd'),
    moment.duration(18, 'hour'),
    moment.duration(12, 'hour'),
    moment.duration(6, 'hour'),
    moment.duration(3, 'hour'),
    moment.duration(1, 'hour'),
    moment.duration(30, 'minute'), // 15 - 24 hrs
    moment.duration(20, 'minute'), // 8- 14 hrs
    moment.duration(10, 'minute'), // 5-8 hrs
    moment.duration(5, 'minute'), // 3-5 hrs
    moment.duration(3, 'minute'), // 2-3 hrs
    moment.duration(1, 'minute'), // < 1 hr
  ];

  const target = Math.ceil(duration / 30); // Minimum Number of buckets

  // if target is less than a minute to get, just fall back to 1 minutes
  if (target < moment.duration(1, 'minute')) {
    return moment.duration(1, 'minute');
  }

  for (let i = 0; i < bucketWindows.length; i++) {
    if (bucketWindows[i] <= target) {
      return bucketWindows[i];
    }
  }
};
