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

import { FormikSelect } from '../../../../../components/FormControls';
import { isInvalid, hasError } from '../../../../../utils/validate';

const frequencies = [
  { value: 'interval', text: 'By interval' },
  { value: 'daily', text: 'Daily' },
  { value: 'weekly', text: 'Weekly' },
  { value: 'monthly', text: 'Monthly' },
  { value: 'cronExpression', text: 'Custom cron expression' },
];

const Frequency = () => (
  <FormikSelect
    name="frequency"
    formRow
    rowProps={{
      label: 'Frequency',
      style: { paddingLeft: '10px' },
      isInvalid,
      error: hasError,
    }}
    inputProps={{
      options: frequencies,
      isInvalid,
    }}
  />
);

export default Frequency;
