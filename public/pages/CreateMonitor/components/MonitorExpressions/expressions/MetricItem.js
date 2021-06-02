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

import React, { useState } from 'react';

import {
  EuiText,
  EuiPopover,
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import _ from 'lodash';
import { FORMIK_INITIAL_AGG_VALUES } from '../../../containers/CreateMonitor/utils/constants';
import { AGGREGATION_TYPES, EXPRESSION_STYLE, POPOVER_STYLE } from './utils/constants';
import { FormikComboBox, FormikSelect } from '../../../../../components/FormControls';

export default function MetricItem(
  { values, arrayHelpers, fieldOptions, expressionWidth, aggregation, index } = this.props
) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const closePopover = () => setIsPopoverOpen(false);

  const onChangeWrapper = (e, field, form) => {
    const {
      formik: { values },
      arrayHelpers,
      index,
    } = this.props;
    this.props.onMadeChanges();
    if (values.aggregations.length <= index)
      arrayHelpers.push(_.cloneDeep(FORMIK_INITIAL_AGG_VALUES));
    field.onChange(e);
  };

  const onChangeFieldWrapper = (options, field, form, index) => {
    this.props.onMadeChanges();
    form.setFieldValue(`aggregations[${index}].fieldName`, options);
  };

  const renderPopover = (options, closeExpression, expressionWidth, index) => (
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
            <h4>Aggregation</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikSelect
            name={`aggregations[${index}].aggregationType`}
            inputProps={{
              onChange: onChangeWrapper,
              options: AGGREGATION_TYPES,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup direction="column" gutterSize="xs">
        <EuiFlexItem>
          <EuiText size="xs">
            <h4>Field</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikComboBox
            name={`aggregations[${index}].fieldName`}
            inputProps={{
              placeholder: 'Select a field',
              options,
              onChange: onChangeFieldWrapper,
              isClearable: false,
              singleSelection: { asPlainText: true },
              'data-test-subj': 'ofFieldComboBox',
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
          <EuiButton fill onClick={closePopover}>
            Save
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
  return (
    <EuiPopover
      id="metric-badge-popover"
      button={
        <div>
          <EuiBadge
            iconSide="right"
            iconType={index ? 'cross' : ''}
            iconOnClick={() => arrayHelpers.remove(index)}
            iconOnClickAriaLabel="Remove metric"
            onClick={() => {
              setIsPopoverOpen(true);
            }}
            onClickAriaLabel="Edit metric"
          >
            {aggregation.aggregationType} of {aggregation.fieldName}
          </EuiBadge>{' '}
        </div>
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      ownFocus
      withTitle
      anchorPosition="downLeft"
    >
      {renderPopover(fieldOptions, closePopover, expressionWidth, index)}
    </EuiPopover>
  );
}
