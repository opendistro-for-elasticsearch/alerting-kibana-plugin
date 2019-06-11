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
import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import AddActionButton from '../AddActionButton';
import { PLUGIN_NAME } from '../../../../../utils/constants';

const actionEmptyText = 'Add an action to perform when this trigger is triggered.';
const destinationEmptyText =
  'There are no existing destinations. Add a destinations to create an action';
const createDestinationButton = (
  <EuiButton fill href={`${PLUGIN_NAME}#/create-destination`}>
    Add destination
  </EuiButton>
);
const addActionButton = arrayHelpers => <AddActionButton arrayHelpers={arrayHelpers} />;

const ActionEmptyPrompt = ({ arrayHelpers, hasDestinations }) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <p>{hasDestinations ? actionEmptyText : destinationEmptyText}</p>
      </EuiText>
    }
    actions={hasDestinations ? addActionButton(arrayHelpers) : createDestinationButton}
  />
);

export default ActionEmptyPrompt;
