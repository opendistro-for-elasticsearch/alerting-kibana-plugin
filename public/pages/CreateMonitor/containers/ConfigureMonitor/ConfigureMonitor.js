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
import { EuiSpacer } from '@elastic/eui';

import ContentPanel from '../../../../components/ContentPanel';
import MonitorState from '../../components/MonitorState';
import { hasError, isInvalid, required, validateMonitorName } from '../../../../utils/validate';
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
        /* To reduce the frequency of search request,
        the comprehensive 'validationMonitorName()' is only called onBlur,
        but we enable the basic 'required()' validation onChange for good user experience.*/
        onChange: (e, field, form) => {
          field.onChange(e);
          form.setFieldError('name', required(e.target.value));
        },
      }}
    />
    <EuiSpacer size="s" />
    <MonitorState />
  </ContentPanel>
);

export default ConfigureMonitor;
