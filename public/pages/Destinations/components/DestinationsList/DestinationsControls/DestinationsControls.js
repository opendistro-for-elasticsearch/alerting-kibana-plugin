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
import PropTypes from 'prop-types';
import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiPagination, EuiSelect } from '@elastic/eui';
import { DESTINATION_OPTIONS } from '../../../utils/constants';

const filterTypes = [{ value: 'ALL', text: 'All type' }, ...DESTINATION_OPTIONS];

const propTypes = {
  activePage: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  search: PropTypes.string,
  type: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  onPageClick: PropTypes.func.isRequired,
};

const defaultProps = {
  search: '',
  type: 'ALL',
};

const DestinationsControls = ({
  activePage,
  pageCount,
  search,
  type,
  onSearchChange,
  onTypeChange,
  onPageClick,
}) => (
  <EuiFlexGroup style={{ padding: '0px 5px' }}>
    <EuiFlexItem>
      <EuiFieldSearch
        fullWidth={true}
        value={search}
        placeholder="Search"
        onChange={onSearchChange}
      />
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiSelect options={filterTypes} value={type} onChange={onTypeChange} />
    </EuiFlexItem>
    <EuiFlexItem grow={false} style={{ justifyContent: 'center' }}>
      <EuiPagination pageCount={pageCount} activePage={activePage} onPageClick={onPageClick} />
    </EuiFlexItem>
  </EuiFlexGroup>
);

DestinationsControls.propTypes = propTypes;

DestinationsControls.defaultProps = defaultProps;

export default DestinationsControls;
