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
import { FieldArray } from 'formik';
import AttributeEditor from '../../../../../components/AttributeEditor';
import SubHeader from '../../../../../components/SubHeader';
import { FormikFieldText } from '../../../../../components/FormControls';
import { hasError, isInvalid, required } from '../../../../../utils/validate';

const handleRenderKeyField = (fieldName, index) => (
  <FormikFieldText
    formRow={index === 0}
    fieldProps={{
      validate: required,
    }}
    rowProps={{
      label: index === 0 ? 'Key' : null,
      isInvalid,
      error: hasError,
    }}
    inputProps={{
      isInvalid,
      disabled: false,
    }}
    name={fieldName}
  />
);

const handleRenderValueField = (fieldName, index) => (
  <FormikFieldText
    formRow={index === 0}
    fieldProps={{
      validate: required,
    }}
    rowProps={{
      label: index === 0 ? 'Value' : null,
    }}
    inputProps={{
      isInvalid,
    }}
    name={fieldName}
  />
);

const propTypes = {
  type: PropTypes.string.isRequired,
  headerParams: PropTypes.array.isRequired,
};
const HeaderParamsEditor = ({ type, headerParams }) => (
  <Fragment>
    <SubHeader title={<h6>Header information</h6>} description={''} />
    <FieldArray
      name={`${type}.headerParams`}
      validateOnChange={true}
      render={arrayHelpers => (
        <AttributeEditor
          onAdd={() => arrayHelpers.push({ key: '', value: '' })}
          onRemove={index => index !== 0 && arrayHelpers.remove(index)}
          items={headerParams}
          name={`${type}.headerParams`}
          addButtonText="Add header"
          removeButtonText="Remove header"
          onRenderKeyField={handleRenderKeyField}
          onRenderValueField={handleRenderValueField}
        />
      )}
    />
  </Fragment>
);

HeaderParamsEditor.propTypes = propTypes;

export default HeaderParamsEditor;
