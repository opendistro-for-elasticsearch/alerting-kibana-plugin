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
import { FieldArray } from 'formik';
import FormikFieldText from '../../../../components/FormControls/FormikFieldText';
import AttributeEditor from '../../../../components/AttributeEditor';

const handleRenderKeyField = (fieldName, index) => (
  <FormikFieldText
    formRow={index === 0}
    rowProps={{
      label: index === 0 ? 'Key' : null,
    }}
    name={fieldName}
  />
);

const handleRenderValueField = (fieldName, index) => (
  <FormikFieldText
    formRow={index === 0}
    rowProps={{
      label: index === 0 ? 'Value' : null,
    }}
    name={fieldName}
  />
);

const propTypes = {
  queryParams: PropTypes.array.isRequired,
};

const QueryParamsEditor = ({ queryParams }) => (
  <FieldArray
    name={`http.queryParams`}
    render={arrayHelpers => (
      <AttributeEditor
        titleText="Query parameters"
        onAdd={() => arrayHelpers.push({})}
        onRemove={index => arrayHelpers.remove(index)}
        items={queryParams}
        name={`http.queryParams`}
        addButtonText="Add parameter"
        removeButtonText="Remove parameter"
        onRenderKeyField={handleRenderKeyField}
        onRenderValueField={handleRenderValueField}
      />
    )}
  />
);

QueryParamsEditor.propTypes = propTypes;

export default QueryParamsEditor;
