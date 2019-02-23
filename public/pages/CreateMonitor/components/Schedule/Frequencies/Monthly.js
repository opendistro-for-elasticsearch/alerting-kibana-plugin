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
import { EuiFlexItem, EuiFlexGroup } from '@elastic/eui';

import Daily from './Daily';
import { FormikFieldNumber, FormikSelect } from '../../../../../components/FormControls';
import { isInvalid, hasError, validateMonthlyDay } from '../../../../../utils/validate';
import { monthlyTypes } from './utils/constants';

const Monthly = () => (
  <Fragment>
    <EuiFlexGroup alignItems="flexEnd" style={{ paddingLeft: '10px', marginTop: '5px' }}>
      <EuiFlexItem style={{ marginTop: '0px' }}>
        <FormikSelect
          name="monthly.type"
          formRow
          rowProps={{
            label: 'On the',
            isInvalid,
            error: hasError,
            style: { marginTop: '0px' },
          }}
          inputProps={{
            options: monthlyTypes,
            onChange: (e, field, form) => {
              form.setFieldValue('monthly.type', e.target.value);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem style={{ marginTop: '0px' }}>
        <FormikFieldNumber
          name="monthly.day"
          formRow
          fieldProps={{ validate: validateMonthlyDay }}
          rowProps={{
            isInvalid,
            error: hasError,
            style: { marginTop: '0px' },
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
    <Daily />
  </Fragment>
);

export default Monthly;
