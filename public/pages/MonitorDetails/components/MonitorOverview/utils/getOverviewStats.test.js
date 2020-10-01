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

import getOverviewStats from './getOverviewStats';
import { DEFAULT_EMPTY_DATA } from '../../../../../utils/constants';

describe('getOverviewStats', () => {
  test('can get stats', () => {
    const monitor = {
      enabled: true,
      user: {
        name: 'John Doe',
      },
    };
    const monitorId = 'sdfifsjeifjseif';
    const monitorVersion = 7;
    const activeCount = 17;
    expect(getOverviewStats(monitor, monitorId, monitorVersion, activeCount)).toEqual([
      {
        header: 'State',
        value: 'Enabled',
      },
      {
        header: 'Monitor definition type',
        value: 'Extraction Query',
      },
      {
        header: 'Total active alerts',
        value: activeCount,
      },
      {
        header: 'Schedule',
        value: DEFAULT_EMPTY_DATA,
      },
      {
        header: 'Last updated',
        value: DEFAULT_EMPTY_DATA,
      },
      {
        header: 'Monitor ID',
        value: monitorId,
      },
      {
        header: 'Monitor version number',
        value: monitorVersion,
      },
      {
        header: 'Last updated by',
        value: monitor.user.name,
      },
    ]);
  });
});
