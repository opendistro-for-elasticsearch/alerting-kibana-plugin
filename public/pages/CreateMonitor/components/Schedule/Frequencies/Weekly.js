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

import React, { Fragment } from 'react';
import { Field } from 'formik';
import _ from 'lodash';
import { EuiFormRow, EuiFlexGroup, EuiFlexItem, EuiCheckbox } from '@elastic/eui';

import Daily from './Daily';

const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const checkboxFlexItem = (day, checked, setFieldValue, setFieldTouched) => (
  <EuiFlexItem key={day} grow={false} style={{ marginRight: '0px' }}>
    <EuiCheckbox
      id={day}
      label={_.startCase(day)}
      checked={checked}
      onChange={e => {
        setFieldValue(`weekly.${day}`, e.target.checked);
      }}
      onBlur={() => setFieldTouched('weekly')}
      compressed
    />
  </EuiFlexItem>
);

const validate = value => {
  const booleans = Object.values(value);
  if (!booleans.some(bool => bool)) return 'Must select at least one weekday';
};

const Weekly = () => (
  <Fragment>
    <Field
      name="weekly"
      validate={validate}
      render={({ field: { value }, form: { touched, errors, setFieldValue, setFieldTouched } }) => (
        <EuiFormRow
          label="Every"
          isInvalid={touched.weekly && !!errors.weekly}
          error={errors.weekly}
          style={{ paddingLeft: '10px', marginTop: '5px' }}
        >
          <EuiFlexGroup alignItems="center">
            {days.map(day => checkboxFlexItem(day, value[day], setFieldValue, setFieldTouched))}
          </EuiFlexGroup>
        </EuiFormRow>
      )}
    />
    <Daily />
  </Fragment>
);

export default Weekly;
