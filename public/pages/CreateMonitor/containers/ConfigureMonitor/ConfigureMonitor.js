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

import ContentPanel from '../../../../components/ContentPanel';
import MonitorState from '../../components/MonitorState';
import Schedule from '../../components/Schedule';
import { hasError, isInvalid, validateMonitorName } from '../../../../utils/validate';
import FormikFieldText from '../../../../components/FormControls/FormikFieldText';

const ConfigureMonitor = ({ httpClient, monitorToEdit }) => (
  <ContentPanel title="Configure monitor" titleSize="s" bodyStyles={{ padding: 'initial' }}>
    <FormikFieldText
      name="name"
      formRow
      fieldProps={{ validate: validateMonitorName(httpClient, monitorToEdit) }}
      rowProps={{
        label: 'Monitor name',
        style: { paddingLeft: '10px' },
        isInvalid,
        error: hasError,
      }}
      inputProps={{
        isInvalid,
        onFocus: (e, field, form) => {
          form.setFieldError('name', undefined);
        },
      }}
    />
    <MonitorState />
  </ContentPanel>
);

export default ConfigureMonitor;
