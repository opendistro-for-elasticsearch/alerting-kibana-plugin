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

import React, { Fragment } from 'react';
import {
  EuiText,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiCallOut,
} from '@elastic/eui';
import { URL } from '../../../../utils/constants';

const detectorFailure = (context) => ({
  flyoutProps: {
    'aria-labelledby': 'createDetectorFlyout',
    maxWidth: 500,
    size: 'm',
  },
  headerProps: { hasBorder: true },
  header: (
    <EuiTitle size="m" style={{ fontSize: '25px' }}>
      <h2>
        <strong>Anomaly Detector Can't Be Created</strong>
      </h2>
    </EuiTitle>
  ),
  body: (
    <Fragment>
      <EuiCallOut size="m" title="Sorry, there was an error" color="danger" iconType="alert">
        <p>
          Unfortunately we aren’t able to automatically create an Anomaly detector from this monitor
          due to the follow reason: {context.message}
        </p>
      </EuiCallOut>
    </Fragment>
  ),
});

export default detectorFailure;
