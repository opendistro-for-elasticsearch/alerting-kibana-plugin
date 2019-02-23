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
import * as timeUtils from '../timeUtils';
// import { calculateInterval, getRangeMaxTime, isToday } from '../timeUtils';

describe('Time Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getRangeMaxTime', () => {
    it('should return current time if date is today', () => {
      Date.now = jest.fn(() => 1539619200000);
      const currentTime = moment('2018-10-15T10:00:00');
      expect(timeUtils.getRangeMaxTime(currentTime).format()).toBe(moment(1539619200000).format());
    });
    it('should return end of day time ', () => {
      Date.now = jest.fn(() => 1539619200000);
      const currentTime = moment('2018-10-13T10:00:00');
      expect(timeUtils.getRangeMaxTime(currentTime).format()).toBe(
        currentTime
          .clone()
          .endOf('day')
          .format()
      );
    });
  });
  describe('calculateInterval should return ', () => {
    const moment = require('moment');
    it('moment duration object', () => {
      expect(moment.isDuration(timeUtils.calculateInterval(moment.duration(30, 'm')))).toBe(true);
    });

    it('1 minutes duration if duration is < 0 ', () => {
      expect(timeUtils.calculateInterval(moment.duration(0, 'ms')).asMinutes()).toBe(1);
    });

    it('1 minutes duration if difference is between 0 - 90 mins (< 1.5 hrs)', () => {
      expect(timeUtils.calculateInterval(moment.duration(20, 'm')).asMinutes()).toBe(1);
      expect(timeUtils.calculateInterval(moment.duration(30, 'm')).asMinutes()).toBe(1);
      expect(timeUtils.calculateInterval(moment.duration(50, 'm')).asMinutes()).toBe(1);
      expect(timeUtils.calculateInterval(moment.duration(80, 'm')).asMinutes()).toBe(1);
    });
    it('3 minutes duration if difference is between 90-140 mins (between 1.5 to 2.5 hours)', () => {
      expect(timeUtils.calculateInterval(moment.duration(1.5, 'h')).asMinutes()).toBe(3);
      expect(timeUtils.calculateInterval(moment.duration(1.6, 'h')).asMinutes()).toBe(3);
      expect(timeUtils.calculateInterval(moment.duration(2, 'h')).asMinutes()).toBe(3);
      expect(timeUtils.calculateInterval(moment.duration(2.2, 'h')).asMinutes()).toBe(3);
    });

    it('5 minutes duration if difference is between 2.5 to 5 hours', () => {
      expect(timeUtils.calculateInterval(moment.duration(2.5, 'h')).asMinutes()).toBe(5);
      expect(timeUtils.calculateInterval(moment.duration(3, 'h')).asMinutes()).toBe(5);
      expect(timeUtils.calculateInterval(moment.duration(3.2, 'h')).asMinutes()).toBe(5);
      expect(timeUtils.calculateInterval(moment.duration(3.4, 'h')).asMinutes()).toBe(5);
      expect(timeUtils.calculateInterval(moment.duration(4.99, 'h')).asMinutes()).toBe(5);
    });

    it('10 minutes duration if difference is between 5 to 9 hours', () => {
      expect(timeUtils.calculateInterval(moment.duration(5, 'h')).asMinutes()).toBe(10);
      expect(timeUtils.calculateInterval(moment.duration(6, 'h')).asMinutes()).toBe(10);
      expect(timeUtils.calculateInterval(moment.duration(7, 'h')).asMinutes()).toBe(10);
      expect(timeUtils.calculateInterval(moment.duration(8, 'h')).asMinutes()).toBe(10);
      expect(timeUtils.calculateInterval(moment.duration(9, 'h')).asMinutes()).toBe(10);
    });
    it('20 minutes duration if difference is between 10 to 15 hours', () => {
      expect(timeUtils.calculateInterval(moment.duration(10, 'h')).asMinutes()).toBe(20);
      expect(timeUtils.calculateInterval(moment.duration(13, 'h')).asMinutes()).toBe(20);
      expect(timeUtils.calculateInterval(moment.duration(14, 'h')).asMinutes()).toBe(20);
    });
    it('30 minutes duration if difference is between 16 to 24 hours', () => {
      expect(timeUtils.calculateInterval(moment.duration(15, 'h')).asMinutes()).toBe(30);
      expect(timeUtils.calculateInterval(moment.duration(23, 'h')).asMinutes()).toBe(30);
      expect(timeUtils.calculateInterval(moment.duration(24, 'h')).asMinutes()).toBe(30);
    });
    it('1 hour duration if difference is between 1 to 3 days', () => {
      expect(timeUtils.calculateInterval(moment.duration(2, 'd')).asHours()).toBe(1);
      expect(timeUtils.calculateInterval(moment.duration(3, 'd')).asHours()).toBe(1);
    });
    it('3 hours duration if difference is between 4 to 7 days', () => {
      expect(timeUtils.calculateInterval(moment.duration(4, 'd')).asHours()).toBe(3);
      expect(timeUtils.calculateInterval(moment.duration(5, 'd')).asHours()).toBe(3);
      expect(timeUtils.calculateInterval(moment.duration(7, 'd')).asHours()).toBe(3);
    });
    it('6 hours duration if difference is between 8 to 13 days', () => {
      expect(timeUtils.calculateInterval(moment.duration(8, 'd')).asHours()).toBe(6);
      expect(timeUtils.calculateInterval(moment.duration(9, 'd')).asHours()).toBe(6);
      expect(timeUtils.calculateInterval(moment.duration(12, 'd')).asHours()).toBe(6);
      expect(timeUtils.calculateInterval(moment.duration(14, 'd')).asHours()).toBe(6);
    });
    it('12 hours duration if difference is between 14 to 23 days', () => {
      expect(timeUtils.calculateInterval(moment.duration(15, 'd')).asHours()).toBe(12);
      expect(timeUtils.calculateInterval(moment.duration(19, 'd')).asHours()).toBe(12);
      expect(timeUtils.calculateInterval(moment.duration(21, 'd')).asHours()).toBe(12);
    });
    it('18 hours duration if difference is between 25 to 29 days', () => {
      expect(timeUtils.calculateInterval(moment.duration(25, 'd')).asHours()).toBe(18);
      expect(timeUtils.calculateInterval(moment.duration(26, 'd')).asHours()).toBe(18);
      expect(timeUtils.calculateInterval(moment.duration(29, 'd')).asHours()).toBe(18);
    });
    it('1 day duration if difference is more than 30 days', () => {
      expect(timeUtils.calculateInterval(moment.duration(31, 'd')).asDays()).toBe(1);
      expect(timeUtils.calculateInterval(moment.duration(36, 'd')).asDays()).toBe(1);
      expect(timeUtils.calculateInterval(moment.duration(40, 'd')).asDays()).toBe(1);
    });
  });
});
