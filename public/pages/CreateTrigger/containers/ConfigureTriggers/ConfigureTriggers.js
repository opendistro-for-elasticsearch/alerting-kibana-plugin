/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React from 'react';
import { EuiSpacer } from '@elastic/eui';
import ContentPanel from '../../../../components/ContentPanel';
import _ from 'lodash';
import DefineAggregationTrigger from '../DefineAggregationTrigger';
import AddTriggerButton from '../../components/AddTriggerButton';
import TriggerEmptyPrompt from '../../components/TriggerEmptyPrompt';
import { MAX_TRIGGERS } from '../../../MonitorDetails/containers/Triggers/Triggers';

class ConfigureTriggers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      triggerDeleted: false,
    };
  }

  renderTriggers = (triggerArrayHelpers) => {
    const {
      context,
      executeResponse,
      monitor,
      monitorValues,
      onRun,
      setFlyout,
      triggers,
      triggerValues,
      isDarkMode,
      dataTypes,
      httpClient,
      notifications,
    } = this.props;
    const hasTriggers = !_.isEmpty(triggerValues.aggregationTriggers);
    return hasTriggers ? (
      triggerValues.aggregationTriggers.map((trigger, index) => (
        <div>
          <DefineAggregationTrigger
            triggerArrayHelpers={triggerArrayHelpers}
            context={context}
            executeResponse={executeResponse}
            monitor={monitor}
            monitorValues={monitorValues}
            onRun={onRun}
            setFlyout={setFlyout}
            triggers={triggers}
            triggerValues={triggerValues}
            isDarkMode={isDarkMode}
            dataTypes={dataTypes}
            triggerIndex={index}
            httpClient={httpClient}
            notifications={notifications}
          />
          <EuiSpacer size={'s'} />
        </div>
      ))
    ) : (
      <TriggerEmptyPrompt arrayHelpers={triggerArrayHelpers} />
    );
  };

  render() {
    const { triggerArrayHelpers, triggerValues } = this.props;
    const disableAddTriggerButton =
      _.get(triggerValues, 'aggregationTriggers', []).length >= MAX_TRIGGERS;
    const numOfTriggers = _.get(triggerValues, 'aggregationTriggers', []).length;
    const displayAddTriggerButton = numOfTriggers > 0;
    return (
      <ContentPanel
        title={`Triggers (${numOfTriggers})`}
        titleSize={'s'}
        panelStyles={{ paddingBottom: '0px', paddingLeft: '20px' }}
        bodyStyles={{ paddingLeft: '0px', padding: '20px' }}
        horizontalRuleClassName={'accordion-horizontal-rule'}
      >
        {this.renderTriggers(triggerArrayHelpers)}

        {displayAddTriggerButton ? (
          <div>
            <EuiSpacer size={'s'} />
            <AddTriggerButton
              arrayHelpers={triggerArrayHelpers}
              disabled={disableAddTriggerButton}
            />
          </div>
        ) : null}
      </ContentPanel>
    );
  }
}

export default ConfigureTriggers;
