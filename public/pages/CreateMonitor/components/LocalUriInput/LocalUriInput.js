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
import { EuiSpacer, EuiFlexItem, EuiFlexGroup, EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import FormikSelect from '../../../../components/FormControls/FormikSelect';

const supportedClusterApis = [
  { value: '', text: '' },
  { value: '/_cluster/health', text: 'Define using ClusterHealth endpoint' },
  { value: '/_cluster/stats', text: 'Define using ClusterStats endpoint' },
];

const LocalUriInput = ({ isDarkMode, response, values }) => (
  <Fragment>
    <EuiFlexGroup alignItems="flexStart">
      <EuiFlexItem>
        <EuiSpacer size="m" />
        <FormikSelect
          name={`${values.searchType}.apiType`}
          formRow
          rowProps={{
            label: 'Select API',
            style: { paddingLeft: '10px' },
          }}
          inputProps={{
            options: supportedClusterApis,
            onChange: (e, field, form) => {
              form.setFieldValue('apiType', e.target.value);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow label="Response" fullWidth>
          <EuiCodeEditor
            mode="json"
            theme={isDarkMode ? 'sense-dark' : 'github'}
            width="100%"
            height="500px"
            value={response}
            readOnly
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </Fragment>
);

export default LocalUriInput;
