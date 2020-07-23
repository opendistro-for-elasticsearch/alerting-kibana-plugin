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
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
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
  isResponsive: PropTypes.bool,
};
const defaultProps = {
  titleText: '',
  emptyText: 'No attributes found.',
  addButtonText: 'Add',
  removeButtonText: 'Remove',
  isEnabled: true,
  isResponsive: false,
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
  isResponsive,
}) => {
  /* Comments for the CSS style:
  key/valueField: 'maxWidth: 188' - make the max width of the text field to be half of the default width
  removeButton: 'marginTop: 30 or 10' - Adjust the button position to align with the text field, and the first button needs more remedy*/
  return (
    <EuiFlexGroup
      direction="column"
      alignItems="flexStart"
      style={{ visibility: isEnabled ? 'visible' : 'hidden' }}
    >
      {!_.isEmpty(titleText) ? (
        <EuiFlexItem style={{ marginBottom: 0 }}>
          <EuiSpacer size="m" />
          <EuiText size="xs">{titleText}</EuiText>
        </EuiFlexItem>
      ) : null}
      {!_.isEmpty(items) ? (
        items.map((item, index) => (
          <EuiFlexItem style={{ marginBottom: 0 }} key={`${name}.${index}.key`}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem style={{ maxWidth: 188 }}>
                {onRenderKeyField(`${name}.${index}.key`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem style={{ maxWidth: 188 }}>
                {onRenderValueField(`${name}.${index}.value`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: index === 0 ? 30 : 10 }}>
                <EuiShowFor sizes={['m']}>
                  <EuiIcon
                    type="minusInCircleFilled"
                    size="l"
                    style={{ visibility: isResponsive ? 'inline' : 'hidden' }}
                    onClick={(e) => onRemove(index)}
                    disabled={!isEnabled}
                  >
                    {removeButtonText}
                  </EuiIcon>
                </EuiShowFor>
                <EuiShowFor
                  sizes={isResponsive ? ['xs', 's', 'l', 'xl'] : ['xs', 's', 'm', 'l', 'xl']}
                >
                  <EuiButton size="s" onClick={(e) => onRemove(index)} disabled={!isEnabled}>
                    {removeButtonText}
                  </EuiButton>
                </EuiShowFor>
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
