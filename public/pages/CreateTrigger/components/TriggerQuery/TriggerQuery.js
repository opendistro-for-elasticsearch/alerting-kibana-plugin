/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React from 'react';
import { Field } from 'formik';
import _ from 'lodash';
import {
  EuiButton,
  EuiCodeEditor,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiText,
} from '@elastic/eui';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import { formikToTrigger } from '../../containers/CreateTrigger/utils/formikToTrigger';

export const getExecuteMessage = (response) => {
  if (!response) return 'No response';
  const triggerResults = _.get(response, 'trigger_results');
  if (!triggerResults) return 'No trigger results';
  const triggerId = Object.keys(triggerResults)[0];
  if (!triggerId) return 'No trigger results';
  const executeResults = _.get(triggerResults, `${triggerId}`);
  if (!executeResults) return 'No execute results';
  const { error, triggered } = executeResults;
  return error || `${triggered}`;
};

const TriggerQuery = ({
  context,
  executeResponse,
  onRun,
  triggerValues,
  setFlyout,
  isDarkMode,
  fieldPath,
}) => {
  const currentTrigger = _.isEmpty(fieldPath)
    ? triggerValues
    : _.get(triggerValues, `${fieldPath.slice(0, -1)}`, {});
  const trigger = { ...formikToTrigger(currentTrigger), actions: [] };
  const fieldName = `${fieldPath}script.source`;
  return (
    <div style={{ padding: '0px 10px', marginTop: '0px' }}>
      <EuiFlexGrid columns={2} gutterSize={'s'}>
        {/*// Grid slot for the trigger definition code editor header*/}
        <EuiFlexItem>
          <EuiFlexGroup alignItems={'center'} gutterSize={'s'}>
            <EuiFlexItem grow={false}>
              <EuiText size={'s'}>
                <h5>Trigger condition</h5>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText>
                <EuiLink
                  onClick={() => {
                    setFlyout({ type: 'triggerCondition', payload: context });
                  }}
                >
                  Info
                </EuiLink>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>

        {/*// Grid slot for the trigger condition response code editor header*/}
        <EuiFlexItem>
          <EuiFlexGroup alignItems={'center'} gutterSize={'none'}>
            <EuiText size={'s'}>
              <h5>Trigger condition response:</h5>
            </EuiText>
          </EuiFlexGroup>
        </EuiFlexItem>

        {/*// Grid slot for the trigger condition code editor box*/}
        <EuiFlexItem>
          <Field name={fieldName}>
            {({ field: { value }, form: { errors, touched, setFieldValue, setFieldTouched } }) => (
              <EuiFormRow
                fullWidth
                isInvalid={_.get(touched, fieldName, false) && !!_.get(errors, fieldName)}
                error={_.get(errors, fieldName)}
              >
                <EuiCodeEditor
                  mode="plain_text"
                  theme={isDarkMode ? 'sense-dark' : 'github'}
                  height="200px"
                  width="100%"
                  onChange={(source) => {
                    setFieldValue(fieldName, source);
                  }}
                  onBlur={() => setFieldTouched(fieldName, true)}
                  value={value}
                />
              </EuiFormRow>
            )}
          </Field>
        </EuiFlexItem>

        {/*// Grid slot for the trigger condition response code editor box*/}
        <EuiFlexItem>
          <EuiFormRow fullWidth>
            <EuiCodeEditor
              mode="plain_text"
              theme={isDarkMode ? 'sense-dark' : 'github'}
              height="200px"
              width="100%"
              value={getExecuteMessage(executeResponse)}
              readOnly
            />
          </EuiFormRow>
        </EuiFlexItem>

        {/*// Grid slot for the execute trigger condition button*/}
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => onRun([trigger])}>Run for condition response</EuiButton>
        </EuiFlexItem>
      </EuiFlexGrid>
    </div>
  );
};

export default TriggerQuery;
