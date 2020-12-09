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
import moment from 'moment';
import { CoreContext } from '../../../../utils/CoreContext';
import { AD_PREVIEW_DAYS } from '../../../../utils/constants';
import { backendErrorNotification } from '../../../../utils/helpers';

class AnomalyDetectorData extends React.Component {
  static contextType = CoreContext;
  constructor(props) {
    super(props);
    this.state = {
      anomalyResult: {
        anomalies: [],
        featureData: {},
      },
      detector: {
        featureAttributes: [],
      },
      previewStartTime: 0,
      previewEndTime: 0,
      isLoading: false,
    };
    this.getPreviewData = this.getPreviewData.bind(this);
  }
  async componentDidMount() {
    await this.getPreviewData();
  }

  async getPreviewData() {
    const { detectorId, startTime, endTime } = this.props;
    const { http: httpClient, notifications } = this.context;
    this.setState({
      isLoading: true,
    });
    if (!detectorId) return;
    const requestParams = {
      startTime: moment().subtract(AD_PREVIEW_DAYS, 'd').valueOf(),
      startTime: startTime,
      endTime: endTime,
      preview: this.props.preview,
    };
    try {
      const response = await httpClient.get(`../api/alerting/detectors/${detectorId}/results`, {
        query: requestParams,
      });
      if (response.ok) {
        const { anomalyResult, detector } = response.response;
        this.setState({
          ...this.state,
          anomalyResult,
          detector,
          previewStartTime: requestParams.startTime,
          previewEndTime: requestParams.endTime,
          isLoading: false,
        });
      } else {
        this.setState({
          isLoading: false,
        });
        backendErrorNotification(notifications, 'get', 'detector results', response.error);
      }
    } catch (err) {
      console.error('Unable to get detectorResults', err);
      this.setState({
        isLoading: false,
      });
    }
  }
  render() {
    const { render } = this.props;
    return render({ ...this.state });
  }
}

AnomalyDetectorData.propTypes = {
  detectorId: PropTypes.string.isRequired,
  preview: PropTypes.bool,
};
AnomalyDetectorData.defaultProps = {
  preview: true,
  startTime: moment().subtract(5, 'd').valueOf(),
  endTime: moment().valueOf(),
};

export { AnomalyDetectorData };
