/*
 *   Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import FormikCheckableCard from '../../../../components/FormControls/FormikCheckableCard/FormikCheckableCard';

const onChangeDefinition = (e, form, resetResponse) => {
  const type = e.target.value;
  resetResponse();
  form.setFieldValue('searchType', type);
  // Debug use
  console.log('Entering onChange: ' + JSON.stringify(form));
};

const MonitorDefinitionCard = ({ resetResponse, plugins }) => (
  <div>
    <EuiFlexGroup>
      <EuiFlexItem>
        <FormikCheckableCard
          name="searchType"
          formRow
          rowProps={{
            label: 'Choose a monitor defining method',
            style: { paddingLeft: '10px' },
          }}
          inputProps={{
            id: 'visualEditorRadioCard',
            label: 'Visual editor',
            value: 'graph',
            onChange: (e, field, form) => {
              onChangeDefinition(e, form, resetResponse);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiSpacer />
        <FormikCheckableCard
          name="searchType"
          formRow
          rowProps={{
            label: '',
            style: { paddingLeft: '10px' },
          }}
          inputProps={{
            id: 'extractionQueryEditorRadioCard',
            label: 'Extraction query editor',
            value: 'query',
            onChange: (e, field, form) => {
              onChangeDefinition(e, form, resetResponse);
            },
          }}
        />
      </EuiFlexItem>
      {/* TODO: only show the anomaly detector option when anomaly detection plugin is present */}
      {/*{isAd && (*/}
      <EuiFlexItem>
        <EuiSpacer />
        <FormikCheckableCard
          name="searchType"
          inputProps={{
            id: 'anomalyDetectorRadioCard',
            label: 'Anomaly detector',
            value: 'ad',
            onChange: (e, field, form) => {
              onChangeDefinition(e, form, resetResponse);
            },
          }}
        />
      </EuiFlexItem>
      {/*)}*/}
    </EuiFlexGroup>
  </div>
);

export default MonitorDefinitionCard;
