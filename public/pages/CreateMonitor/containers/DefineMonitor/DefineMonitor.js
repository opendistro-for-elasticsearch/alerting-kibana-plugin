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
import _ from 'lodash';
import chrome from 'ui/chrome';
import PropTypes from 'prop-types';
import { EuiSpacer, EuiButton, EuiText, EuiCallOut } from '@elastic/eui';
import { toastNotifications } from 'ui/notify';
import ContentPanel from '../../../../components/ContentPanel';
import VisualGraph from '../../components/VisualGraph';
import ExtractionQuery from '../../components/ExtractionQuery';
import MonitorExpressions from '../../components/MonitorExpressions';
import QueryPerformance from '../../components/QueryPerformance';
import MonitorDefinition from '../../components/MonitorDefinition';
import MonitorIndex from '../MonitorIndex';
import MonitorTimeField from '../../components/MonitorTimeField';
import { formikToMonitor } from '../CreateMonitor/utils/formikToMonitor';
import { getPathsPerDataType } from './utils/mappings';
import { buildSearchRequest } from './utils/searchRequests';
import { SEARCH_TYPE, ES_AD_PLUGIN } from '../../../../utils/constants';
import AnomalyDetectors from '../AnomalyDetectors/AnomalyDetectors';

function renderEmptyMessage(message) {
  return (
    <div style={{ padding: '20px', border: '1px solid #D9D9D9', borderRadius: '5px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '450px' }}
      >
        <div>{message}</div>
      </div>
    </div>
  );
}

const propTypes = {
  values: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired,
  errors: PropTypes.object,
};
const defaultProps = {
  errors: {},
};

class DefineMonitor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataTypes: {},
      performanceResponse: null,
      response: null,
      formikSnapshot: this.props.values,
      plugins: [],
    };

    this.renderGraph = this.renderGraph.bind(this);
    this.onRunQuery = this.onRunQuery.bind(this);
    this.resetResponse = this.resetResponse.bind(this);
    this.onQueryMappings = this.onQueryMappings.bind(this);
    this.queryMappings = this.queryMappings.bind(this);
    this.renderVisualMonitor = this.renderVisualMonitor.bind(this);
    this.renderExtractionQuery = this.renderExtractionQuery.bind(this);
    this.renderAnomalyDetector = this.renderAnomalyDetector.bind(this);
    this.getMonitorContent = this.getMonitorContent.bind(this);
    this.getPlugins = this.getPlugins.bind(this);
    this.showPluginWarning = this.showPluginWarning.bind(this);
    this.isDarkMode = chrome.getUiSettingsClient().get('theme:darkMode') || false;
  }

  componentDidMount() {
    this.getPlugins();
    const { searchType, index, timeField } = this.props.values;
    const isGraph = searchType === SEARCH_TYPE.GRAPH;
    const hasIndices = !!index.length;
    const hasTimeField = !!timeField;
    if (isGraph && hasIndices) {
      this.onQueryMappings();
      if (hasTimeField) this.onRunQuery();
    }
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

  async getPlugins() {
    const { httpClient } = this.props;
    try {
      const pluginsResponse = await httpClient.get('../api/alerting/_plugins');
      if (pluginsResponse.data.ok) {
        this.setState({ plugins: pluginsResponse.data.resp.map((plugin) => plugin.component) });
      } else {
        console.error('There was a problem getting plugins list');
      }
    } catch (e) {
      console.error('There was a problem getting plugins list', e);
    }
  }

  renderGraph() {
    const { errors } = this.props;
    return (
      <Fragment>
        <EuiText size="xs">
          <strong>Create a monitor for</strong>
        </EuiText>
        <EuiSpacer size="s" />
        <MonitorExpressions
          onRunQuery={this.onRunQuery}
          dataTypes={this.state.dataTypes}
          ofEnabled={this.props.values.aggregationType !== 'count'}
        />
        <EuiSpacer size="s" />
        {errors.where ? (
          renderEmptyMessage('Invalid input in WHERE filter. Remove WHERE filter or adjust filter ')
        ) : (
          <VisualGraph
            values={this.state.formikSnapshot}
            fieldName={_.get(this.props.values, 'fieldName[0].label', 'Select a field')}
            response={this.state.response}
          />
        )}
      </Fragment>
    );
  }

  async onRunQuery() {
    const { httpClient, values } = this.props;
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
        return httpClient.post('../api/alerting/monitors/_execute', monitor);
      });

      const [queryResponse, optionalResponse] = await Promise.all(promises);

      if (queryResponse.data.ok) {
        const response = _.get(queryResponse.data.resp, 'input_results.results[0]');
        // If there is an optionalResponse use it's results, otherwise use the original response
        const performanceResponse = optionalResponse
          ? _.get(optionalResponse, 'data.resp.input_results.results[0]', null)
          : response;
        this.setState({ response, formikSnapshot, performanceResponse });
      } else {
        console.error('There was an error running the query', queryResponse.data.resp);
        this.backendErrorHandler('run', queryResponse.data);
        this.setState({ response: null, formikSnapshot: null, performanceResponse: null });
      }
    } catch (err) {
      console.error('There was an error running the query', err);
    }
  }

  resetResponse() {
    this.setState({ response: null, performanceResponse: null });
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
      const response = await this.props.httpClient.post('../api/alerting/_mappings', { index });
      if (response.data.ok) {
        return response.data.resp;
      }
      return {};
    } catch (err) {
      throw err;
    }
  }
  renderVisualMonitor() {
    const { httpClient, values } = this.props;
    const { index, timeField } = values;
    const { dataTypes, performanceResponse } = this.state;
    let content = null;
    if (index.length) {
      content = timeField
        ? this.renderGraph()
        : renderEmptyMessage('You must specify a time field.');
    } else {
      content = renderEmptyMessage('You must specify an index.');
    }
    return {
      actions: [],
      content: (
        <React.Fragment>
          <MonitorIndex httpClient={httpClient} />
          <MonitorTimeField dataTypes={dataTypes} />
          <div style={{ padding: '0px 10px' }}>{content}</div>
          <EuiSpacer size="m" />
          <QueryPerformance response={performanceResponse} />
        </React.Fragment>
      ),
    };
  }
  renderExtractionQuery() {
    const { httpClient, values } = this.props;
    const { response, performanceResponse } = this.state;
    let invalidJSON = false;
    try {
      JSON.parse(values.query);
    } catch (e) {
      invalidJSON = true;
    }
    const runIsDisabled = invalidJSON || !values.index.length;
    let content = renderEmptyMessage('You must specify an index.');
    if (values.index.length) {
      content = (
        <ExtractionQuery
          response={JSON.stringify(response || '', null, 4)}
          isDarkMode={this.isDarkMode}
        />
      );
    }
    return {
      actions: [
        <EuiButton disabled={runIsDisabled} onClick={this.onRunQuery}>
          Run
        </EuiButton>,
      ],
      content: (
        <React.Fragment>
          <MonitorIndex httpClient={httpClient} />
          <div style={{ padding: '0px 10px' }}>{content}</div>
          <EuiSpacer size="m" />
          <QueryPerformance response={performanceResponse} />
        </React.Fragment>
      ),
    };
  }
  renderAnomalyDetector() {
    const { httpClient, values, detectorId } = this.props;
    return {
      actions: [],
      content: (
        <React.Fragment>
          <div style={{ padding: '0px 10px' }}>
            <AnomalyDetectors
              httpClient={httpClient}
              values={values}
              renderEmptyMessage={renderEmptyMessage}
              detectorId={detectorId}
            />
          </div>
        </React.Fragment>
      ),
    };
  }

  getMonitorContent() {
    const { values } = this.props;
    switch (values.searchType) {
      case SEARCH_TYPE.AD:
        return this.renderAnomalyDetector();
      case SEARCH_TYPE.GRAPH:
        return this.renderVisualMonitor();
      default:
        return this.renderExtractionQuery();
    }
  }
  showPluginWarning() {
    const { values } = this.props;
    const { plugins } = this.state;
    return values.searchType == SEARCH_TYPE.AD && plugins.indexOf(ES_AD_PLUGIN) == -1;
  }

  backendErrorHandler(actionName, data) {
    toastNotifications.addDanger({
      title: `Failed to ${actionName} the query`,
      text: data.resp,
      toastLifeTimeMs: 20000,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    const monitorContent = this.getMonitorContent();
    return (
      <ContentPanel
        title="Define monitor"
        titleSize="s"
        bodyStyles={{ padding: 'initial' }}
        actions={monitorContent.actions}
      >
        {this.showPluginWarning()
          ? [
              <EuiCallOut
                color="warning"
                title="Anomaly detector plugin is not installed on Elasticsearch, This monitor will not functional properly."
                iconType="help"
                size="s"
              />,
              <EuiSpacer size="s" />,
            ]
          : null}
        <MonitorDefinition resetResponse={this.resetResponse} plugins={this.state.plugins} />
        {monitorContent.content}
      </ContentPanel>
    );
  }
}

DefineMonitor.propTypes = propTypes;
DefineMonitor.defaultProps = defaultProps;

export default DefineMonitor;
