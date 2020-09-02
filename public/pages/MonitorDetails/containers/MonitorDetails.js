/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { Component, Fragment } from 'react';
import { get } from 'lodash';
import queryString from 'query-string';
import {
  EuiButton,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiIcon,
  EuiToolTip,
} from '@elastic/eui';

import CreateMonitor from '../../CreateMonitor';
import CreateTrigger from '../../CreateTrigger';
import MonitorOverview from '../components/MonitorOverview';
import MonitorHistory from './MonitorHistory';
import Dashboard from '../../Dashboard/containers/Dashboard';
import Triggers from './Triggers';
import {
  MONITOR_ACTIONS,
  TRIGGER_ACTIONS,
  KIBANA_AD_PLUGIN,
  MONITOR_INPUT_DETECTOR_ID,
} from '../../../utils/constants';
import { migrateTriggerMetadata } from './utils/helpers';
import { formikToWhereClause } from '../../CreateMonitor/containers/CreateMonitor/utils/formikToMonitor';
import { displayText } from '../../CreateMonitor/components/MonitorExpressions/expressions/utils/whereHelpers';

export default class MonitorDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      monitor: null,
      monitorVersion: 0,
      ifSeqNo: 0,
      ifPrimaryTerm: 0,
      dayCount: 0,
      activeCount: 0,
      loading: true,
      updating: false,
      creatingDetector: false,
      error: null,
      triggerToEdit: null,
    };
  }

  componentDidMount() {
    this.getMonitor(this.props.match.params.monitorId);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.monitorVersion !== prevState.monitorVersion && !prevState.loading) {
      // this can happen on initial load when going from 0 -> currentVersion
      // so if we haven't also gone from loading: true -> loading: false we're fine
      // ie if prev loading state was false we're fine
      this.getMonitor(this.props.match.params.monitorId);
    }
  }

  componentWillUnmount() {
    this.props.setFlyout(null);
  }

  getDetector = (id) => {
    const { httpClient } = this.props;
    httpClient
      .get(`../api/alerting/detectors/${id}`)
      .then((resp) => {
        const { ok, detector, version: detectorVersion, seqNo, primaryTerm } = resp.data;
        if (ok) {
          this.setState({
            detector: detector,
            detectorVersion,
          });
        } else {
          console.log('can not get detector', id);
        }
      })
      .catch((err) => {
        console.log('error while getting detector', err);
      });
  };

  getMonitor = (id) => {
    const { httpClient } = this.props;
    httpClient
      .get(`../api/alerting/monitors/${id}`)
      .then((resp) => {
        const {
          ok,
          resp: monitor,
          version: monitorVersion,
          dayCount,
          activeCount,
          ifSeqNo,
          ifPrimaryTerm,
        } = resp.data;
        if (ok) {
          this.setState({
            ifSeqNo,
            ifPrimaryTerm,
            monitor: migrateTriggerMetadata(monitor),
            monitorVersion,
            dayCount,
            activeCount,
            loading: false,
            error: null,
          });
          const adId = get(monitor, MONITOR_INPUT_DETECTOR_ID, undefined);
          if (adId) {
            this.getDetector(adId);
          }
        } else {
          // TODO: 404 handling
          this.props.history.push('/monitors');
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  updateMonitor = (update) => {
    const {
      match: {
        params: { monitorId },
      },
      httpClient,
    } = this.props;
    const { monitor, ifSeqNo, ifPrimaryTerm } = this.state;
    this.setState({ updating: true });
    return httpClient
      .put(
        `../api/alerting/monitors/${monitorId}?ifSeqNo=${ifSeqNo}&ifPrimaryTerm=${ifPrimaryTerm}`,
        { ...monitor, ...update }
      )
      .then((resp) => {
        const { version: monitorVersion } = resp.data;
        this.setState({ monitorVersion, updating: false });
        return resp;
      })
      .catch((err) => {
        console.log('err', err);
        this.setState({ updating: false });
        return err;
      });
  };

  onCreateTrigger = () => {
    this.props.history.push({
      ...this.props.location,
      search: `?action=${TRIGGER_ACTIONS.CREATE_TRIGGER}`,
    });
  };

  onCloseTrigger = () => {
    this.props.history.push({ ...this.props.location, search: '' });
    this.setState({ triggerToEdit: null });
  };

  onEditTrigger = (trigger) => {
    this.setState({ triggerToEdit: trigger });
    this.props.history.push({
      ...this.props.location,
      search: `?action=${TRIGGER_ACTIONS.UPDATE_TRIGGER}`,
    });
  };

  convertToADConfigs = async (monitor) => {
    const uiMetadata = _.get(monitor, 'ui_metadata');
    let adName = monitor.name + '-Detector';
    let adTimeField = uiMetadata.search.timeField;
    let adIndices = monitor.inputs[0].search.indices;
    let adDetectorInterval = { period: { interval: 1, unit: 'MINUTES' } };
    const {
      frequency,
      period: { interval, unit },
      daily,
      weekly,
      monthly: { day },
      cronExpression,
      timezone,
    } = _.get(uiMetadata, 'schedule', {});
    const search = _.get(uiMetadata, 'search');
    if (frequency === 'interval') {
      adDetectorInterval = { period: { unit: unit, interval: interval } };
    }
    let windowDelay = await this.getLatestTimeStamp(adTimeField, adIndices);
    let adWindowDelay = { period: { interval: 10, unit: 'MINUTES' } };
    if (windowDelay) {
      adWindowDelay = { period: { interval: windowDelay, unit: 'MINUTES' } };
    }
    let filterQuery = formikToWhereClause(search);
    let adFilterQuery = '';
    if (filterQuery) {
      adFilterQuery = { bool: { filter: [filterQuery] } };
    } else {
      adFilterQuery = { match_all: { boost: 1.0 } };
    }
    let { aggregationType, fieldName } = search;
    let adFeatures;
    if (!aggregationType || !fieldName) {
      adFeatures = {};
    } else {
      if (aggregationType == 'count') {
        aggregationType = 'value_count';
      }
      adFeatures = {
        feature_name: 'feature-1',
        feature_enabled: true,
        aggregation_query: { aggregation_name: { [aggregationType]: { field: fieldName } } },
      };
    }
    let adConfigs = {
      name: adName,
      description: '',
      time_field: adTimeField,
      indices: adIndices,
      feature_attributes: [adFeatures],
      filter_query: adFilterQuery,
      detection_interval: adDetectorInterval,
      window_delay: adWindowDelay,
    };
    let queriesForOverview = {
      filter_query: displayText(_.get(search, 'where')),
      feature_attributes: {
        feature_name: 'feature-1',
        aggregationType: aggregationType,
        fieldName: fieldName,
      },
      where: _.get(search, 'where'),
    };
    let validationResponse = await this.validateADConfigs(adConfigs);
    this.decideWhichFlyout(validationResponse, adConfigs, queriesForOverview);
  };

  decideWhichFlyout = (validationResponse, adConfigs, queriesForOverview) => {
    const setFlyout = this.props.setFlyout;
    if (validationResponse.failures.others) {
      let message = '';
      for (let [key, value] of Object.entries(validationResponse.failures)) {
        if (key === 'others') {
          message = value;
        }
      }
      this.props.setFlyout({ type: 'detectorFailure', payload: { setFlyout, message } });
    } else {
      this.renderFlyout(adConfigs, validationResponse, queriesForOverview);
    }
  };

  renderStartedDetectorFlyout = (configs, detectorID, queries) => {
    const { httpClient } = this.props;
    const setFlyout = this.props.setFlyout;
    let startedDetector = true;
    const adConfigs = configs;
    const queriesForOverview = queries;
    this.props.setFlyout({
      type: 'createDetector',
      payload: {
        adConfigs,
        queriesForOverview,
        httpClient,
        setFlyout,
        startedDetector,
        detectorID,
      },
    });
  };

  renderFlyout = (adConfigs, validationResponse, queriesForOverview) => {
    const { httpClient } = this.props;
    const setFlyout = this.props.setFlyout;
    const renderStartedDetectorFlyout = this.renderStartedDetectorFlyout;
    const renderFlyout = this.renderFlyout;
    const failures = Object.assign(validationResponse.failures);
    const suggestedChanges = Object.assign(validationResponse.suggestedChanges);
    const startedDetector = false;
    this.props.setFlyout({
      type: 'createDetector',
      payload: {
        adConfigs,
        queriesForOverview,
        httpClient,
        setFlyout,
        renderStartedDetectorFlyout,
        failures,
        suggestedChanges,
        renderFlyout,
        startedDetector,
      },
    });
  };

  validateADConfigs = async (configs) => {
    const { httpClient } = this.props;
    try {
      const response = await httpClient.post('../api/alerting/detectors/_validate', {
        configs,
      });
      let resp = _.get(response, 'data.response');
      return resp;
    } catch (err) {
      if (typeof err === 'string') throw err;
      throw 'There was a problem validating the configurations';
    }
  };

  getLatestTimeStamp = async (adTimeField, adIndices) => {
    const { httpClient } = this.props;
    const searchQuery = {
      size: 1,
      sort: [
        {
          timestamp: {
            order: 'desc',
          },
        },
      ],
      aggregations: {
        max_timefield: {
          max: {
            field: adTimeField,
          },
        },
      },
    };
    try {
      const options = {
        index: adIndices,
        query: searchQuery,
      };
      const response = await httpClient.post('../api/alerting/_search', options);
      let maxStamp = _.get(response, 'data.resp.aggregations.max_timefield.value');
      let delayMS = Date.now() - maxStamp;
      let delayMinutes = Math.ceil(delayMS / 60000) + 1;
      return delayMinutes;
    } catch (err) {
      if (typeof err === 'string') throw err;
      throw 'There was a problem getting the last historical data point';
    }
  };

  renderNoTriggersCallOut = () => {
    const { monitor } = this.state;
    if (!monitor.triggers.length) {
      return (
        <Fragment>
          <EuiCallOut
            title={
              <span>
                This monitor has no triggers configured. To receive alerts from this monitor you
                must first{' '}
                {
                  <EuiLink style={{ textDecoration: 'underline' }} onClick={this.onCreateTrigger}>
                    create at trigger
                  </EuiLink>
                }
                .
              </span>
            }
            iconType="alert"
            size="s"
          />
          <EuiSpacer size="s" />
        </Fragment>
      );
    }

    return null;
  };

  render() {
    const {
      monitor,
      detector,
      monitorVersion,
      activeCount,
      updating,
      loading,
      triggerToEdit,
    } = this.state;
    const {
      location,
      match: {
        params: { monitorId },
      },
      history,
      httpClient,
    } = this.props;
    const { action, success: showSuccessCallOut = false } = queryString.parse(location.search);
    const updatingMonitor = action === MONITOR_ACTIONS.UPDATE_MONITOR;
    const creatingTrigger = action === TRIGGER_ACTIONS.CREATE_TRIGGER;
    const updatingTrigger = action === TRIGGER_ACTIONS.UPDATE_TRIGGER && triggerToEdit;
    const detectorId = get(monitor, MONITOR_INPUT_DETECTOR_ID, undefined);
    if (loading) {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: '100px' }}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexGroup>
      );
    }

    if (updatingMonitor) {
      return (
        <CreateMonitor
          edit={true}
          updateMonitor={this.updateMonitor}
          monitorToEdit={monitor}
          detectorId={detectorId}
          {...this.props}
        />
      );
    }

    if (creatingTrigger || updatingTrigger) {
      return (
        <CreateTrigger
          edit={updatingTrigger}
          triggerToEdit={triggerToEdit}
          monitor={monitor}
          showSuccessCallOut={showSuccessCallOut}
          httpClient={this.props.httpClient}
          setFlyout={this.props.setFlyout}
          onCloseTrigger={this.onCloseTrigger}
          onMonitorFieldChange={() => {}}
          updateMonitor={this.updateMonitor}
        />
      );
    }
    return (
      <div style={{ padding: '25px 50px' }}>
        {this.renderNoTriggersCallOut()}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size="l" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <h1
                style={{
                  whiteSpace: 'nowrap',
                  maxWidth: '90%',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {monitor.name}
              </h1>
            </EuiTitle>
            {detector ? (
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  Created from detector:{' '}
                  <EuiLink href={`${KIBANA_AD_PLUGIN}#/detectors/${detectorId}`} target="_blank">
                    {detector.name} <EuiIcon size="s" type="popout" />
                  </EuiLink>
                </EuiText>
              </EuiFlexItem>
            ) : null}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip
              position="top"
              content={
                monitor.ui_metadata.search.searchType === 'graph'
                  ? ''
                  : 'Anomaly detector can only be automatically created from monitor definition type "visual editor"'
              }
            >
              <EuiButton
                isLoading={updating}
                onClick={() => this.convertToADConfigs(this.state.monitor)}
                disabled={
                  monitor.ui_metadata.search.searchType !== 'graph' ||
                  monitor.ui_metadata.search.fieldName === '' ||
                  monitor.ui_metadata.schedule.timezone
                }
              >
                Create Detector
              </EuiButton>
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={() => {
                this.props.history.push({
                  ...this.props.location,
                  search: `?action=${MONITOR_ACTIONS.UPDATE_MONITOR}`,
                });
              }}
            >
              Edit
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              isLoading={updating}
              onClick={() => this.updateMonitor({ enabled: !monitor.enabled })}
            >
              {monitor.enabled ? 'Disable' : 'Enable'}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        <MonitorOverview
          monitor={monitor}
          monitorId={monitorId}
          monitorVersion={monitorVersion}
          activeCount={activeCount}
        />
        <EuiSpacer />
        <Triggers
          monitor={monitor}
          updateMonitor={this.updateMonitor}
          onEditTrigger={this.onEditTrigger}
          onCreateTrigger={this.onCreateTrigger}
        />
        <div className="eui-hideFor--xs eui-hideFor--s eui-hideFor--m">
          <EuiSpacer />
          <MonitorHistory
            httpClient={httpClient}
            monitorId={monitorId}
            onShowTrigger={this.onCreateTrigger}
            triggers={monitor.triggers}
          />
        </div>
        <EuiSpacer />
        <Dashboard
          monitorIds={[monitorId]}
          detectorIds={detectorId ? [detectorId] : []}
          onCreateTrigger={this.onCreateTrigger}
          httpClient={httpClient}
          location={location}
          history={history}
        />
      </div>
    );
  }
}
