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
import FormikSelect from '../../../../components/FormControls/FormikSelect/FormikSelect';
import { hasError, isInvalid } from '../../../../utils/validate';
import { validateTimeField } from './utils/validation';

const MonitorTimeField = ({ dataTypes }) => {
  // Default empty option + options from index mappings mapped to ui select form
  const dateFields = Array.from(dataTypes.date || []);
  const options = [''].concat(dateFields).map(option => ({ value: option, text: option }));
  return (
    <FormikSelect
      name="timeField"
      formRow
      fieldProps={{ validate: validateTimeField(dateFields) }}
      rowProps={{
        label: 'Time field',
        style: { paddingLeft: '10px' },
        helpText: 'Choose the time field you want to use for your x-axis',
        isInvalid,
        error: hasError,
      }}
      inputProps={{
        options,
      }}
    />
  );
};

export default MonitorTimeField;

MonitorTimeField.propTypes = {
  dataTypes: PropTypes.object.isRequired,
};
