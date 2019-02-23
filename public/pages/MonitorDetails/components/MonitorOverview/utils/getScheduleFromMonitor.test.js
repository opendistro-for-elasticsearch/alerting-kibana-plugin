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

import getScheduleFromMonitor from './getScheduleFromMonitor';

describe('getScheduleFromMonitor', () => {
  const uiMetadata = {
    schedule: {
      frequency: 'interval',
      period: { interval: 5, unit: 'MINUTES' },
      daily: 0,
      weekly: {
        mon: false,
        tue: true,
        wed: false,
        thur: false,
        fri: false,
        sat: false,
        sun: false,
      },
      monthly: { type: 'day', day: 1, ordinal: 'day' },
      cronExpression: '0 0 0/1 * * ?',
      timezone: 'America/Los_Angeles',
    },
  };
  const periodMonitor = {
    schedule: { period: { interval: 5, unit: 'MINUTES' } },
  };
  const cronMonitor = {
    schedule: { cron: { expression: '0 0 0/1 * * ?', timezone: 'America/Los_Angeles' } },
  };
  test('can get schedule from period when there is no ui_metadata', () => {
    expect(getScheduleFromMonitor(periodMonitor)).toBe(
      `Every ${
        periodMonitor.schedule.period.interval
      } ${periodMonitor.schedule.period.unit.toLowerCase()}`
    );
  });

  test('can get schedule from cron when there is no ui_metadata', () => {
    expect(getScheduleFromMonitor(cronMonitor)).toBe(
      `${cronMonitor.schedule.cron.expression} ${cronMonitor.schedule.cron.timezone}`
    );
  });

  test('can get interval from ui_metadata', () => {
    expect(getScheduleFromMonitor({ ui_metadata: uiMetadata })).toBe(
      `Every ${
        uiMetadata.schedule.period.interval
      } ${uiMetadata.schedule.period.unit.toLowerCase()}`
    );
  });

  test('can get daily from ui_metadata', () => {
    expect(
      getScheduleFromMonitor({
        ui_metadata: { schedule: { ...uiMetadata.schedule, frequency: 'daily' } },
      })
    ).toBe(`Every day around 12:00 am PST`);
  });

  test('can get weekly from ui_metadata', () => {
    expect(
      getScheduleFromMonitor({
        ui_metadata: { schedule: { ...uiMetadata.schedule, frequency: 'weekly' } },
      })
    ).toBe(`Every Tuesday around 12:00 am PST`);
  });

  test('can get monthly (type = day) from ui_metadata', () => {
    expect(
      getScheduleFromMonitor({
        ui_metadata: { schedule: { ...uiMetadata.schedule, frequency: 'monthly' } },
      })
    ).toBe(`Every month on the 1st around 12:00 am PST`);
  });

  test('can get cron from ui_metadata', () => {
    expect(
      getScheduleFromMonitor({
        ui_metadata: { schedule: { ...uiMetadata.schedule, frequency: 'cronExpression' } },
      })
    ).toBe(`${uiMetadata.schedule.cronExpression}`);
  });

  test('can render default when nothing matches', () => {
    expect(getScheduleFromMonitor({})).toBe(`-`);
  });

  test('can render default when parsing error', () => {
    expect(getScheduleFromMonitor({ schedule: { period: {} } })).toBe(`-`);
  });
});
