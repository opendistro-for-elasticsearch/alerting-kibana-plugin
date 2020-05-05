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
import { EuiEmptyPrompt, EuiButton, EuiText, EuiLoadingChart } from '@elastic/eui';
import { KIBANA_AD_PLUGIN } from '../../../../../utils/constants';

const EmptyFeaturesMessage = props => (
  <div
    style={{
      borderRadius: '5px',
      padding: '10px',
      border: '1px solid #D9D9D9',
      height: '250px',
      width: '100%',
      ...props.containerStyle,
    }}
  >
    {props.isLoading ? (
      <EuiEmptyPrompt style={{ maxWidth: '45em' }} body={<EuiLoadingChart size="xl" />} />
    ) : (
      <EuiEmptyPrompt
        style={{ maxWidth: '45em' }}
        body={
          <EuiText>
            No features have been added to this anomaly detector. A feature is a metric that is used
            for anomaly detection. A detector can discover anomalies across one or more features.
          </EuiText>
        }
        actions={[
          <EuiButton
            data-test-subj="createButton"
            href={`${KIBANA_AD_PLUGIN}#/detectors/${props.detectorId}/features`}
            target="_blank"
          >
            Add Feature
          </EuiButton>,
        ]}
      />
    )}
  </div>
);

EmptyFeaturesMessage.propTypes = {
  detectorId: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  containerStyle: PropTypes.object,
};
EmptyFeaturesMessage.defaultProps = {
  detectorId: '',
  containerStyle: {},
};

export { EmptyFeaturesMessage };
