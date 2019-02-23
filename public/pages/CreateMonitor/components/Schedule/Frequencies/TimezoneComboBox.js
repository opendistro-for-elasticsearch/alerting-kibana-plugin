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
import moment from 'moment-timezone';
import { FormikComboBox } from '../../../../../components/FormControls';
import { hasError, isInvalid, validateTimezone } from '../../../../../utils/validate';

const timezones = moment.tz.names().map(tz => ({ label: tz }));

const TimezoneComboBox = () => (
  <FormikComboBox
    name="timezone"
    formRow
    fieldProps={{ validate: validateTimezone }}
    rowProps={{
      isInvalid,
      error: hasError,
      style: { marginTop: '0px' },
    }}
    inputProps={{
      placeholder: 'Select a timezone',
      options: timezones,
      renderOption: ({ label: tz }) => `${tz} (${moment.tz(tz).format('Z')})`,
      onChange: (options, field, form) => {
        // EuiComboBox calls onBlur before onChange which causes the validation to happen before
        // the timezone field is set, so we do an extra validation here
        const error = validateTimezone(options);
        form.setFieldError('timezone', error);
        form.setFieldValue('timezone', options);
      },
      onBlur: (e, field, form) => {
        form.setFieldTouched('timezone', true);
      },
      singleSelection: { asPlainText: true },
      'data-test-subj': 'timezoneComboBox',
    }}
  />
);

export default TimezoneComboBox;
