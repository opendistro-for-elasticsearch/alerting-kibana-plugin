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

import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiCallOut, EuiSpacer } from '@elastic/eui';
import { FormikComboBox } from '../../../../components/FormControls';
import { hasError, isInvalid, validateDetector } from '../../../../utils/validate';
import { AnomaliesChart } from '../../components/AnomalyDetectors/AnomaliesChart';
import { FeatureChart } from '../../components/AnomalyDetectors/FeatureChart/FeatureChart';
import { EmptyFeaturesMessage } from '../../components/AnomalyDetectors/EmptyFeaturesMessage/EmptyFeaturesMessage';
import { AppContext } from '../../../../utils/AppContext';
import { AnomalyDetectorData } from './AnomalyDetectorData';

class AnomalyDetectors extends React.Component {
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      detectorOptions: [],
      isLoading: false,
    };
    this.searchDetectors = this.searchDetectors.bind(this);
  }
  async componentDidMount() {
    await this.searchDetectors();
  }

  async searchDetectors() {
    const { httpClient } = this.context;
    try {
      const response = await httpClient.post('../api/alerting/detectors/_search');
      if (response.data.ok) {
        const detectorOptions = response.data.detectors.map(detector => ({
          label: detector.name,
          value: detector.id,
          features: detector.featureAttributes,
          //TODO::Temp hack until backend fix
          interval: detector.detectionInterval,
        }));
        this.setState({ detectorOptions });
      }
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const { detectorOptions } = this.state;
    const { values, renderEmptyMessage } = this.props;
    //Default to empty
    let selectedOptions = [];
    if (detectorOptions.length > 0) {
      const selectedValue = detectorOptions.find(detector => values.detectorId === detector.value);
      if (selectedValue) {
        selectedOptions = [selectedValue];
      }
    }
    return (
      <div>
        <FormikComboBox
          name={'detectorId'}
          formRow
          rowProps={{
            label: 'Detector',
            isInvalid,
            error: hasError,
          }}
          fieldProps={{
            validate: value => validateDetector(value, selectedOptions[0]),
          }}
          inputProps={{
            placeholder: 'Select a detector',
            options: detectorOptions,
            onBlur: (e, field, form) => {
              form.setFieldTouched('detectorId', true);
            },
            onChange: (options, field, form) => {
              form.setFieldError('detectorId', undefined);
              form.setFieldValue('detectorId', get(options, '0.value', ''));
              //TODO::Temp hack until backend fixes
              form.setFieldValue('period', get(options, '0.interval.period'));
            },
            singleSelection: { asPlaintext: true },
            isClearable: false,
            selectedOptions,
          }}
        />
        <EuiCallOut
          title="You can not tune detector once a monitor is created."
          iconType="alert"
          size="s"
        />
        <EuiSpacer size="s" />
        {values.detectorId ? (
          <AnomalyDetectorData
            detectorId={get(selectedOptions, '0.value', '')}
            render={anomalyData => {
              let featureData = [];
              if (selectedOptions[0]) {
                featureData = get(selectedOptions, '0.features', [])
                  .filter(feature => feature.featureEnabled)
                  .map(feature => ({
                    featureName: feature.featureName,
                    data: anomalyData.anomalyResult.featureData[feature.featureId] || [],
                  }));
              }
              const annotations = get(anomalyData, 'anomalyResult.anomalies', [])
                .filter(anomaly => anomaly.anomalyGrade > 0)
                .map(anomaly => ({
                  coordinates: {
                    x0: anomaly.startTime,
                    x1: anomaly.endTime,
                  },
                  details: `There is an anomaly with confidence ${anomaly.confidence}`,
                }));
              return featureData.length > 0 ? (
                <React.Fragment>
                  <AnomaliesChart
                    startDateTime={anomalyData.previewStartTime}
                    endDateTime={anomalyData.previewEndTime}
                    anomalies={anomalyData.anomalyResult.anomalies}
                    isLoading={anomalyData.isLoading}
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
                  />
                </React.Fragment>
              ) : (
                <EmptyFeaturesMessage
                  detectorId={values.detectorId}
                  isLoading={anomalyData.isLoading}
                />
              );
            }}
          />
        ) : (
          renderEmptyMessage('Must select detector')
        )}
      </div>
    );
  }
}

AnomalyDetectors.propTypes = {
  values: PropTypes.object.isRequired,
  renderEmptyMessage: PropTypes.func.isRequired,
};

export default AnomalyDetectors;
