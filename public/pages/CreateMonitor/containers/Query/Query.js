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

import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  EuiSpacer,
  EuiButton,
  EuiText,
  EuiCallOut,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import ContentPanel from '../../../../components/ContentPanel';
import VisualGraph from '../../components/VisualGraph';
import ExtractionQuery from '../../components/ExtractionQuery';
import QueryPerformance from '../../components/QueryPerformance';
import { formikToMonitor } from '../CreateMonitor/utils/formikToMonitor';
import { SEARCH_TYPE, ES_AD_PLUGIN } from '../../../../utils/constants';
import AnomalyDetectors from '../AnomalyDetectors/AnomalyDetectors';
import { backendErrorNotification } from '../../../../utils/helpers';
import { buildSearchRequest } from '../DefineMonitor/utils/searchRequests';
import MonitorIndex from '../MonitorIndex';
import {
  EXPRESSION_STYLE,
  Expressions,
  UNITS_OF_TIME,
} from '../../components/MonitorExpressions/expressions/utils/constants';
import { FormikFieldNumber, FormikSelect } from '../../../../components/FormControls';
import { MetricExpression } from '../../components/MonitorExpressions/expressions';
import MultipleExpressions from '../../components/MonitorExpressions/MultipleExpressions';

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
  httpClient: PropTypes.object.isRequired,
  errors: PropTypes.object,
  notifications: PropTypes.object.isRequired,
};
const defaultProps = {
  errors: {},
};

class Query extends Component {
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
  }

  componentDidMount() {
    this.getPlugins();
    const { searchType, index, timeField } = this.props.values;
    const isGraph = searchType === SEARCH_TYPE.GRAPH;
    const hasIndices = !!index.length;
    const hasTimeField = !!timeField;
    //Debug
    console.log('Has indices: ' + hasIndices + ' isGraph: ' + isGraph);
    if (isGraph && hasIndices) {
      //Debug
      console.log('Did go into queryMappings');
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
    //Debug
    console.log('In update, hasIndices: ' + hasIndices + ' isGraph: ' + isGraph);
    // If customer is defining query through extraction query, then they are manually running their own queries
    // Below logic is for customers defining queries through graph/visual way.
    if (isGraph && hasIndices) {
      // If current query type is graph and there are indices selected, then we want to query new index mappings if
      // a) previous query type was query (to get the first load of mappings)
      // b) different indices, to get new mappings
      const wasQuery = prevSearchType === SEARCH_TYPE.QUERY;
      const diffIndices = prevIndex !== index;
      if (wasQuery || diffIndices) {
        //Debug
        console.log('Query mapping in update...');
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
      if (pluginsResponse.ok) {
        this.setState({ plugins: pluginsResponse.resp.map((plugin) => plugin.component) });
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
        <MultipleExpressions
          onRunQuery={this.onRunQuery}
          dataTypes={this.state.dataTypes}
          ofEnabled={this.props.values.aggregationType !== 'count'}
        />

        <EuiText size="xs">
          {' '}
          <h4>Group by</h4>{' '}
        </EuiText>

        <EuiButtonEmpty
          size="xs"
          data-test-subj="addGroupByButton"
          // onClick={}
        >
          + Add another group by
        </EuiButtonEmpty>

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
          <div style={{ padding: '0px 10px' }}>{content}</div>
          <EuiSpacer size="m" />
          <QueryPerformance response={performanceResponse} />
        </React.Fragment>
      ),
    };
  }
  renderExtractionQuery() {
    const { httpClient, values, isDarkMode } = this.props;
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
          isDarkMode={isDarkMode}
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

  render() {
    const monitorContent = this.getMonitorContent();
    return (
      <ContentPanel
        title="Query"
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
        {monitorContent.content}
      </ContentPanel>
    );
  }
}

Query.propTypes = propTypes;
Query.defaultProps = defaultProps;

export default Query;
