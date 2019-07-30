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
import { EuiFlexGroup, EuiFlexItem, EuiButton, EuiText } from '@elastic/eui';

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
  return (
    <EuiFlexGroup direction="column" alignItems="flexStart" style={{ paddingLeft: '10px' }}>
      {!_.isEmpty(titleText) ? (
        <EuiFlexItem>
          <EuiText size="xs">{titleText}</EuiText>
        </EuiFlexItem>
      ) : null}
      {!_.isEmpty(items) ? (
        items.map((item, index) => (
          <EuiFlexItem style={{ marginBottom: 0 }} key={`${name}.${index}.key`}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
                {onRenderKeyField(`${name}.${index}.key`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem>
                {onRenderValueField(`${name}.${index}.value`, index, isEnabled)}
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  style={{ marginTop: 10 }}
                  size="s"
                  onClick={e => onRemove(index)}
                  disabled={!isEnabled}
                >
                  {removeButtonText}
                </EuiButton>
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
