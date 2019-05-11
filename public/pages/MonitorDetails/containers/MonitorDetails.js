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

import React, { Component, Fragment } from 'react';
import queryString from 'query-string';
import {
  EuiButton,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';

import CreateMonitor from '../../CreateMonitor';
import CreateTrigger from '../../CreateTrigger';
import MonitorOverview from '../components/MonitorOverview';
import MonitorHistory from './MonitorHistory';
import Dashboard from '../../Dashboard/containers/Dashboard';
import Triggers from './Triggers';
import { MONITOR_ACTIONS, TRIGGER_ACTIONS } from '../../../utils/constants';

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

  getMonitor = id => {
    const { httpClient } = this.props;
    httpClient
      .get(`../api/alerting/monitors/${id}`)
      .then(resp => {
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
            monitor,
            monitorVersion,
            dayCount,
            activeCount,
            loading: false,
            error: null,
          });
        } else {
          // TODO: 404 handling
          this.props.history.push('/monitors');
        }
      })
      .catch(err => {
        console.log('err', err);
      });
  };

  updateMonitor = update => {
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
      .then(resp => {
        const { version: monitorVersion } = resp.data;
        this.setState({ monitorVersion, updating: false });
        return resp;
      })
      .catch(err => {
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

  onEditTrigger = trigger => {
    this.setState({ triggerToEdit: trigger });
    this.props.history.push({
      ...this.props.location,
      search: `?action=${TRIGGER_ACTIONS.UPDATE_TRIGGER}`,
    });
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
    const { monitor, monitorVersion, activeCount, updating, loading, triggerToEdit } = this.state;
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
          onCreateTrigger={this.onCreateTrigger}
          httpClient={httpClient}
          location={location}
          history={history}
        />
      </div>
    );
  }
}
