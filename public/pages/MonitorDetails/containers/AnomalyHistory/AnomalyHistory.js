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

import React, { Component } from 'react';
import moment from 'moment';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { EuiEmptyPrompt, EuiText, EuiSpacer } from '@elastic/eui';
import { AnomalyDetectorData } from '../../../CreateMonitor/containers/AnomalyDetectors/AnomalyDetectorData';
import { EmptyFeaturesMessage } from '../../../CreateMonitor/components/AnomalyDetectors/EmptyFeaturesMessage/EmptyFeaturesMessage';
import ContentPanel from '../../../../components/ContentPanel';
import { AnomaliesChart } from '../../../CreateMonitor/components/AnomalyDetectors/AnomaliesChart';
import { FeatureChart } from '../../../CreateMonitor/components/AnomalyDetectors/FeatureChart/FeatureChart';
import DateRangePicker from '../MonitorHistory/DateRangePicker';

const DEFAULT_ANOMALY_TIME_WINDOW_DAYS = 5;
class AnomalyHistory extends Component {
  constructor(props) {
    super(props);
    this.initialStartTime = moment(Date.now())
      .subtract(DEFAULT_ANOMALY_TIME_WINDOW_DAYS, 'days')
      .startOf('day');
    this.initialEndTime = moment(Date.now());
    this.state = {
      startTime: this.initialStartTime,
      endTime: this.initialEndTime,
    };
  }
  handleRangeChange = (startTime, endTime) => {
    this.setState({ startTime, endTime });
  };
  render() {
    const { detectorId, monitorLastEnabledTime } = this.props;
    return (
      <ContentPanel
        title="Anomaly results"
        titleSize="s"
        bodyStyles={{ minHeight: 200 }}
        actions={[
          <DateRangePicker
            initialStartTime={this.initialStartTime}
            initialEndTime={this.initialEndTime}
            onRangeChange={this.handleRangeChange}
          />,
        ]}
      >
        <AnomalyDetectorData
          preview={true}
          startTime={this.state.startTime.valueOf()}
          endTime={this.state.endTime.valueOf()}
          detectorId={detectorId}
          render={anomalyData => {
            let featureData = [];
            //Skip disabled features showing from Alerting.
            featureData = get(anomalyData, 'detector.featureAttributes', [])
              .filter(feature => feature.featureEnabled)
              .map((feature, index) => ({
                featureName: feature.featureName,
                data: anomalyData.anomalyResult.featureData[feature.featureId] || [],
              }));
            const annotations = get(anomalyData, 'anomalyResult.anomalies', [])
              .filter(
                anomaly => anomaly.anomalyGrade > 0 && anomaly.startTime >= monitorLastEnabledTime
              )
              .map(anomaly => ({
                coordinates: {
                  x0: anomaly.startTime,
                  x1: anomaly.endTime,
                },
                details: `There is an anomaly with confidence ${anomaly.confidence}`,
              }));
            if (
              !anomalyData.isLoading &&
              get(anomalyData, 'anomalyResult.anomalies', []).length === 0
            ) {
              return (
                <EuiEmptyPrompt
                  style={{ maxWidth: '45em' }}
                  body={<EuiText>No anomalies found for this detector.</EuiText>}
                />
              );
            }
            return (
              <React.Fragment>
                <AnomaliesChart
                  startDateTime={anomalyData.previewStartTime}
                  endDateTime={anomalyData.previewEndTime}
                  /*
                  We don't want to show an anomaly for the feature which doesn't exists.
                  This can be ideally done on the ES but this is very single use cases
                  so doing this on client side.
                */
                  anomalies={anomalyData.anomalyResult.anomalies.filter(
                    anomaly => anomaly.startTime > monitorLastEnabledTime
                  )}
                  isLoading={anomalyData.isLoading}
                  title="Anomalies"
                  displayGrade
                  displayConfidence
                />
                <EuiSpacer size="m" />
                <FeatureChart
                  annotations={annotations}
                  startDateTime={anomalyData.previewStartTime}
                  endDateTime={anomalyData.previewEndTime}
                  featureData={featureData}
                  isLoading={anomalyData.isLoading}
                  title="Feature data"
                />
              </React.Fragment>
            );
          }}
        />
      </ContentPanel>
    );
  }
}

AnomalyHistory.PropTypes = {
  detectorId: PropTypes.string.isRequired,
};
export { AnomalyHistory };
