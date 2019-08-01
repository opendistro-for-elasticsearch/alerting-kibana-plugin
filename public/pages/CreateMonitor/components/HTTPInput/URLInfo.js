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
import {
  FormikFieldNumber,
  FormikFieldRadio,
  FormikFieldText,
  FormikSelect,
} from '../../../../components/FormControls';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import { hasError, isInvalid } from '../../../../utils/validate';
import { EuiSpacer } from '@elastic/eui';
import { URL_TYPE } from '../../../Destinations/containers/CreateDestination/utils/constants';

const protocolOptions = [{ value: 'https', text: 'HTTPS' }, { value: 'http', text: 'HTTP' }];

const URLInfo = ({ values }) => {
  let isUrlEnabled = values.http.urlType === URL_TYPE.FULL_URL;
  return (
    <Fragment>
      <FormikFieldRadio
        name="http.urlType"
        formRow
        inputProps={{
          id: 'fullUrl',
          value: URL_TYPE.FULL_URL,
          checked: isUrlEnabled,
          label: 'Define endpoint by URL',
          onChange: (e, field, form) => {
            // Clear Custom URL if user switched to custom URL
            if (field.value === URL_TYPE.ATTRIBUTE_URL) {
              const customValues = {
                ...values,
                http: {
                  ...values.http,
                  scheme: '',
                  host: '',
                  port: '',
                  path: '',
                },
              };
              form.setTouched({
                scheme: false,
                host: false,
                port: false,
                path: false,
              });
              form.setValues(customValues);
            }
            field.onChange(e);
          },
        }}
      />
      <FormikFieldText
        name="http.url"
        formRowps={{
          label: 'URL',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          disabled: !isUrlEnabled,
          isInvalid,
        }}
      />
      <EuiSpacer size="m" />
      <FormikFieldRadio
        name="http.urlType"
        formRow
        inputProps={{
          id: 'customUrl',
          value: URL_TYPE.ATTRIBUTE_URL,
          checked: !isUrlEnabled,
          label: 'Define endpoint by custom attributes URL',
          onChange: (e, field, form) => {
            if (field.value === URL_TYPE.FULL_URL) {
              form.setFieldTouched(`http.url`, false, false);
              form.setFieldValue(`http.url`, '');
            }
            field.onChange(e);
          },
        }}
      />
      <FormikSelect
        name="http.scheme"
        formRow
        rowProps={{
          label: 'Type',
          style: { paddingLeft: '10px' },
        }}
        inputProps={{
          disabled: isUrlEnabled,
          options: protocolOptions,
        }}
      />
      <FormikFieldText
        name="http.host"
        formRow
        rowProps={{
          label: 'Host',
          style: { paddingLeft: '10px' },
          isInvalid,
        }}
        inputProps={{
          disabled: isUrlEnabled,
          isInvalid,
          onFocus: (e, field, form) => {
            form.setFieldError(`http.host`, undefined);
          },
        }}
      />
      <FormikFieldNumber
        name="http.port"
        formRow
        rowProps={{
          label: 'Port',
          style: { paddingLeft: '10px' },
          isInvalid,
        }}
        inputProps={{
          disabled: isUrlEnabled,
          isInvalid,
        }}
      />
      <FormikFieldText
        name="http.path"
        formRow
        rowProps={{
          label: 'Path',
          style: { paddingLeft: '10px' },
          isInvalid,
        }}
        inputProps={{
          disabled: isUrlEnabled,
          isInvalid,
        }}
      />
    </Fragment>
  );
};

export default URLInfo;
