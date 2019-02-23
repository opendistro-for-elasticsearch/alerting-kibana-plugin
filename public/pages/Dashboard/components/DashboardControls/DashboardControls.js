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
import { EuiFieldSearch, EuiFlexGroup, EuiSelect, EuiFlexItem, EuiPagination } from '@elastic/eui';

const severityOptions = [
  { value: 'ALL', text: 'All severity levels' },
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
  { value: '4', text: '4' },
  { value: '5', text: '5' },
];

const stateOptions = [
  { value: 'ALL', text: 'All alerts' },
  { value: 'ACTIVE', text: 'Active' },
  { value: 'ACKNOWLEDGED', text: 'Acknowledged' },
  { value: 'COMPLETED', text: 'Completed' },
  { value: 'ERROR', text: 'Error' },
];

const DashboardControls = ({
  activePage,
  pageCount,
  search,
  severity = severityOptions[0],
  state = stateOptions[0],
  onSearchChange,
  onSeverityChange,
  onStateChange,
  onPageChange,
}) => (
  <EuiFlexGroup style={{ padding: '0px 5px' }}>
    <EuiFlexItem>
      <EuiFieldSearch
        fullWidth={true}
        placeholder="Search"
        onChange={onSearchChange}
        value={search}
      />
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiSelect options={severityOptions} value={severity} onChange={onSeverityChange} />
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiSelect options={stateOptions} value={state} onChange={onStateChange} />
    </EuiFlexItem>
    <EuiFlexItem grow={false} style={{ justifyContent: 'center' }}>
      <EuiPagination pageCount={pageCount} activePage={activePage} onPageClick={onPageChange} />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default DashboardControls;
