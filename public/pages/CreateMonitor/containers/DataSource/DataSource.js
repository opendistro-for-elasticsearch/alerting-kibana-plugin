/*
 *   Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import PropTypes from 'prop-types';
import { EuiSpacer } from '@elastic/eui';
import MonitorIndex from '../MonitorIndex';
import MonitorTimeField from '../../components/MonitorTimeField';
import DefineMonitor from '../DefineMonitor';
import ContentPanel from '../../../../components/ContentPanel';
import { getPathsPerDataType } from '../DefineMonitor/utils/mappings';
import { SEARCH_TYPE } from '../../../../utils/constants';
import _ from 'lodash';
import { buildSearchRequest } from '../DefineMonitor/utils/searchRequests';
import { formikToMonitor } from '../CreateMonitor/utils/formikToMonitor';
import { backendErrorNotification } from '../../../../utils/helpers';

const propTypes = {
  values: PropTypes.object.isRequired,
  dataTypes: PropTypes.object.isRequired,
  httpClient: PropTypes.object.isRequired,
  notifications: PropTypes.object.isRequired,
};

class DataSource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      performanceResponse: null,
      response: null,
      formikSnapshot: this.props.values,
    };
  }

  render() {
    const { searchType } = this.props.values;
    const isGraph = searchType === SEARCH_TYPE.GRAPH;
    return (
      <ContentPanel title="Data source" titleSize="s" bodyStyles={{ padding: 'initial' }}>
        <MonitorIndex httpClient={this.props.httpClient} />
        <EuiSpacer size="s" />
        {isGraph && <MonitorTimeField dataTypes={this.props.dataTypes} />}
      </ContentPanel>
    );
  }
}

DataSource.propTypes = propTypes;

export default DataSource;
