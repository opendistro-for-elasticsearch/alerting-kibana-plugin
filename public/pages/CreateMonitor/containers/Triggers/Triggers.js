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
import 'brace/mode/plain_text';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import CustomTrigger from '../CustomTrigger';
import ContentPanel from '../../../../components/ContentPanel';

const propTypes = {
  context: PropTypes.object.isRequired,
  executeResponse: PropTypes.object,
  monitorValues: PropTypes.object.isRequired,
  onRun: PropTypes.func.isRequired,
  setFlyout: PropTypes.func.isRequired,
  triggers: PropTypes.arrayOf(PropTypes.object).isRequired,
  triggerValues: PropTypes.object.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

const Triggers = ({
  context,
  executeResponse,
  monitorValues,
  onRun,
  setFlyout,
  triggers,
  triggerValues,
  isDarkMode,
}) => {
  return (
    <ContentPanel title="Triggers (count)" titleSize="s" bodyStyles={{ padding: '20px 20px' }}>
      <CustomTrigger
        context={context}
        executeResponse={executeResponse}
        monitorValues={monitorValues}
        onRun={onRun}
        setFlyout={setFlyout}
        triggers={triggers}
        triggerValues={triggerValues}
        isDarkMode={isDarkMode}
      />
      <EuiSpacer />
      <EuiButton>Add another trigger</EuiButton>
    </ContentPanel>
  );
};

Triggers.propTypes = propTypes;

export default Triggers;
