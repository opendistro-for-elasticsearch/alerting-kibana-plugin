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
import { EuiFlexGrid } from '@elastic/eui';

import ContentPanel from '../../../../components/ContentPanel/index';
import OverviewStat from '../OverviewStat/index';
import getOverviewStats from './utils/getOverviewStats';

const MonitorOverview = ({ monitor, monitorId, monitorVersion, activeCount }) => {
  const items = getOverviewStats(monitor, monitorId, monitorVersion, activeCount);
  return (
    <ContentPanel title="Overview" titleSize="s">
      <EuiFlexGrid columns={4}>
        {items.map(props => (
          <OverviewStat key={props.header} {...props} />
        ))}
      </EuiFlexGrid>
    </ContentPanel>
  );
};

export default MonitorOverview;
