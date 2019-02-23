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
import { EuiText, EuiTitle } from '@elastic/eui';

const messageFrequency = () => ({
  flyoutProps: {
    'aria-labelledby': 'messageFrequencyFlyout',
    maxWidth: 500,
    size: 'm',
  },
  headerProps: { hasBorder: true },
  header: (
    <EuiTitle size="m" style={{ fontSize: '25px' }}>
      <h2>
        <strong>Message frequency</strong>
      </h2>
    </EuiTitle>
  ),
  body: (
    <EuiText style={{ fontSize: '14px' }}>
      <p>
        Specify message frequency to limit the number of notifications you receive within a given
        span of time. This setting is especially useful for low severity trigger conditions.
      </p>
      <p>Consider the following example:</p>
      <ul>
        <li>A trigger condition is met.</li>
        <li>The monitor sends a message</li>
        <li>Message frequency is set to 10 minutes.</li>
      </ul>
      <p>
        For the next 10 minutes, even if a trigger condition is met dozens of times, the monitor
        sends no additional messages. If the trigger condition is met 11 minutes later, the monitor
        sends another message.
      </p>
    </EuiText>
  ),
});

export default messageFrequency;
