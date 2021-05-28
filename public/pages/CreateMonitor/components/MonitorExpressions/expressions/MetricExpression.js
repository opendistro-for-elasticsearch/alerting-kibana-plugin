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

import React, { Component } from 'react';
import { connect, FieldArray } from 'formik';

import {
  EuiText,
  EuiPopover,
  EuiBadge,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import {
  Expressions,
  POPOVER_STYLE,
  AGGREGATION_TYPES,
  EXPRESSION_STYLE,
  OVER_TYPES,
} from './utils/constants';
import { FormikComboBox, FormikSelect } from '../../../../../components/FormControls';
import { getIndexFields } from './utils/dataTypes';
import { getOfExpressionAllowedTypes } from './utils/helpers';
import _ from 'lodash';

class MetricExpression extends Component {
  onChangeWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  onChangeFieldWrapper = (options, field, form) => {
    const {
      formik: { values },
    } = this.props;
    this.props.onMadeChanges();
    form.setFieldValue('fieldName', options);
    console.log(JSON.stringify(values));
    //Debug use
  };

  renderPopover = (fieldOptions, expressionWidth) => (
    <div style={{ width: Math.max(expressionWidth, 180), ...POPOVER_STYLE, ...EXPRESSION_STYLE }}>
      <EuiFlexGroup direction="column" gutterSize="xs">
        <EuiFlexItem>
          <EuiText size="xs">
            <h4>Aggregation</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikSelect
            name="aggregationType"
            inputProps={{
              onChange: this.onChangeWrapper,
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
          {/*<FormikSelect*/}
          {/*  name="aggregationField"*/}
          {/*  inputProps={{*/}
          {/*    onChange: this.onChangeWrapper,*/}
          {/*    options: OVER_TYPES,*/}
          {/*  }}*/}
          {/*/>*/}
          <FormikComboBox
            name="fieldName"
            inputProps={{
              placeholder: 'Select a field',
              options: fieldOptions,
              onChange: this.onChangeFieldWrapper,
              isClearable: false,
              singleSelection: { asPlainText: true },
              'data-test-subj': 'ofFieldComboBox',
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );

  renderFieldItems = (arrayHelpers, fieldOptions, expressionWidth) => {
    const {
      formik: { values },
    } = this.props;
    return values.fieldName.map((fieldItem, index) => (
      <EuiBadge
        iconSide="right"
        iconType="cross"
        onClick={this.renderPopover(fieldOptions, expressionWidth)}
      >
        {fieldItem.label}
      </EuiBadge>
    ));
  };

  render() {
    const {
      formik: { values },
      openedStates,
      closeExpression,
      openExpression,
      dataTypes,
    } = this.props;

    const fieldOptions = getIndexFields(dataTypes, getOfExpressionAllowedTypes(values));
    const expressionWidth =
      Math.max(
        ...fieldOptions.map(({ options }) =>
          options.reduce((accu, curr) => Math.max(accu, curr.label.length), 0)
        )
      ) *
        8 +
      60;
    return (
      <div>
        <EuiText size="xs">
          <h4>Metrics</h4>
        </EuiText>
        {/*TODO:Add badges here*/}
        {/*values.*/}
        <FieldArray name={'fieldName'} validateOnChange={false}>
          {(arrayHelpers) => this.renderFieldItems(arrayHelpers, fieldOptions, expressionWidth)}
        </FieldArray>
        <EuiPopover
          id="metric-popover"
          button={
            <div>
              <EuiButtonEmpty
                size="xs"
                onClick={() => openExpression(Expressions.METRICS)}
                data-test-subj="addMetricButton"
              >
                + Add metric
              </EuiButtonEmpty>
            </div>
          }
          isOpen={openedStates.METRICS}
          closePopover={() => closeExpression(Expressions.METRICS)}
          panelPaddingSize="none"
          ownFocus
          withTitle
          anchorPosition="downLeft"
        >
          {this.renderPopover(fieldOptions, expressionWidth)}
        </EuiPopover>
      </div>
    );
  }
}

export default connect(MetricExpression);
