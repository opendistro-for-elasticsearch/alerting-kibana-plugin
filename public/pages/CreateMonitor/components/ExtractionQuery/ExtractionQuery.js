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
import { EuiCodeEditor, EuiFlexGroup, EuiFlexItem, EuiFormRow } from '@elastic/eui';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';

import { FormikCodeEditor } from '../../../../components/FormControls';
import { isInvalid, hasError, validateExtractionQuery } from '../../../../utils/validate';

const ExtractionQuery = ({ isDarkMode, response }) => (
  <EuiFlexGroup>
    <EuiFlexItem>
      <FormikCodeEditor
        name="query"
        formRow
        fieldProps={{ validate: validateExtractionQuery }}
        rowProps={{
          label: 'Define extraction query',
          fullWidth: true,
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          mode: 'json',
          width: '100%',
          height: '500px',
          theme: isDarkMode ? 'sense-dark' : 'github',
          onChange: (query, field, form) => {
            form.setFieldValue('query', query);
          },
          onBlur: (e, field, form) => {
            form.setFieldTouched('query', true);
          },
        }}
      />
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiFormRow label="Extraction query response" fullWidth>
        <EuiCodeEditor
          mode="json"
          theme={isDarkMode ? 'sense-dark' : 'github'}
          width="100%"
          height="500px"
          value={response}
          readOnly
        />
      </EuiFormRow>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default ExtractionQuery;
