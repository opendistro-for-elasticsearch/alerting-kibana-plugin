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
import FormikSelect from '../../../../components/FormControls/FormikSelect/FormikSelect';

const selectDefinitions = [
  { value: 'graph', text: 'Define using visual graph' },
  { value: 'query', text: 'Define using extraction query' },
];

const onChangeDefinition = (e, form, resetResponse) => {
  const type = e.target.value;
  resetResponse();
  form.setFieldValue('searchType', type);
};

const MonitorDefinition = ({ resetResponse }) => (
  <FormikSelect
    name="searchType"
    formRow
    rowProps={{
      label: 'How do you want to define the monitor?',
      style: { paddingLeft: '10px' },
    }}
    inputProps={{
      options: selectDefinitions,
      onChange: (e, field, form) => {
        onChangeDefinition(e, form, resetResponse);
      },
    }}
  />
);

export default MonitorDefinition;
