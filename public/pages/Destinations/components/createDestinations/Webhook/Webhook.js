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
import PropTypes from 'prop-types';
import { FormikFieldText } from '../../../../../components/FormControls';
import { hasError, isInvalid, required } from '../../../../../utils/validate';

//TODO:: verify the Regex for all the cases based on what backend support
const validateURL = (value) => {
  if (!value) return 'Required';
  const isValidUrl = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
    value
  );
  if (!isValidUrl) return 'Invalid URL';
};

const Webhook = ({ type }) => {
  return (
    <FormikFieldText
      name={`${type}.url`}
      formRow
      fieldProps={{ validate: validateURL }}
      rowProps={{
        label: 'Webhook URL:',
        style: { paddingLeft: '10px' },
        isInvalid,
        error: hasError,
      }}
      inputProps={{
        isInvalid,
        // 'validateURL()' is only called onBlur, but we enable the basic 'required()' validation onChange
        onChange: (e, field, form) => {
          field.onChange(e);
          form.setFieldError('name', required(e.target.value));
        },
      }}
    />
  );
};

Webhook.propTypes = {
  type: PropTypes.string.isRequired,
};

export default Webhook;
