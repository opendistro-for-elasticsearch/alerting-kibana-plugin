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
import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';

import { APP_PATH } from '../../../../../utils/constants';
import { PLUGIN_NAME } from '../../../../../../utils/constants';

const filterText =
  'There are no destinations matching your applied filters. Reset your filters to view all destinations.';
const emptyText = 'There are no existing destinations. Add a destination.';
const createDestinationButton = (
  <EuiButton fill href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DESTINATION}`}>
    Add destination
  </EuiButton>
);

const resetFiltersButton = resetFilters => (
  <EuiButton fill onClick={resetFilters}>
    Reset filters
  </EuiButton>
);

const propTypes = {
  isFilterApplied: PropTypes.bool.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};

const EmptyDestinations = ({ isFilterApplied, onResetFilters }) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <p>{isFilterApplied ? filterText : emptyText}</p>
      </EuiText>
    }
    actions={isFilterApplied ? resetFiltersButton(onResetFilters) : createDestinationButton}
  />
);

EmptyDestinations.propTypes = propTypes;

export default EmptyDestinations;
