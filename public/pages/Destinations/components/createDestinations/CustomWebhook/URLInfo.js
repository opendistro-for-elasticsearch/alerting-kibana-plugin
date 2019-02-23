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
import PropTypes from 'prop-types';
import {
  FormikFieldText,
  FormikSelect,
  FormikFieldNumber,
  FormikFieldRadio,
} from '../../../../../components/FormControls';
import { hasError, isInvalid } from '../../../../../utils/validate';
import { validateUrl, validateHost } from './validate';
import { URL_TYPE } from '../../../containers/CreateDestination/utils/constants';

const propTypes = {
  type: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
};
const protocolOptions = [{ value: 'HTTPS', text: 'HTTPS' }, { value: 'HTTP', text: 'HTTP' }];

const URLInfo = ({ type, values }) => {
  const isUrlEnabled = values[type].urlType === URL_TYPE.FULL_URL;
  return (
    <Fragment>
      <FormikFieldRadio
        name={`${type}.urlType`}
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
                [type]: {
                  ...values[type],
                  scheme: '',
                  host: '',
                  port: '',
                  path: '',
                },
              };
              form.setTouched({
                [type]: {
                  scheme: false,
                  host: false,
                  port: false,
                  path: false,
                },
              });
              form.setValues(customValues);
            }
            field.onChange(e);
          },
        }}
      />
      <FormikFieldText
        name={`${type}.url`}
        formRow
        fieldProps={{
          validate: fieldValue => validateUrl(fieldValue, values),
        }}
        rowProps={{
          label: 'Webhook URL',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          disabled: !isUrlEnabled,
          isInvalid,
        }}
      />
      <FormikFieldRadio
        name={`${type}.urlType`}
        formRow
        value="customUrl"
        inputProps={{
          id: 'customUrl',
          value: URL_TYPE.ATTRIBUTE_URL,
          checked: !isUrlEnabled,
          label: 'Define endpoint by custom attributes URL',
          onChange: (e, field, form) => {
            // Clear Full URL if user switched to custom URL
            if (field.value === URL_TYPE.FULL_URL) {
              form.setFieldTouched(`${type}.url`, false, false);
              form.setFieldValue(`${type}.url`, '');
            }
            field.onChange(e);
          },
        }}
      />
      <FormikSelect
        name={`${type}.scheme`}
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
        name={`${type}.host`}
        formRow
        fieldProps={{
          validate: fieldValue => validateHost(fieldValue, values),
        }}
        rowProps={{
          label: 'Host',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          disabled: isUrlEnabled,
          isInvalid,
          onFocus: (e, field, form) => {
            form.setFieldError(`${type}.host`, undefined);
          },
        }}
      />
      <FormikFieldNumber
        name={`${type}.port`}
        formRow
        rowProps={{
          label: 'Port',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          disabled: isUrlEnabled,
          isInvalid,
        }}
      />
      <FormikFieldText
        name={`${type}.path`}
        formRow
        rowProps={{
          label: 'Path',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          disabled: isUrlEnabled,
          isInvalid,
        }}
      />
    </Fragment>
  );
};

URLInfo.propTypes = propTypes;

export default URLInfo;
