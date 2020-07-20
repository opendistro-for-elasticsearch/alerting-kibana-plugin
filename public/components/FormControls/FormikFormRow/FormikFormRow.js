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
import { EuiIcon, EuiFormRow, EuiToolTip } from '@elastic/eui';

const FormikFormRow = ({
  children,
  form,
  name,
  tooltipText,
  rowProps: { isInvalid, error, label, ...rest },
}) => (
  <EuiFormRow
    id={`${name}-form-row`}
    label={
      tooltipText ? (
        <EuiToolTip content={tooltipText}>
          <span>
            {label} <EuiIcon type="questionInCircle" color="subdued" />
          </span>
        </EuiToolTip>
      ) : (
        label
      )
    }
    isInvalid={typeof isInvalid === 'function' ? isInvalid(name, form) : isInvalid}
    error={typeof error === 'function' ? error(name, form) : error}
    {...rest}
  >
    {children}
  </EuiFormRow>
);

FormikFormRow.propTypes = {
  name: PropTypes.string.isRequired,
  rowProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  tooltipText: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default FormikFormRow;
