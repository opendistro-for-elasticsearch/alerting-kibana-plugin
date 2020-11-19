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

import React from 'react';
import { get } from 'lodash';
import { EuiSpacer, EuiLoadingChart } from '@elastic/eui';
import { AnomalyDetectorData } from '../../../CreateMonitor/containers/AnomalyDetectors/AnomalyDetectorData';
import TriggerExpressions from '../../components/TriggerExpressions';
import { AnomaliesChart } from '../../../CreateMonitor/components/AnomalyDetectors/AnomaliesChart';
import { FeatureChart } from '../../../CreateMonitor/components/AnomalyDetectors/FeatureChart/FeatureChart';
import { EmptyFeaturesMessage } from '../../../CreateMonitor/components/AnomalyDetectors/EmptyFeaturesMessage/EmptyFeaturesMessage';

class AnomalyDetectorTrigger extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { adValues } = this.props;
    return (
      <div style={{ padding: '0px 10px' }}>
        <AnomalyDetectorData
          detectorId={this.props.detectorId}
          render={(anomalyData) => {
            let featureData = [];
            //Skip disabled features showing from Alerting.
            featureData = get(anomalyData, 'detector.featureAttributes', [])
              .filter((feature) => feature.featureEnabled)
              .map((feature, index) => ({
                featureName: feature.featureName,
                data: anomalyData.anomalyResult.featureData[feature.featureId] || [],
              }));
            const annotations = get(anomalyData, 'anomalyResult.anomalies', [])
              .filter((anomaly) => anomaly.anomalyGrade > 0)
              .map((anomaly) => ({
                coordinates: {
                  x0: anomaly.startTime,
                  x1: anomaly.endTime,
                },
                details: `There is an anomaly with confidence ${anomaly.confidence}`,
              }));
            if (featureData.length > 0) {
              return (
                <React.Fragment>
                  <TriggerExpressions
                    thresholdValue={adValues.anomalyGradeThresholdValue}
                    thresholdEnum={adValues.anomalyGradeThresholdEnum}
                    keyFieldName="anomalyDetector.anomalyGradeThresholdEnum"
                    valueFieldName="anomalyDetector.anomalyGradeThresholdValue"
                    label="Anomaly grade threshold"
                  />
                  <EuiSpacer size="xs" />
                  <AnomaliesChart
                    showTitle={false}
                    showSettings={false}
                    startDateTime={anomalyData.previewStartTime}
                    endDateTime={anomalyData.previewEndTime}
                    anomalies={anomalyData.anomalyResult.anomalies}
                    isLoading={anomalyData.isLoading}
                    displayGrade
                    annotationData={[{ dataValue: adValues.anomalyGradeThresholdValue }]}
                  />
                  <EuiSpacer size="m" />
                  <TriggerExpressions
                    thresholdValue={adValues.anomalyConfidenceThresholdValue}
                    thresholdEnum={adValues.anomalyConfidenceThresholdEnum}
                    keyFieldName="anomalyDetector.anomalyConfidenceThresholdEnum"
                    valueFieldName="anomalyDetector.anomalyConfidenceThresholdValue"
                    label="Anomaly confidence threshold"
                  />
                  <EuiSpacer size="xs" />
                  <AnomaliesChart
                    showTitle={false}
                    showSettings={false}
                    startDateTime={anomalyData.previewStartTime}
                    endDateTime={anomalyData.previewEndTime}
                    anomalies={anomalyData.anomalyResult.anomalies}
                    isLoading={anomalyData.isLoading}
                    displayConfidence
                    annotationData={[{ dataValue: adValues.anomalyConfidenceThresholdValue }]}
                  />
                </React.Fragment>
              );
            } else {
              return (
                <EmptyFeaturesMessage
                  detectorId={this.props.detectorId}
                  isLoading={anomalyData.isLoading}
                />
              );
            }
          }}
        />
      </div>
    );
  }
}

export { AnomalyDetectorTrigger };
