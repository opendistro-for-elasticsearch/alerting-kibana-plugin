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
import _ from 'lodash';
import PropTypes from 'prop-types';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';

const propTypes = {
  titleText: PropTypes.string,
  name: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onRenderKeyField: PropTypes.func.isRequired,
  onRenderValueField: PropTypes.func.isRequired,
  addButtonText: PropTypes.string,
  removeButtonText: PropTypes.string,
  isEnabled: PropTypes.bool,
  isOptional: PropTypes.bool.isRequired,
};
const defaultProps = {
  titleText: '',
  addButtonText: 'Add',
  removeButtonText: 'Remove',
  isEnabled: true,
};

const AttributeEditor = ({
  titleText,
  name,
  items,
  onAdd,
  onRemove,
  onRenderKeyField,
  onRenderValueField,
  addButtonText,
  removeButtonText,
  isEnabled,
  isOptional,
}) => {
  /* Comments for the CSS style:
  key/valueField: 'maxWidth: 188' - make the max width of the text field to be half of the default width
  removeButton: 'marginTop: 30 or 10' - Adjust the button position to align with the text field, and the first button needs more remedy*/
  // The Remove button in the first row should be disabled for a better UX.
  return (
    <EuiFlexGroup direction="column" alignItems="flexStart" style={{ paddingLeft: '10px' }}>
      {!_.isEmpty(titleText) ? (
        <EuiFlexItem style={{ marginBottom: 0 }}>
          <EuiText size="xs">{titleText}</EuiText>
        </EuiFlexItem>
      ) : null}
      {!_.isEmpty(items)
        ? items.map((item, index) => (
            <EuiFlexItem style={{ marginBottom: 0 }} key={`${name}.${index}.key`}>
              <EuiFlexGroup alignItems="center">
                <EuiFlexItem style={{ maxWidth: 188 }}>
                  {onRenderKeyField(`${name}.${index}.key`, index, isEnabled, isOptional)}
                </EuiFlexItem>
                <EuiFlexItem style={{ maxWidth: 188 }}>
                  {onRenderValueField(`${name}.${index}.value`, index, isEnabled, isOptional)}
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ marginTop: index === 0 ? 30 : 10 }}>
                  <EuiButton
                    size="s"
                    onClick={(e) => onRemove(index)}
                    disabled={!isEnabled || index === 0}
                  >
                    {removeButtonText}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          ))
        : onAdd()}
      <EuiFlexItem>
        <EuiButton size="s" onClick={onAdd} disabled={!isEnabled}>
          {addButtonText}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

AttributeEditor.propTypes = propTypes;
AttributeEditor.defaultProps = defaultProps;

export default AttributeEditor;
