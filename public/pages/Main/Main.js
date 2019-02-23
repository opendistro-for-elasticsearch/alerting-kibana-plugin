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

import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from '../Home';
import Breadcrumbs from '../../components/Breadcrumbs';
import CreateMonitor from '../CreateMonitor';
import MonitorDetails from '../MonitorDetails/containers/MonitorDetails';
import CreateDestination from '../Destinations/containers/CreateDestination';
import Flyout from '../../components/Flyout';
import { APP_PATH } from '../../utils/constants';

class Main extends Component {
  state = { flyout: null };

  // TODO: Want to move this to redux store so we don't have to pass down setFlyout through components
  setFlyout = flyout => {
    const { flyout: currentFlyout } = this.state;
    // If current flyout and new flyout are same type, set to null to mimic closing flyout when clicking on same button
    if (currentFlyout && flyout && currentFlyout.type === flyout.type) {
      this.setState({ flyout: null });
    } else {
      this.setState({ flyout });
    }
  };

  render() {
    const { flyout } = this.state;
    const { httpClient, history, ...rest } = this.props;
    return (
      <div style={{ padding: '15px 0px' }}>
        <Breadcrumbs history={history} httpClient={httpClient} {...rest} />
        <Flyout
          flyout={flyout}
          onClose={() => {
            this.setFlyout(null);
          }}
        />
        <Switch>
          <Route
            path={APP_PATH.CREATE_MONITOR}
            render={props => (
              <CreateMonitor httpClient={httpClient} setFlyout={this.setFlyout} {...props} />
            )}
          />
          <Route
            path={APP_PATH.CREATE_DESTINATION}
            render={props => (
              <CreateDestination httpClient={httpClient} setFlyout={this.setFlyout} {...props} />
            )}
          />
          <Route
            path="/destinations/:destinationId"
            render={props => (
              <CreateDestination
                httpClient={httpClient}
                setFlyout={this.setFlyout}
                {...props}
                edit
              />
            )}
          />
          <Route
            path="/monitors/:monitorId"
            render={props => (
              <MonitorDetails httpClient={httpClient} setFlyout={this.setFlyout} {...props} />
            )}
          />
          <Route
            render={props => <Home httpClient={httpClient} {...props} setFlyout={this.setFlyout} />}
          />
        </Switch>
      </div>
    );
  }
}

export default Main;
