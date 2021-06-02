/*
 *   Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
  EuiText,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';

import { EXPRESSION_STYLE, POPOVER_STYLE } from './utils/constants';
import { FormikSelect } from '../../../../../components/FormControls';

export default function GroupByPopover(
  { values, onMadeChanges, arrayHelpers, options, closePopover, expressionWidth, index } = this
    .props
) {
  const onChangeWrapper = (e, field) => {
    onMadeChanges();
    field.onChange(e);
  };

  return (
    <div
      style={{
        width: Math.max(expressionWidth, 180),
        height: 220,
        ...POPOVER_STYLE,
        ...EXPRESSION_STYLE,
      }}
    >
      <EuiFlexGroup direction="column" gutterSize="xs">
        <EuiFlexItem>
          <EuiText size="xs">
            <h4>Field</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikSelect
            name="groupByField"
            inputProps={{
              onChange: onChangeWrapper,
              options,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
        <EuiFlexItem>
          <EuiButtonEmpty onClick={closePopover}>Cancel</EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton
            fill
            onClick={() => {
              arrayHelpers.replace(index, values.groupByField);
              closePopover();
            }}
          >
            Save
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
