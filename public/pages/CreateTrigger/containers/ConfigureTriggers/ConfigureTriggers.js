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
import { EuiHorizontalRule } from '@elastic/eui';
import ContentPanel from '../../../../components/ContentPanel';
import _ from 'lodash';
import DefineBucketLevelTrigger from '../DefineBucketLevelTrigger';
import AddTriggerButton from '../../components/AddTriggerButton';
import TriggerEmptyPrompt from '../../components/TriggerEmptyPrompt';
import { MAX_TRIGGERS } from '../../../MonitorDetails/containers/Triggers/Triggers';
import DefineTrigger from '../DefineTrigger';
import { MONITOR_TYPE, SEARCH_TYPE } from '../../../../utils/constants';
import { getPathsPerDataType } from '../../../CreateMonitor/containers/DefineMonitor/utils/mappings';
import monitorToFormik from '../../../CreateMonitor/containers/CreateMonitor/utils/monitorToFormik';
import { buildSearchRequest } from '../../../CreateMonitor/containers/DefineMonitor/utils/searchRequests';
import { backendErrorNotification } from '../../../../utils/helpers';
import moment from 'moment';
import { formikToTrigger } from '../CreateTrigger/utils/formikToTrigger';

class ConfigureTriggers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataTypes: {},
      executeResponse: null,
      isBucketLevelMonitor:
        _.get(props, 'monitor.monitor_type', MONITOR_TYPE.QUERY_LEVEL) ===
        MONITOR_TYPE.BUCKET_LEVEL,
      triggerDeleted: false,
    };

    this.onQueryMappings = this.onQueryMappings.bind(this);
    this.onRunExecute = this.onRunExecute.bind(this);
  }

  componentDidMount() {
    if (this.state.isBucketLevelMonitor) this.onQueryMappings();
  }

  componentDidUpdate(prevProps) {
    const prevMonitorType = _.get(prevProps, 'monitor.monitor_type', MONITOR_TYPE.QUERY_LEVEL);
    const currMonitorType = _.get(this.props, 'monitor.monitor_type', MONITOR_TYPE.QUERY_LEVEL);
    if (prevMonitorType !== currMonitorType)
      _.set(this.state, 'isBucketLevelMonitor', currMonitorType);

    const prevInputs = prevProps.monitor.inputs[0];
    const currInputs = this.props.monitor.inputs[0];
    if (!_.isEqual(prevInputs, currInputs)) {
      if (this.state.isBucketLevelMonitor) this.onQueryMappings();
    }
  }

  onRunExecute = (triggers = []) => {
    const { httpClient, monitor, notifications } = this.props;
    const formikValues = monitorToFormik(monitor);
    const searchType = formikValues.searchType;
    const monitorToExecute = _.cloneDeep(monitor);
    _.set(monitorToExecute, 'triggers', triggers);

    switch (searchType) {
      case SEARCH_TYPE.QUERY:
      case SEARCH_TYPE.GRAPH:
        const searchRequest = buildSearchRequest(formikValues);
        _.set(monitorToExecute, 'inputs[0].search', searchRequest);
        break;
      default:
        console.log(`Unsupported searchType found: ${JSON.stringify(searchType)}`, searchType);
    }

    httpClient
      .post('../api/alerting/monitors/_execute', { body: JSON.stringify(monitorToExecute) })
      .then((resp) => {
        if (resp.ok) {
          this.setState({ executeResponse: resp.resp });
        } else {
          // TODO: need a notification system to show errors or banners at top
          console.error('err:', resp);
          backendErrorNotification(notifications, 'run', 'trigger', resp.resp);
        }
      })
      .catch((err) => {
        console.log('err:', err);
      });
  };

  async queryMappings(index) {
    if (!index.length) {
      return {};
    }

    try {
      const response = await this.props.httpClient.post('../api/alerting/_mappings', {
        body: JSON.stringify({ index }),
      });
      if (response.ok) {
        return response.resp;
      }
      return {};
    } catch (err) {
      throw err;
    }
  }

  async onQueryMappings() {
    const indices = this.props.monitor.inputs[0].search.indices;
    try {
      const mappings = await this.queryMappings(indices);
      const dataTypes = getPathsPerDataType(mappings);
      this.setState({ dataTypes });
    } catch (err) {
      console.error('There was an error getting mappings for query', err);
    }
  }

  getTriggerContext = (executeResponse, monitor, values) => {
    return {
      periodStart: moment.utc(_.get(executeResponse, 'period_start', Date.now())).format(),
      periodEnd: moment.utc(_.get(executeResponse, 'period_end', Date.now())).format(),
      results: [_.get(executeResponse, 'input_results.results[0]')].filter((result) => !!result),
      trigger: formikToTrigger(values, _.get(this.props.monitor, 'ui_metadata', {})),
      alert: null,
      error: null,
      monitor: monitor,
    };
  };

  renderTriggers = (triggerArrayHelpers) => {
    const {
      edit,
      monitor,
      monitorValues,
      setFlyout,
      triggers,
      triggerValues,
      isDarkMode,
      httpClient,
      notifications,
    } = this.props;
    const { dataTypes, executeResponse, isBucketLevelMonitor } = this.state;
    const hasTriggers = !_.isEmpty(_.get(triggerValues, 'triggerDefinitions'));
    return hasTriggers ? (
      triggerValues.triggerDefinitions.map((trigger, index) => {
        return (
          <div key={index}>
            {isBucketLevelMonitor ? (
              <DefineBucketLevelTrigger
                edit={edit}
                triggerArrayHelpers={triggerArrayHelpers}
                context={this.getTriggerContext(executeResponse, monitor, triggerValues)}
                executeResponse={executeResponse}
                monitor={monitor}
                monitorValues={monitorValues}
                onRun={this.onRunExecute}
                setFlyout={setFlyout}
                triggers={triggers}
                triggerValues={triggerValues}
                isDarkMode={isDarkMode}
                dataTypes={dataTypes}
                triggerIndex={index}
                httpClient={httpClient}
                notifications={notifications}
              />
            ) : (
              <DefineTrigger
                edit={edit}
                triggerArrayHelpers={triggerArrayHelpers}
                context={this.getTriggerContext(executeResponse, monitor, triggerValues)}
                executeResponse={executeResponse}
                monitor={monitor}
                monitorValues={monitorValues}
                onRun={this.onRunExecute}
                setFlyout={setFlyout}
                triggers={triggers}
                triggerValues={triggerValues}
                isDarkMode={isDarkMode}
                triggerIndex={index}
                httpClient={httpClient}
                notifications={notifications}
              />
            )}
            <EuiHorizontalRule margin={'s'} />
          </div>
        );
      })
    ) : (
      <TriggerEmptyPrompt arrayHelpers={triggerArrayHelpers} />
    );
  };

  render() {
    const { triggerArrayHelpers, triggerValues } = this.props;
    const disableAddTriggerButton =
      _.get(triggerValues, 'triggerDefinitions', []).length >= MAX_TRIGGERS;
    const numOfTriggers = _.get(triggerValues, 'triggerDefinitions', []).length;
    const displayAddTriggerButton = numOfTriggers > 0;
    return (
      <ContentPanel
        title={`Triggers (${numOfTriggers})`}
        titleSize={'s'}
        panelStyles={{ paddingBottom: '0px', paddingLeft: '20px', paddingRight: '20px' }}
        bodyStyles={{ paddingLeft: '0px', padding: '10px' }}
        horizontalRuleClassName={'accordion-horizontal-rule'}
      >
        {this.renderTriggers(triggerArrayHelpers)}

        {displayAddTriggerButton ? (
          <div style={{ paddingBottom: '20px', paddingTop: '15px' }}>
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
