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

import { Frequency, FrequencyPicker } from './Frequencies';
import SubHeader from '../../../../components/SubHeader';

const Schedule = () => (
  <Fragment>
    <SubHeader
      title={<h4>Schedule</h4>}
      description={<strong>When do you want this monitor to run?</strong>}
    />
    <EuiSpacer size="s" />
    <div style={{ maxWidth: '400px' }}>
      <Frequency />
      <FrequencyPicker />
    </div>
  </Fragment>
);

export default Schedule;
