import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { EuiEmptyPrompt, EuiText } from '@elastic/eui';
import { AnomalyDetectorData } from '../../../CreateMonitor/containers/AnomalyDetectors/AnomalyDetectorData';
import { EmptyFeaturesMessage } from '../../../CreateMonitor/components/AnomalyDetectors/EmptyFeaturesMessage/EmptyFeaturesMessage';
import ContentPanel from '../../../../components/ContentPanel';
import { AnomaliesChart } from '../../../CreateMonitor/components/AnomalyDetectors/AnomaliesChart';
import { FeatureChart } from '../../../CreateMonitor/components/AnomalyDetectors/FeatureChart/FeatureChart';
import { EuiSpacer } from '@elastic/eui';

const AnomalyHistory = props => {
  return (
    <ContentPanel title="Anomaly results" titleSize="s" bodyStyles={{ minHeight: 200 }}>
      <AnomalyDetectorData
        preview={false}
        detectorId={props.detectorId}
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
              anomaly =>
                anomaly.anomalyGrade > 0 && anomaly.startTime >= props.monitorLastEnabledTime
            )
            .map(anomaly => ({
              coordinates: {
                x0: anomaly.startTime,
                x1: anomaly.endTime,
              },
              details: `There is an anomaly with confidence ${anomaly.confidence}`,
            }));
          if (get(anomalyData, 'anomalyResult.anomalies', []).length === 0) {
            return (
              <EuiEmptyPrompt
                style={{ maxWidth: '45em' }}
                body={<EuiText>No result found for this detector.</EuiText>}
              />
            );
          }
          return featureData.length > 0 ? (
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
                  anomaly => anomaly.startTime > props.monitorLastEnabledTime
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
          ) : (
            <EmptyFeaturesMessage
              detectorId={props.detectorId}
              isLoading={anomalyData.isLoading}
              containerStyle={{ border: 'none' }}
            />
          );
        }}
      />
    </ContentPanel>
  );
};

AnomalyHistory.PropTypes = {
  detectorId: PropTypes.string.isRequired,
};
export { AnomalyHistory };
