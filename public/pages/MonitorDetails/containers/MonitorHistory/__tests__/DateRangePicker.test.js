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

import React from 'react';
import moment from 'moment';
import { shallow, mount } from 'enzyme';
import DateRangePicker from '../DateRangePicker';

// jest.mock('moment', () => () => ({format: () => '2018–01–30T12:34:56+00:00'}));

describe('<DateRangePicker/>', () => {
  const initialStartTime = moment('2018-10-15T09:00:00');
  const initialEndTime = initialStartTime.clone().add(2, 'd');
  test('should initialize with initial start and end time', () => {
    const wrapper = shallow(
      <DateRangePicker
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onRangeChange={jest.fn()}
      />
    );
    expect(wrapper.update().state().rangeStartDateTime.selected).toBe(initialStartTime);
    expect(
      wrapper
        .update()
        .state()
        .rangeEndDateTime.selected.format()
    ).toBe(initialEndTime.format());
  });
  test('should generate correct min / max times', () => {
    const wrapper = shallow(
      <DateRangePicker
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onRangeChange={jest.fn()}
      />
    );
    expect(
      wrapper
        .update()
        .state()
        .rangeStartDateTime.minTime.format()
    ).toBe(
      initialStartTime
        .clone()
        .startOf('day')
        .format()
    );
    expect(
      wrapper
        .update()
        .state()
        .rangeStartDateTime.minTime.format()
    ).toBe(
      initialStartTime
        .clone()
        .startOf('day')
        .format()
    );
    expect(
      wrapper
        .update()
        .state()
        .rangeEndDateTime.minTime.format()
    ).toBe(
      initialEndTime
        .clone()
        .startOf('day')
        .format()
    );
  });
  test.skip('outside range dates should be disabled', () => {
    const wrapper = mount(
      <DateRangePicker
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onRangeChange={jest.fn()}
      />
    );
    // Open End Range Calendar
    wrapper
      .find('input')
      .at(1)
      .simulate('click');
    // Navigate To Next
    wrapper.find('.react-datepicker__navigation--next').simulate('click');
    expect(wrapper.find('.react-datepicker__day--disabled').length).toBe(17);
  });

  describe.skip('should handle start date change correctly', () => {
    test('if selected date is within range', () => {
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      // Open Start Range Calendar
      wrapper
        .find('input')
        .at(0)
        .simulate('click');
      // Click on 10th Oct
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(9)
        .simulate('click');
      wrapper.update();
      expect(wrapper.state().rangeStartDateTime.selected.format()).toBe(
        moment('2018-10-10T09:00:00').format()
      );
      expect(wrapper.state().rangeEndDateTime.selected.format()).toBe(initialEndTime.format());
    });
    test('if selected date is outside of range, should update endTime', () => {
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      // Open End Range Calendar
      wrapper
        .find('input')
        .at(0)
        .simulate('click');
      // Navigate To Next
      wrapper.find('.react-datepicker__navigation--previous').simulate('click');
      // Click on 10th Sep
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(9)
        .simulate('click');
      wrapper.update();
      expect(wrapper.state().rangeStartDateTime.selected.format()).toBe(
        moment('2018-09-10T09:00:00').format()
      );
      expect(wrapper.state().rangeEndDateTime.selected.format()).toBe(
        moment('2018-09-11T09:00:00').format()
      );
    });
    test('if selected date is same as end date time, should update endTime', () => {
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      // Open End Range Calendar
      wrapper
        .find('input')
        .at(0)
        .simulate('click');
      // Click on 10th Oct
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(16)
        .simulate('click');
      wrapper.update();
      expect(wrapper.state().rangeStartDateTime.selected.format()).toBe(
        moment('2018-10-17T09:00:00').format()
      );
      expect(wrapper.state().rangeEndDateTime.selected.format()).toBe(
        initialEndTime
          .clone()
          .add(30, 'm')
          .format()
      );
    });
    test('if selected date is after current end date time, should update endTime', () => {
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      // Open End Range Calendar
      wrapper
        .find('input')
        .at(0)
        .simulate('click');
      // Click on 18 th Oct
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(17)
        .simulate('click');
      wrapper.update();
      expect(wrapper.state().rangeStartDateTime.selected.format()).toBe(
        moment('2018-10-18T09:00:00').format()
      );
      expect(wrapper.state().rangeEndDateTime.selected.format()).toBe(
        initialEndTime
          .clone()
          .add(2, 'd')
          .format()
      );
    });
    test('should call onRangeChange with correct start / end Date', () => {
      const mockedOnRangeChange = jest.fn();
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={mockedOnRangeChange}
        />
      );
      // Open End Range Calendar
      wrapper
        .find('input')
        .at(0)
        .simulate('click');
      // Click on 18 th Oct
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(17)
        .simulate('click');
      wrapper.update();
      expect(mockedOnRangeChange).toHaveBeenCalledTimes(1);
      expect(mockedOnRangeChange).toHaveBeenCalledWith(
        wrapper.state().rangeStartDateTime.selected,
        wrapper.state().rangeEndDateTime.selected
      );
    });
  });
  describe.skip('should handle end date change correctly', () => {
    test('if selected date is within range', () => {
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      // Open End Range Calendar
      wrapper
        .find('input')
        .at(1)
        .simulate('click');
      // Click on 15 th Oct
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(14)
        .simulate('click');
      wrapper.update();
      expect(wrapper.state().rangeStartDateTime.selected.format()).toBe(
        moment('2018-10-15T08:30:00').format()
      );
      expect(wrapper.state().rangeEndDateTime.selected.format()).toBe(initialStartTime.format());
    });

    test('if selected date is outside of range, should update startTime', () => {
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      // Open End Range Calendar
      wrapper
        .find('input')
        .at(1)
        .simulate('click');
      // Click on 13 th Oct
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(12)
        .simulate('click');
      wrapper.update();
      expect(wrapper.state().rangeStartDateTime.selected.format()).toBe(
        moment('2018-10-13 08:30:00').format()
      );
      expect(wrapper.state().rangeEndDateTime.selected.format()).toBe(
        moment('2018-10-13 09:00:00').format()
      );
    });

    test('if selected date is within range', () => {
      const wrapper = mount(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      // Open End Range Calendar
      wrapper
        .find('input')
        .at(1)
        .simulate('click');
      // Click on 25 th Oct
      wrapper
        .find('.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .at(26)
        .simulate('click');
      wrapper.update();
      expect(wrapper.state().rangeStartDateTime.selected.format()).toBe(initialStartTime.format());
      expect(wrapper.state().rangeEndDateTime.selected.format()).toBe(
        moment('2018-10-27T09:00:00').format()
      );
    });
  });
});
