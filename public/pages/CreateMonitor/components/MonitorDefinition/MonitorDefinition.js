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
import FormikSelect from '../../../../components/FormControls/FormikSelect/FormikSelect';
import { ES_AD_PLUGIN } from '../../../../utils/constants';
import MonitorDefinitionCard from '../MonitorDefinitionCards';

const defaultSelectDefinitions = [
  { value: 'graph', text: 'Define using visual graph' },
  { value: 'query', text: 'Define using extraction query' },
  { value: 'localUri', text: 'Define using Local URI endpoint' },
];

const aggregationMonitorDefinitions = [
  { value: 'graph', text: 'Define using visual graph' },
  { value: 'query', text: 'Define using extraction query' },
];

const onChangeDefinition = (e, form, resetResponse) => {
  const type = e.target.value;
  resetResponse();
  form.setFieldValue('searchType', type);
};

const selectDefinitions = (plugins, isAggregationMonitor) => {
  const definitionOptions = isAggregationMonitor
    ? aggregationMonitorDefinitions
    : defaultSelectDefinitions;
  return plugins === undefined || plugins.indexOf(ES_AD_PLUGIN) == -1
    ? definitionOptions
    : [...definitionOptions, { value: 'ad', text: 'Define using anomaly detector' }];
};

const MonitorDefinition = ({ resetResponse, plugins, isAggregationMonitor }) => (
  <div>
    <FormikSelect
      name="searchType"
      formRow
      rowProps={{
        label: 'Method of definition',
        style: { paddingLeft: '10px' },
      }}
      inputProps={{
        options: selectDefinitions(plugins, isAggregationMonitor),
        onChange: (e, field, form) => {
          onChangeDefinition(e, form, resetResponse);
        },
      }}
    />
  </div>
);

export default MonitorDefinition;
