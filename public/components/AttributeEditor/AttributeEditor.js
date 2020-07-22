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
};
const defaultProps = {
  titleText: '',
  emptyText: 'No attributes found.',
  addButtonText: 'Add',
  removeButtonText: 'Remove',
  isEnabled: true,
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
}) => {
  /* Comments for the CSS style:
  key/valueField: 'width: 182' - make the max width of the text field to be half of the default width*/
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
              <EuiFlexItem style={{ width: 182 }}>
                {onRenderKeyField(`${name}.${index}.key`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem style={{ width: 182 }}>
                {onRenderValueField(`${name}.${index}.value`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiShowFor sizes={['xs', 's', 'm']}>
                  <EuiIcon
                    type="minusInCircleFilled"
                    size="l"
                    onClick={(e) => onRemove(index)}
                    disabled={!isEnabled}
                  >
                    {removeButtonText}
                  </EuiIcon>
                </EuiShowFor>
                <EuiShowFor sizes={['l', 'xl']}>
                  <EuiButton
                    style={{ marginTop: 10 }}
                    size="s"
                    onClick={(e) => onRemove(index)}
                    disabled={!isEnabled}
                  >
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
