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
import { ES_AD_PLUGIN, SEARCH_TYPE } from '../../../../utils/constants';

const onChangeDefinition = (e, form, resetResponse) => {
  const type = e.target.value;
  // resetResponse();
  form.setFieldValue('searchType', type, false);
};

const MonitorDefinitionCard = ({ values, resetResponse, plugins }) => {
  const hasADPlugin = plugins.indexOf(ES_AD_PLUGIN) !== -1;
  const isAggregationMonitor = values.monitor_type === 'aggregation_monitor';
  return (
    <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          <FormikCheckableCard
            name="searchTypeGraph"
            formRow
            rowProps={{
              label: 'Choose a monitor defining method',
              style: { paddingLeft: '10px' },
            }}
            inputProps={{
              id: 'visualEditorRadioCard',
              label: 'Visual editor',
              checked: values.searchType === SEARCH_TYPE.GRAPH,
              value: SEARCH_TYPE.GRAPH,
              onChange: (e, field, form) => {
                onChangeDefinition(e, form, resetResponse);
              },
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSpacer />
          <FormikCheckableCard
            name="searchTypeQuery"
            formRow
            rowProps={{
              label: '',
              style: { paddingLeft: '10px' },
            }}
            inputProps={{
              id: 'extractionQueryEditorRadioCard',
              label: 'Extraction query editor',
              checked: values.searchType === SEARCH_TYPE.QUERY,
              value: SEARCH_TYPE.QUERY,
              onChange: (e, field, form) => {
                onChangeDefinition(e, form, resetResponse);
              },
            }}
          />
        </EuiFlexItem>
        {!isAggregationMonitor && (
          <EuiFlexItem>
            <EuiSpacer />
            <FormikCheckableCard
              name="searchTypeLocalUri"
              formRow
              rowProps={{
                label: '',
                style: { paddingLeft: '10px' },
              }}
              inputProps={{
                id: 'localUriRadioCard',
                label: 'Local URI Endpoint',
                checked: values.searchType === SEARCH_TYPE.LOCAL_URI,
                value: SEARCH_TYPE.LOCAL_URI,
                onChange: (e, field, form) => {
                  onChangeDefinition(e, form, resetResponse);
                },
              }}
            />
          </EuiFlexItem>
        )}
        {/* TODO: only show the anomaly detector option when anomaly detection plugin is present */}
        {hasADPlugin && (
          <EuiFlexItem>
            <EuiSpacer />
            <FormikCheckableCard
              name="searchTypeAD"
              inputProps={{
                id: 'anomalyDetectorRadioCard',
                label: 'Anomaly detector',
                checked: values.searchType === SEARCH_TYPE.AD,
                value: SEARCH_TYPE.AD,
                onChange: (e, field, form) => {
                  onChangeDefinition(e, form, resetResponse);
                },
              }}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </div>
  );
};

export default MonitorDefinitionCard;
