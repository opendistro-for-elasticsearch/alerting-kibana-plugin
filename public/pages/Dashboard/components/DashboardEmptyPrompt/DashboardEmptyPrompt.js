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

import { APP_PATH } from '../../../../utils/constants';
import { PLUGIN_NAME } from '../../../../../utils/constants';

const createMonitorText =
  'There are no existing alerts. Create a monitor to add triggers and actions. Once an alarm is triggered, the state will show in this table.';
const createTriggerText =
  'There are no existing alerts. Create a trigger to start alerting. Once an alarm is triggered, the state will show in this table.';
const createMonitorButton = (
  <EuiButton fill href={`${PLUGIN_NAME}#${APP_PATH.CREATE_MONITOR}`}>
    Create monitor
  </EuiButton>
);
const createTriggerButton = onCreateTrigger => (
  <EuiButton fill onClick={onCreateTrigger}>
    Create trigger
  </EuiButton>
);

const DashboardEmptyPrompt = ({ onCreateTrigger }) => {
  const inMonitorDetails = typeof onCreateTrigger === 'function';
  return (
    <EuiEmptyPrompt
      style={{ maxWidth: '45em' }}
      body={
        <EuiText>
          <p>{inMonitorDetails ? createTriggerText : createMonitorText}</p>
        </EuiText>
      }
      actions={inMonitorDetails ? createTriggerButton(onCreateTrigger) : createMonitorButton}
    />
  );
};

DashboardEmptyPrompt.propTypes = {
  onCreateTrigger: PropTypes.func,
};

export default DashboardEmptyPrompt;
