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
import PropTypes from 'prop-types';
import moment from 'moment';
import { EuiFlexGroup, EuiFlexItem, EuiDatePickerRange, EuiDatePicker } from '@elastic/eui';
import { MAX_DAYS_ALLOWED_IN_RANGE } from './utils/constants';
import { isToday, getRangeMaxTime } from './utils/timeUtils';

class DateRangePicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rangeStartDateTime: {
        ...this.getStartDatePickerProps(props.initialStartTime, props.initialStartTime),
      },
      rangeEndDateTime: {
        ...this.getEndDatePickerProps(props.initialStartTime, props.initialEndTime),
      },
    };
  }

  getStartDatePickerProps = startDateTime => {
    return {
      selected: startDateTime.isAfter(moment()) ? moment().startOf('day') : startDateTime,
      minTime: startDateTime.clone().startOf('day'),
      maxTime: getRangeMaxTime(startDateTime),
      maxDate: moment(),
    };
  };

  getEndDatePickerProps = (startDateTime, endDateTime) => {
    const maxDate = startDateTime.clone().add(MAX_DAYS_ALLOWED_IN_RANGE, 'days');
    const now = moment();
    return {
      selected: endDateTime,
      minTime: endDateTime.clone().startOf('day'),
      maxTime: getRangeMaxTime(endDateTime),
      maxDate: maxDate > now ? now : maxDate,
      injectTimes: isToday(endDateTime) ? [now] : [],
    };
  };

  handleChangeStart = startDateTime => {
    const { onRangeChange } = this.props;
    this.setState(state => {
      // If preselected endTime is out of range / grater than start update end time accordingly
      let endTime = state.rangeEndDateTime.selected;
      if (endTime.isSame(startDateTime)) {
        endTime = startDateTime.clone().add(30, 'm');
      } else if (
        endTime.isBefore(startDateTime) ||
        endTime.diff(startDateTime, 'days') > MAX_DAYS_ALLOWED_IN_RANGE
      ) {
        endTime = startDateTime.clone().add(1, 'd');
      }
      onRangeChange(startDateTime, endTime);
      return {
        rangeStartDateTime: {
          ...this.getStartDatePickerProps(startDateTime, endTime),
        },
        rangeEndDateTime: {
          ...this.getEndDatePickerProps(startDateTime, endTime),
        },
      };
    });
  };

  handleChangeEnd = endDateTime => {
    const { onRangeChange } = this.props;
    this.setState(({ rangeStartDateTime, rangeEndDateTime }) => {
      let startTime = rangeStartDateTime.selected;
      if (startTime.isSame(endDateTime)) {
        startTime = endDateTime.clone().subtract(30, 'm');
      } else if (startTime.isAfter(endDateTime)) {
        startTime = endDateTime.clone().subtract(30, 'm');
      }
      onRangeChange(startTime, endDateTime);
      return {
        rangeStartDateTime: {
          ...rangeStartDateTime,
          selected: startTime,
        },
        rangeEndDateTime: {
          ...rangeEndDateTime,
          selected: endDateTime,
        },
      };
    });
  };
  render() {
    const { rangeStartDateTime, rangeEndDateTime } = this.state;
    return (
      <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
        <EuiFlexItem grow={false} style={{ padding: '0 10px' }}>
          <EuiDatePickerRange
            fullWidth
            startDateControl={
              <EuiDatePicker
                selected={rangeStartDateTime.selected}
                onChange={this.handleChangeStart}
                startDate={rangeStartDateTime.selected}
                endDate={rangeEndDateTime.selected}
                isInvalid={rangeStartDateTime.selected > rangeStartDateTime.selected}
                aria-label="Start date"
                showTimeSelect
                popperClassName="euiRangePicker--popper"
                readOnly
                shouldCloseOnSelect
                {...rangeStartDateTime}
              />
            }
            endDateControl={
              <EuiDatePicker
                selected={rangeEndDateTime.selected}
                onChange={this.handleChangeEnd}
                startDate={rangeStartDateTime.selected}
                endDate={rangeEndDateTime.selected}
                isInvalid={rangeStartDateTime.selected > rangeStartDateTime.selected}
                aria-label="End date"
                showTimeSelect
                popperClassName="euiRangePicker--popper"
                readOnly
                shouldCloseOnSelect
                {...rangeEndDateTime}
              />
            }
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

DateRangePicker.propTypes = {
  onRangeChange: PropTypes.func.isRequired,
};

export default DateRangePicker;
