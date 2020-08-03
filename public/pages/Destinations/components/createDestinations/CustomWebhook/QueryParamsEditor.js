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
import { FormikFieldText } from '../../../../../components/FormControls';
import { isInvalid, required } from '../../../../../utils/validate';
import SubHeader from '../../../../../components/SubHeader';

const handleRenderKeyField = (fieldName, index, isEnabled) => (
  <FormikFieldText
    formRow={index === 0}
    fieldProps={{
      validate: isEnabled ? required : null,
    }}
    rowProps={{
      label: index === 0 ? 'Key' : null,
    }}
    inputProps={{
      isInvalid,
      disabled: !isEnabled,
    }}
    name={fieldName}
  />
);

const handleRenderValueField = (fieldName, index, isEnabled) => (
  <FormikFieldText
    formRow={index === 0}
    fieldProps={{
      validate: isEnabled ? required : null,
    }}
    rowProps={{
      label: index === 0 ? 'Value' : null,
    }}
    inputProps={{
      isInvalid,
      disabled: !isEnabled,
    }}
    name={fieldName}
  />
);

const propTypes = {
  type: PropTypes.string.isRequired,
  queryParams: PropTypes.array.isRequired,
  isEnabled: PropTypes.bool,
  useGlyphAsRemoveButton: PropTypes.array,
};

const QueryParamsEditor = ({ type, queryParams, isEnabled = true, useGlyphAsRemoveButton }) => (
  <Fragment>
    <SubHeader title={<h6>Query parameters</h6>} description={''} />
    <FieldArray
      name={`${type}.queryParams`}
      validateOnChange={true}
      render={(arrayHelpers) => (
        <AttributeEditor
          onAdd={() => arrayHelpers.push({ key: '', value: '' })}
          onRemove={(index) => arrayHelpers.remove(index)}
          items={queryParams}
          name={`${type}.queryParams`}
          addButtonText="Add parameter"
          removeButtonText="Remove parameter"
          onRenderKeyField={handleRenderKeyField}
          onRenderValueField={handleRenderValueField}
          isEnabled={isEnabled}
          useGlyphAsRemoveButton={useGlyphAsRemoveButton}
        />
      )}
    />
  </Fragment>
);

QueryParamsEditor.propTypes = propTypes;

export default QueryParamsEditor;
