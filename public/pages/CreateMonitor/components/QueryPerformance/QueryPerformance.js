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

import React, { Fragment } from 'react';
import _ from 'lodash';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText } from '@elastic/eui';

import SubHeader from '../../../../components/SubHeader';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { URL } from '../../../../../utils/constants';

const QueryPerformance = ({ response }) => (
  <Fragment>
    <SubHeader
      title={<h4>Query performance</h4>}
      description={
        <span>
          Check the performance of your query and make sure to follow best practices.{' '}
          <a href={URL.DOCUMENTATION}>Learn more</a>
        </span>
      }
    />
    <EuiSpacer size="s" />
    <EuiFlexGroup
      style={{ padding: '0px 10px' }}
      justifyContent="spaceBetween"
      alignItems="center"
      gutterSize="none"
    >
      <EuiFlexItem>
        <EuiText size="xs">
          <strong>Query duration</strong>
          <span style={{ display: 'block' }}>
            {`${_.get(response, 'took', DEFAULT_EMPTY_DATA)} ms`}
          </span>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText size="xs">
          <strong>Request duration</strong>
          <span style={{ display: 'block' }}>
            {_.get(response, 'invalid.path', DEFAULT_EMPTY_DATA)}
          </span>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText size="xs">
          <strong>Hits</strong>
          <span style={{ display: 'block' }}>
            {_.get(response, 'hits.total.value', DEFAULT_EMPTY_DATA)}
          </span>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  </Fragment>
);

export default QueryPerformance;
