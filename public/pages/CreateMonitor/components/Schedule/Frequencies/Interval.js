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
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';

import { FormikFieldNumber, FormikSelect } from '../../../../../components/FormControls';
import { isInvalid, hasError, validateInterval, validateUnit } from '../../../../../utils/validate';

const unitOptions = [
  { value: 'MINUTES', text: 'Minutes' },
  { value: 'HOURS', text: 'Hours' },
  { value: 'DAYS', text: 'Days' },
];

const Interval = () => (
  <EuiFlexGroup
    alignItems="flexStart"
    style={{ paddingLeft: '10px', marginTop: '5px' }}
    gutterSize="none"
  >
    <EuiFlexItem style={{ margin: '0px 10px 0px 0px' }}>
      <FormikFieldNumber
        name="period.interval"
        formRow
        fieldProps={{ validate: validateInterval }}
        rowProps={{
          label: 'Every',
          isInvalid,
          error: hasError,
        }}
        inputProps={{ icon: 'clock', min: 1 }}
      />
    </EuiFlexItem>
    <EuiFlexItem style={{ margin: '0px' }}>
      <FormikSelect
        name="period.unit"
        formRow
        fieldProps={{ validate: validateUnit }}
        rowProps={{
          hasEmptyLabelSpace: true,
          isInvalid,
          error: hasError,
        }}
        inputProps={{ options: unitOptions }}
      />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default Interval;
