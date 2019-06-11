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
import { EuiSpacer } from '@elastic/eui';

import SubHeader from '../../../../components/SubHeader';
import { FormikCheckbox } from '../../../../components/FormControls';

const MonitorState = () => (
  <Fragment>
    <SubHeader
      title={<h4>Monitor state</h4>}
      description={<span>Disabled monitors do not run.</span>}
    />
    <EuiSpacer size="s" />
    <FormikCheckbox
      name="disabled"
      formRow
      rowProps={{ style: { paddingLeft: '10px' } }}
      inputProps={{ label: 'Disable monitor' }}
    />
  </Fragment>
);

export default MonitorState;
