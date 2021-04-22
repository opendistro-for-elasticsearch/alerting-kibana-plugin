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
  httpClient: PropTypes.object.isRequired,
  notifications: PropTypes.object.isRequired,
};

class DataSource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataTypes: {},
      performanceResponse: null,
      response: null,
      formikSnapshot: this.props.values,
    };
  }

  componentDidMount() {
    const { index, timeField } = this.props.values;
    const hasIndices = !!index.length;
    const hasTimeField = !!timeField;
  }

  componentDidUpdate(prevProps) {
    const {
      searchType: prevSearchType,
      index: prevIndex,
      timeField: prevTimeField,
    } = prevProps.values;
    const { searchType, index, timeField } = this.props.values;
    const isGraph = searchType === SEARCH_TYPE.GRAPH;
    const hasIndices = !!index.length;
    // If customer is defining query through extraction query, then they are manually running their own queries
    // Below logic is for customers defining queries through graph/visual way.
    if (isGraph && hasIndices) {
      // If current query type is graph and there are indices selected, then we want to query new index mappings if
      // a) previous query type was query (to get the first load of mappings)
      // b) different indices, to get new mappings
      const wasQuery = prevSearchType === SEARCH_TYPE.QUERY;
      const diffIndices = prevIndex !== index;
      if (wasQuery || diffIndices) {
        this.onQueryMappings();
      }
      // If there is a timeField selected, then we want to run the query if
      // a) previous query type was query (to get first run executed)
      // b) different indices, to get new data
      // c) different time fields, to aggregate on new data/axis
      const diffTimeFields = prevTimeField !== timeField;
      const hasTimeField = !!timeField;
      if (hasTimeField) {
        if (wasQuery || diffIndices || diffTimeFields) this.onRunQuery();
      }
    }
  }

  async onRunQuery() {
    const { httpClient, values, notifications } = this.props;
    const formikSnapshot = _.cloneDeep(values);

    // If we are running a visual graph query, then we need to run two separate queries
    // 1. The actual query that will be saved on the monitor, to get accurate query performance stats
    // 2. The UI generated query that gets [BUCKET_COUNT] times the aggregated buckets to show past history of query
    // If the query is an extraction query, we can use the same query for results and query performance
    const searchRequests = [buildSearchRequest(values)];
    if (values.searchType === SEARCH_TYPE.GRAPH) {
      searchRequests.push(buildSearchRequest(values, false));
    }

    try {
      const promises = searchRequests.map((searchRequest) => {
        // Fill in monitor name in case it's empty (in create workflow)
        // Set triggers to empty array so they are not executed (if in edit workflow)
        // Set input search to query/graph query and then use execute API to fill in period_start/period_end
        const monitor = formikToMonitor(values);
        _.set(monitor, 'name', 'TEMP_MONITOR');
        _.set(monitor, 'triggers', []);
        _.set(monitor, 'inputs[0].search', searchRequest);
        return httpClient.post('../api/alerting/monitors/_execute', {
          body: JSON.stringify(monitor),
        });
      });

      const [queryResponse, optionalResponse] = await Promise.all(promises);

      if (queryResponse.ok) {
        const response = _.get(queryResponse.resp, 'input_results.results[0]');
        // If there is an optionalResponse use it's results, otherwise use the original response
        const performanceResponse = optionalResponse
          ? _.get(optionalResponse, 'resp.input_results.results[0]', null)
          : response;
        this.setState({ response, formikSnapshot, performanceResponse });
      } else {
        console.error('There was an error running the query', queryResponse.resp);
        backendErrorNotification(notifications, 'run', 'query', queryResponse.resp);
        this.setState({ response: null, formikSnapshot: null, performanceResponse: null });
      }
    } catch (err) {
      console.error('There was an error running the query', err);
    }
  }

  async onQueryMappings() {
    const index = this.props.values.index.map(({ label }) => label);
    try {
      const mappings = await this.queryMappings(index);
      const dataTypes = getPathsPerDataType(mappings);
      this.setState({ dataTypes });
    } catch (err) {
      console.error('There was an error getting mappings for query', err);
    }
  }

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

  render() {
    return (
      <ContentPanel title="Data source" titleSize="s" bodyStyles={{ padding: 'initial' }}>
        <MonitorIndex httpClient={this.props.httpClient} />
        <EuiSpacer size="s" />
        <MonitorTimeField dataTypes={this.state.dataTypes} />
      </ContentPanel>
    );
  }
}

DefineMonitor.propTypes = propTypes;

export default DataSource;
