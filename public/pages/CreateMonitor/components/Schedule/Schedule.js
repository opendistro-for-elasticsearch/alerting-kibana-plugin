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
import { EuiSpacer, EuiText } from '@elastic/eui';

import { Frequency, FrequencyPicker } from './Frequencies';
import Interval from './Frequencies/Interval';

const Schedule = ({ isAd }) => (
  <Fragment>
    <EuiText size="xs" style={{ paddingLeft: '10px', maxWidth: '400px' }}>
      {isAd ? (
        <p>
          Define how often the monitor collects data and determines how often you may receive
          alerts. We recommend two times of detector interval to avoid missing anomaly results due
          to any potential delay of processing time.
        </p>
      ) : (
        'When do you want this monitor to run?'
      )}
    </EuiText>
    <EuiSpacer size="s" />
    <div style={{ maxWidth: '400px' }}>
      {isAd ? (
        <Interval />
      ) : (
        <div>
          <Frequency />
          <FrequencyPicker />
        </div>
      )}
    </div>
  </Fragment>
);

export default Schedule;
