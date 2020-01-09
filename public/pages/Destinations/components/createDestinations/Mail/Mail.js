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
import { FormikFieldText } from '../../../../../components/FormControls';
import { hasError, isInvalid } from '../../../../../utils/validate';

const propTypes = {
  type: PropTypes.string.isRequired,
};
const Mail = ({ type, values }) => (
  <div>
    <Fragment>
      <FormikFieldText
        name={`${type}.recipients`}
        formRow
        rowProps={{
          label: 'Recipients',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          onFocus: (e, field, form) => {
            form.setFieldError(`${type}.recipients`, undefined);
          },
        }}
      />
    </Fragment>
  </div>
);

Mail.propTypes = propTypes;

export default Mail;
