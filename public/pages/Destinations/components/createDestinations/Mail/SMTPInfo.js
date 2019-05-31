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
  FormikFieldNumber,
  FormikSelect,
} from '../../../../../components/FormControls';
import { hasError, isInvalid } from '../../../../../utils/validate';

const propTypes = {
  type: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
};
const methodOptions = [{ value: 'plain', text: 'Plain' }, { value: 'ssl', text: 'SSL' }, { value: 'starttls', text: 'STARTTLS' }];

const SMTPInfo = ({ type, values }) => {
  return (
    <Fragment>
      <FormikFieldText
        name={`${type}.host`}
        formRow
        rowProps={{
          label: 'Host',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
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
      />
      <FormikSelect
        name={`${type}.method`}
        formRow
        rowProps={{
          label: 'Method',
          style: { paddingLeft: '10px' },
        }}
        inputProps={{
          options: methodOptions,
        }}
      />
    </Fragment>
  );
};

SMTPInfo.propTypes = propTypes;

export default SMTPInfo;
