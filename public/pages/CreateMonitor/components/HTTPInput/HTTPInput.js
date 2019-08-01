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
import { EuiSpacer, EuiFlexItem, EuiFlexGroup, EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import { FormikFieldNumber } from '../../../../components/FormControls';
import { isInvalid } from '../../../../utils/validate';
import { URL_TYPE } from '../../../Destinations/containers/CreateDestination/utils/constants';
import URLInfo from './URLInfo';
import QueryParamsEditor from '../../../Destinations/components/createDestinations/CustomWebhook/QueryParamsEditor';

const HTTPInput = ({ isDarkMode, response, values }) => (
  <div>
    <EuiFlexGroup>
      <EuiFlexItem>
        <URLInfo isDarkMode={isDarkMode} response={response} values={values} />
        <EuiSpacer size="m" />
        {values.http.urlType === URL_TYPE.ATTRIBUTE_URL && (
          <QueryParamsEditor type={values.searchType} queryParams={values.http.queryParams} />
        )}
        <EuiSpacer size="m" />
        <FormikFieldNumber
          name="connection_timeout"
          formRow
          rowProps={{
            label: 'Connection Timeout(s)',
            style: { paddingLeft: '10px' },
            isInvalid,
          }}
          inputProps={{
            isInvalid,
          }}
        />
        <FormikFieldNumber
          name="socket_timeout"
          formRow
          rowProps={{
            label: 'Socket Timeout(s)',
            style: { paddingLeft: '10px' },
            isInvalid,
          }}
          inputProps={{
            isInvalid,
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow label="HTTP response" fullWidth>
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
  </div>
);

export default HTTPInput;
