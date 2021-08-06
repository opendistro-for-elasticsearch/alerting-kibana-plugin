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
import { MONITOR_TYPE } from '../../../../utils/constants';

const onChangeDefinition = (e, form) => {
  const type = e.target.value;
  form.setFieldValue('monitor_type', type);
};

const MonitorType = ({ values }) => (
  <div>
    <EuiFlexGroup>
      <EuiFlexItem>
        <FormikCheckableCard
          name="monitorTypeQueryLevel"
          formRow
          rowProps={{
            label: 'Choose a monitor type',
            style: { paddingLeft: '10px' },
          }}
          inputProps={{
            id: 'queryLevelMonitorRadioCard',
            label: 'Query-Level Monitor',
            checked: values.monitor_type === MONITOR_TYPE.QUERY_LEVEL,
            value: MONITOR_TYPE.QUERY_LEVEL,
            onChange: (e, field, form) => {
              onChangeDefinition(e, form);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiSpacer />
        <FormikCheckableCard
          name="monitorTypeBucketLevel"
          formRow
          rowProps={{
            label: '',
            style: { paddingLeft: '10px' },
          }}
          inputProps={{
            id: 'bucketLevelMonitorRadioCard',
            label: 'Bucket-Level Monitor',
            checked: values.monitor_type === MONITOR_TYPE.BUCKET_LEVEL,
            value: MONITOR_TYPE.BUCKET_LEVEL,
            onChange: (e, field, form) => {
              onChangeDefinition(e, form);

            },
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
);

export default MonitorType;
