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
import FormikCheckableCard from '../../../../components/FormControls/FormikCheckableCard';

const onChangeDefinition = (e, form, resetResponse) => {
  const type = e.target.value;
  // resetResponse();
  form.setFieldValue('monitor_type', type);
};

const MonitorType = ({ values, resetResponse }) => (
  <div>
    <EuiFlexGroup>
      <EuiFlexItem>
        <FormikCheckableCard
          name="monitorTypeTraditional"
          formRow
          rowProps={{
            label: 'Choose a monitor type',
            style: { paddingLeft: '10px' },
          }}
          inputProps={{
            id: 'traditionalMonitorRadioCard',
            label: 'Traditional monitor',
            checked: values.monitor_type === 'traditional_monitor',
            value: 'traditional_monitor',
            onChange: (e, field, form) => {
              onChangeDefinition(e, form, resetResponse);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiSpacer />
        <FormikCheckableCard
          name="monitorTypeAggregation"
          formRow
          rowProps={{
            label: '',
            style: { paddingLeft: '10px' },
          }}
          inputProps={{
            id: 'aggregationMonitorRadioCard',
            label: 'Aggregation monitor',
            checked: values.monitor_type === 'aggregation_monitor',
            value: 'aggregation_monitor',
            onChange: (e, field, form) => {
              onChangeDefinition(e, form, resetResponse);
            },
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
);

export default MonitorType;
