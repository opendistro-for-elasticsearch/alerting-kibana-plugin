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
import { Field } from 'formik';
import _ from 'lodash';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import { formikToTrigger } from '../../containers/CreateTrigger/utils/formikToTrigger';

export const getExecuteMessage = response => {
  if (!response) return 'No response';
  const triggerResults = _.get(response, 'trigger_results');
  if (!triggerResults) return 'No trigger results';
  const triggerId = Object.keys(triggerResults)[0];
  if (!triggerId) return 'No trigger results';
  const executeResults = _.get(triggerResults, `${triggerId}`);
  if (!executeResults) return 'No execute results';
  const { error, triggered } = executeResults;
  if (error) return `ERROR: ${error}`;
  return `${triggered}`;
};

const TriggerQuery = ({
  context,
  error,
  executeResponse,
  onRun,
  response,
  triggerValues,
  setFlyout,
  isDarkMode,
}) => {
  const trigger = { ...formikToTrigger(triggerValues), actions: [] };
  const formattedResponse = JSON.stringify(response, null, 4);
  return (
    <div style={{ padding: '0px 10px', marginTop: '0px' }}>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFormRow label="Extraction query response" fullWidth>
            <EuiCodeEditor
              mode="json"
              theme={isDarkMode ? 'sense-dark' : 'github'}
              width="100%"
              value={error || formattedResponse}
              readOnly
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <Field
            name="script.source"
            render={({
              field: { value },
              form: { errors, touched, setFieldValue, setFieldTouched },
            }) => (
              <EuiFormRow
                label={
                  <div>
                    <span>Trigger condition</span>
                    <EuiButtonEmpty
                      size="s"
                      onClick={() => {
                        setFlyout({ type: 'triggerCondition', payload: context });
                      }}
                    >
                      Info
                    </EuiButtonEmpty>
                  </div>
                }
                fullWidth
                isInvalid={
                  _.get(touched, 'script.source', false) && !!_.get(errors, 'script.source')
                }
                error={_.get(errors, 'script.source')}
              >
                <EuiCodeEditor
                  mode="plain_text"
                  theme={isDarkMode ? 'sense-dark' : 'github'}
                  height="300px"
                  width="100%"
                  onChange={source => {
                    setFieldValue('script.source', source);
                  }}
                  onBlur={() => setFieldTouched('script.source', true)}
                  value={value}
                />
              </EuiFormRow>
            )}
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="s" />

      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <strong>Trigger condition response: </strong>
            <span>{getExecuteMessage(executeResponse)}</span>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => onRun([trigger])}>Run</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};

export default TriggerQuery;
