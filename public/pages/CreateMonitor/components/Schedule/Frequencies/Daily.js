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
import { Field } from 'formik';
import moment from 'moment';
import { EuiFormRow, EuiDatePicker, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import TimezoneComboBox from './TimezoneComboBox';

const Daily = () => (
  <EuiFlexGroup direction="column" style={{ paddingLeft: '10px', marginTop: '5px' }}>
    <EuiFlexItem style={{ marginTop: '0px' }}>
      <Field
        name="daily"
        render={({
          field: { value, onChange, onBlur, ...rest },
          form: { touched, errors, setFieldValue },
        }) => (
          <EuiFormRow label="Around" style={{ marginTop: '0px' }}>
            <EuiDatePicker
              showTimeSelect
              showTimeSelectOnly
              selected={moment()
                .hours(value)
                .minutes(0)}
              onChange={date => {
                setFieldValue('daily', date.hours());
              }}
              dateFormat="hh:mm A"
              timeIntervals={60}
              {...rest}
            />
          </EuiFormRow>
        )}
      />
    </EuiFlexItem>
    <EuiFlexItem style={{ marginTop: '0px' }}>
      <TimezoneComboBox />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default Daily;
