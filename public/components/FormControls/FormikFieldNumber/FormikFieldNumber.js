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
import { EuiFieldNumber } from '@elastic/eui';

import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const FormikFieldNumber = ({
  name,
  formRow = false,
  fieldProps = {},
  rowProps = {},
  inputProps = {},
}) => (
  <FormikInputWrapper
    name={name}
    fieldProps={fieldProps}
    render={({ field, form }) =>
      formRow ? (
        <FormikFormRow name={name} form={form} rowProps={rowProps}>
          <FieldNumber name={name} form={form} field={field} inputProps={inputProps} />
        </FormikFormRow>
      ) : (
        <FieldNumber name={name} form={form} field={field} inputProps={inputProps} />
      )
    }
  />
);

const FieldNumber = ({ name, form, field, inputProps: { onChange, isInvalid, ...rest } }) => (
  <EuiFieldNumber
    {...field}
    {...rest}
    onChange={(e) =>
      typeof onChange === 'function' ? onChange(e, field, form) : field.onChange(e)
    }
    isInvalid={typeof isInvalid === 'function' ? isInvalid(name, form) : isInvalid}
  />
);

FormikFieldNumber.propTypes = {
  name: PropTypes.string.isRequired,
  tooltipText: PropTypes.string,
  formRow: PropTypes.bool,
  fieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  inputProps: PropTypes.object,
};

FieldNumber.propTypes = {
  name: PropTypes.string.isRequired,
  inputProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

export default FormikFieldNumber;
