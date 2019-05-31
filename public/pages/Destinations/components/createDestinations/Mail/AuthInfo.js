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
  FormikFieldPassword,
  FormikSwitch,
} from '../../../../../components/FormControls';
import { hasError, isInvalid } from '../../../../../utils/validate';
import SubHeader from '../../../../../components/SubHeader';

const propTypes = {
  type: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
};

const AuthInfo = ({ type, values }) => {
  const isAuthEnabled = values[type].auth;
  return (
    <Fragment>
      <SubHeader title={<h6>Auth information</h6>} description={''} />
      <FormikSwitch
        name={`${type}.auth`}
        formRow
        rowProps={{ style: { paddingLeft: '10px' } }}
        inputProps={{
          id: 'authenabled',
          checked: isAuthEnabled,
          label: 'Auth Enabled ?',
        }}
      />
      <FormikFieldText
        name={`${type}.username`}
        formRow
        rowProps={{
          label: 'Username',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          disabled: !isAuthEnabled,
          onFocus: (e, field, form) => {
            form.setFieldError(`${type}.username`, undefined);
          },
        }}
      />
      <FormikFieldPassword
        name={`${type}.password`}
        formRow
        rowProps={{
          label: 'Password',
          style: { paddingLeft: '10px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          disabled: !isAuthEnabled,
          onFocus: (e, field, form) => {
            form.setFieldError(`${type}.password`, undefined);
          },
        }}
      />
    </Fragment>
  );
};

AuthInfo.propTypes = propTypes;

export default AuthInfo;
