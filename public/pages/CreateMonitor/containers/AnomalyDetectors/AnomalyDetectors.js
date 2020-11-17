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
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormikComboBox } from '../../../../components/FormControls';
import { hasError, isInvalid, validateDetector } from '../../../../utils/validate';
import { CoreContext } from '../../../../utils/CoreContext';

class AnomalyDetectors extends React.Component {
  static contextType = CoreContext;
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
    const { http: httpClient } = this.context;
    try {
      const response = await httpClient.post('../api/alerting/detectors/_search');
      if (response.ok) {
        const detectorOptions = response.detectors.map((detector) => ({
          label: detector.name,
          value: detector.id,
          features: detector.featureAttributes,
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
    const { values, detectorId } = this.props;
    //Default to empty
    let selectedOptions = [];
    if (detectorOptions.length > 0) {
      const adId = values.detectorId ? values.detectorId : detectorId;
      const selectedValue = detectorOptions.find((detector) => adId === detector.value);
      if (selectedValue) {
        selectedOptions = [selectedValue];
      }
    }
    return (
      <div
        style={{
          maxWidth: '390px',
        }}
      >
        <FormikComboBox
          name={'detectorId'}
          formRow
          rowProps={{
            label: 'Detector',
            isInvalid,
            error: hasError,
          }}
          fieldProps={{
            validate: (value) => validateDetector(value, selectedOptions[0]),
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
              form.setFieldValue('period', {
                interval: 2 * get(options, '0.interval.period.interval'),
                unit: get(options, '0.interval.period.unit', 'MINUTES').toUpperCase(),
              });
            },
            singleSelection: { asPlaintext: true },
            isClearable: false,
            selectedOptions,
          }}
        />
      </div>
    );
  }
}

AnomalyDetectors.propTypes = {
  values: PropTypes.object.isRequired,
  renderEmptyMessage: PropTypes.func.isRequired,
};

export default AnomalyDetectors;
