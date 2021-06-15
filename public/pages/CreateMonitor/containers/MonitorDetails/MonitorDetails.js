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

import { React } from '@kbn/ui-shared-deps/entry';
import { EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiCheckableCard, EuiFormRow } from '@elastic/eui';
import ContentPanel from '../../../../components/ContentPanel';
import FormikFieldText from '../../../../components/FormControls/FormikFieldText';
import { hasError, isInvalid, required, validateMonitorName } from '../../../../utils/validate';
import Schedule from '../../components/Schedule';
import { FormikFormRow, FormikInputWrapper } from '../../../../components/FormControls';
import MonitorDefinitionCard from '../../components/MonitorDefinitionCards';
import MonitorType from '../../components/MonitorType';

const onChangeDefinition = (e, form, resetResponse) => {
  const type = e.target.value;
  resetResponse();
  form.setFieldValue('searchType', type);
  // Debug use
  console.log('Entering onChange: ' + form);
};

// TODO: Make sure that resetResponse is defined in Query and passed to MonitorDetails
const MonitorDetails = ({
  values,
  errors,
  httpClient,
  monitorToEdit,
  isAd,
  resetResponse,
  plugins,
}) => (
  <ContentPanel title="Monitor details" titleSize="s" bodyStyles={{ padding: 'initial' }}>
    <MonitorType values={values} resetResponse={resetResponse} />
    <EuiSpacer size="s" />
    <MonitorDefinitionCard values={values} plugins={plugins} resetResponse={resetResponse} />
    <EuiSpacer size="s" />
    <FormikFieldText
      name="name"
      formRow
      fieldProps={{ validate: validateMonitorName(httpClient, monitorToEdit) }}
      rowProps={{
        label: 'Name',
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
    <Schedule isAd={isAd} />
  </ContentPanel>
);

export default MonitorDetails;
