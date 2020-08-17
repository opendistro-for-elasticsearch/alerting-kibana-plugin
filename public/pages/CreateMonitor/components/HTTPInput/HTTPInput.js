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

import React, { Fragment } from 'react';
import { EuiSpacer, EuiFlexItem, EuiFlexGroup, EuiCodeEditor, EuiFormRow } from '@elastic/eui';
import { FormikFieldNumber } from '../../../../components/FormControls';
import { isInvalid } from '../../../../utils/validate';
import URLInfo from '../../../Destinations/components/createDestinations/CustomWebhook/URLInfo';
import SubHeader from '../../../../components/SubHeader';

const HTTPInput = ({ isDarkMode, response, values }) => (
  // alignItems='flexStart' is required for EuiFlexGroup to display correctly in narrow window
  <Fragment>
    <EuiFlexGroup alignItems="flexStart">
      <EuiFlexItem>
        <EuiSpacer size="m" />
        <URLInfo
          isDarkMode={isDarkMode}
          response={response}
          type={values.searchType}
          values={values}
        />
        <EuiSpacer size="m" />
        <Fragment>
          <SubHeader title={<h6>Timeout settings</h6>} description={''} />
          <FormikFieldNumber
            name={`${values.searchType}.connection_timeout`}
            formRow
            rowProps={{
              label: 'Connection Timeout',
              style: { paddingLeft: '10px' },
              helpText:
                'The maximum amount of time that the program can wait to setup a connection to the sever. Up to 5 seconds.',
              isInvalid,
            }}
            inputProps={{
              append: 'sec',
              isInvalid,
              min: 1,
              max: 5,
            }}
          />
          <FormikFieldNumber
            name={`${values.searchType}.socket_timeout`}
            formRow
            rowProps={{
              label: 'Socket Timeout',
              style: { paddingLeft: '10px' },
              helpText:
                'The maximum amount of time that the program can wait to receive the full response from the server. Up to 60 seconds.',
              isInvalid,
            }}
            inputProps={{
              append: 'sec',
              isInvalid,
              min: 1,
              max: 60,
            }}
          />
        </Fragment>
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
  </Fragment>
);

export default HTTPInput;
