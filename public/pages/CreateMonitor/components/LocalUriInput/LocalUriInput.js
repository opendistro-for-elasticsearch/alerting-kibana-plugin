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

import React, { Fragment } from 'react';
import { EuiSpacer, EuiFlexItem, EuiFlexGroup, EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import { hasError, isInvalid } from '../../../../utils/validate';
import { FormikFieldText } from '../../../../components/FormControls';

const LocalUriInput = ({ isDarkMode, response, values }) => (
  <Fragment>
    <EuiFlexGroup alignItems="flexStart">
      <EuiFlexItem>
        <EuiSpacer size="m" />
        <FormikFieldText
          name={`${values.searchType}.path`}
          formRow
          rowProps={{
            label: 'Path',
            helpText:
              'The path associated with the REST API the monitor should call (e.g., "/_cluster/health").',
            style: { paddingLeft: '10px' },
            isInvalid,
            error: hasError,
          }}
          inputProps={{
            isInvalid,
            onChange: (e, field, form) => {
              form.setFieldValue('uri.path', e.target.value);
            },
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow label="Response" fullWidth>
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
  </Fragment>
);

export default LocalUriInput;
