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
import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHideFor,
  EuiShowFor,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';

const propTypes = {
  titleText: PropTypes.string,
  emptyText: PropTypes.string,
  name: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onRenderKeyField: PropTypes.func.isRequired,
  onRenderValueField: PropTypes.func.isRequired,
  addButtonText: PropTypes.string,
  removeButtonText: PropTypes.string,
  isEnabled: PropTypes.bool,
  useGlyphAsRemoveButton: PropTypes.array,
  buttonInFirstRowIsEnabled: PropTypes.bool,
};
const defaultProps = {
  titleText: '',
  emptyText: 'No attributes found.',
  addButtonText: 'Add',
  removeButtonText: 'Remove',
  isEnabled: true,
  useGlyphAsRemoveButton: [],
  buttonInFirstRowIsEnabled: true,
};

const AttributeEditor = ({
  titleText,
  emptyText,
  name,
  items,
  onAdd,
  onRemove,
  onRenderKeyField,
  onRenderValueField,
  addButtonText,
  removeButtonText,
  isEnabled,
  useGlyphAsRemoveButton,
  buttonInFirstRowIsEnabled,
}) => {
  /* Comments for the CSS style:
  key/valueField: 'maxWidth: 188' - make the max width of the text field to be half of the default width
  removeButton: 'marginTop: 30 or 10' - Adjust the button position to align with the text field, and the first button needs more remedy*/
  /* useGlyphAsRemoveButton: 'sizes' property of 'EuiShowFor' component,
  used to show Glyph instead of the Remove button in narrow window for simplicity.*/
  // buttonInFirstRowIsEnabled: If the attribute is optional, the Remove button in the first row should be disabled for a better UX.
  return (
    <EuiFlexGroup direction="column" alignItems="flexStart">
      {!_.isEmpty(titleText) ? (
        <EuiFlexItem style={{ marginBottom: 0 }}>
          <EuiText size="xs">{titleText}</EuiText>
        </EuiFlexItem>
      ) : null}
      {!_.isEmpty(items) ? (
        items.map((item, index) => (
          <EuiFlexItem style={{ marginBottom: 0 }} key={`${name}.${index}.key`}>
            <EuiFlexGroup alignItems="center" responsive={false}>
              <EuiFlexItem style={{ maxWidth: 188 }}>
                {onRenderKeyField(`${name}.${index}.key`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem style={{ maxWidth: 188 }}>
                {onRenderValueField(`${name}.${index}.value`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: index === 0 ? 30 : 10 }}>
                <EuiShowFor sizes={useGlyphAsRemoveButton}>
                  <EuiButtonIcon
                    iconType="minusInCircleFilled"
                    iconSize="l"
                    style={{ display: useGlyphAsRemoveButton.length === 0 ? 'none' : 'inline' }}
                    onClick={(e) => onRemove(index)}
                    disabled={!isEnabled || (!buttonInFirstRowIsEnabled ? index === 0 : false)}
                  />
                </EuiShowFor>
                <EuiHideFor sizes={useGlyphAsRemoveButton}>
                  <EuiButton
                    size="s"
                    onClick={(e) => onRemove(index)}
                    disabled={!isEnabled || (!buttonInFirstRowIsEnabled ? index === 0 : false)}
                  >
                    {removeButtonText}
                  </EuiButton>
                </EuiHideFor>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        ))
      ) : (
        <EuiFlexItem style={{ marginBottom: 0 }}>
          <EuiText size="xs"> {emptyText} </EuiText>
        </EuiFlexItem>
      )}
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
