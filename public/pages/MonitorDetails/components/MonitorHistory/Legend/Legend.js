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
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import { ALERT_TIMELINE_COLORS_MAP } from '../../../containers/MonitorHistory/utils/constants';

const timeSeriesLegend = [
  {
    title: 'Triggered',
    color: ALERT_TIMELINE_COLORS_MAP.TRIGGERED,
  },
  {
    title: 'Error',
    color: ALERT_TIMELINE_COLORS_MAP.ERROR,
  },
  {
    title: 'Acknowledge',
    color: ALERT_TIMELINE_COLORS_MAP.ACKNOWLEDGED,
  },
  {
    title: 'No alerts',
    color: ALERT_TIMELINE_COLORS_MAP.NO_ALERTS,
  },
];

const Legend = () => (
  <EuiFlexGroup style={{ marginLeft: '20px' }} alignItems="center">
    {timeSeriesLegend.map(legendItem => (
      <EuiFlexItem grow={false} key={legendItem.title}>
        <EuiFlexGroup gutterSize="xs" style={{ height: '30px' }} alignItems="center">
          <EuiFlexItem style={{ height: '30px' }}>
            <div
              style={{
                height: '100%',
                width: '15px',
                backgroundColor: legendItem.color,
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="xs">{legendItem.title}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    ))}
  </EuiFlexGroup>
);

export default Legend;
