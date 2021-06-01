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
import { connect } from 'formik';

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
import { Expressions, POPOVER_STYLE, AGGREGATION_TYPES, EXPRESSION_STYLE } from './utils/constants';
import { FormikComboBox, FormikSelect } from '../../../../../components/FormControls';
import { getIndexFields } from './utils/dataTypes';
import { getOfExpressionAllowedTypes } from './utils/helpers';
import _ from 'lodash';
import { FORMIK_INITIAL_AGG_VALUES } from '../../../containers/CreateMonitor/utils/constants';

class MetricExpression extends Component {
  onChangeWrapper = (e, field, form, arrayHelpers) => {
    //Debug
    console.log('field in changeWrapper: ' + JSON.stringify(field));
    this.props.onMadeChanges();
    form.setFieldValue(`aggregations[${index}].aggregationType`, options);
    field.onChange(e);
  };

  onChangeFieldWrapper = (options, field, form, index) => {
    const {
      formik: { values },
    } = this.props;
    this.props.onMadeChanges();
    //TODO Change this to only change value for the corresponding index
    form.setFieldValue(`aggregations[${index}].fieldName`, options);
    console.log(JSON.stringify(values));
    //Debug use
  };

  renderPopover = (fieldOptions, closeExpression, expressionWidth, arrayHelpers, index) => {
    //Debug use
    const {
      formik: { values },
    } = this.props;
    console.log('Index: ' + index);
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
              <h4>Aggregation</h4>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <FormikSelect
              name="aggregationType"
              inputProps={{
                onChange: (e) =>
                  this.onChangeWrapper(e, `aggregations[${index}].aggregationType`, arrayHelpers),
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
                options: fieldOptions,
                onChange: this.onChangeFieldWrapper,
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
            <EuiButtonEmpty onClick={() => closeExpression(Expressions.METRICS)}>
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiButton
              fill
              onClick={() => {
                arrayHelpers.replace({
                  aggregationType: 'count',
                  fieldName: '',
                });
                closeExpression(Expressions.METRICS);
                //Debug use
                console.log(
                  'After clicking save button the values look like: ' + JSON.stringify(values)
                );
                // console.log("After clicking save button the aggs look like: "+JSON.stringify(values.aggregations));
              }}
            >
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  };

  renderFieldItems = (arrayHelpers, fieldOptions, closeExpression, expressionWidth) => {
    const {
      formik: { values },
    } = this.props;
    //TODO: Add isOpen property here for individual agg
    return values.aggregations.map((aggregation, index) => (
      <EuiBadge
        iconSide="right"
        iconType="cross"
        iconOnClick={arrayHelpers.remove(index)}
        // onClick={this.renderPopover(fieldOptions, closeExpression, expressionWidth, arrayHelpers, index)}
      >
        {aggregation.fieldName}
      </EuiBadge>
    ));
  };

  render() {
    const {
      formik: { values },
      arrayHelpers,
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
        {this.renderFieldItems(arrayHelpers, fieldOptions, closeExpression, expressionWidth)}
        <EuiPopover
          id="metric-popover"
          button={
            <div>
              <EuiButtonEmpty
                size="xs"
                onClick={() => {
                  // openedStates.METRICS.push(false);
                  openExpression(Expressions.METRICS);
                  arrayHelpers.push(_.cloneDeep(FORMIK_INITIAL_AGG_VALUES));
                  //Debug
                  console.log('Aggs: ' + JSON.stringify(values.aggregations));
                }}
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
          {this.renderPopover(
            fieldOptions,
            closeExpression,
            expressionWidth,
            arrayHelpers,
            values.aggregations.length
          )}
        </EuiPopover>
      </div>
    );
  }
}

export default connect(MetricExpression);
