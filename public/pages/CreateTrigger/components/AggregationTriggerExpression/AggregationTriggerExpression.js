/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React, { Component } from 'react';
import _ from 'lodash';
import { Field } from 'formik';
import {
  EuiExpression,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPopover,
  EuiSelect,
} from '@elastic/eui';

const DEFAULT_CLOSED_STATES = { THRESHOLD: false };
export const Expressions = { THRESHOLD: 'THRESHOLD' };
const POPOVER_STYLE = { zIndex: '200' };

const THRESHOLD_ENUM_OPTIONS = [
  { value: 'ABOVE', text: 'IS ABOVE' },
  { value: 'BELOW', text: 'IS BELOW' },
  { value: 'EXACTLY', text: 'IS EXACTLY' },
];

const AND_OR_CONDITION_OPTIONS = [
  { value: 'AND', text: 'AND' },
  { value: 'OR', text: 'OR' },
];

class AggregationTriggerExpression extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openedStates: { ...DEFAULT_CLOSED_STATES },
    };

    this.openExpression = this.openExpression.bind(this);
    this.closeExpression = this.closeExpression.bind(this);
  }

  openExpression(expression) {
    this.setState({ openedStates: { ...DEFAULT_CLOSED_STATES, [expression]: true } });
  }

  closeExpression(expression) {
    const { openedStates } = this.state;
    this.setState({ openedStates: { ...openedStates, [expression]: false } });
  }

  renderPopover() {
    const {
      queryMetrics,
      index,
      andOrConditionFieldName,
      queryMetricFieldName,
      enumFieldName,
      valueFieldName,
    } = this.props;
    return (
      <div style={POPOVER_STYLE}>
        <EuiFlexGroup
          style={{
            maxWidth: 600,
            padding: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          {index > 0 ? (
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <Field name={andOrConditionFieldName}>
                {({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
                  <EuiFormRow
                    style={{ paddingLeft: '10px' }}
                    isInvalid={touched.andOrCondition && !!errors.andOrCondition}
                    error={errors.andOrCondition}
                  >
                    <EuiSelect options={AND_OR_CONDITION_OPTIONS} {...rest} />
                  </EuiFormRow>
                )}
              </Field>
            </EuiFlexItem>
          ) : null}

          <EuiFlexItem grow={false} style={{ width: 150 }}>
            <Field name={queryMetricFieldName}>
              {({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
                <EuiFormRow
                  style={{ paddingLeft: '10px' }}
                  isInvalid={touched.queryMetric && !!errors.queryMetric}
                  error={errors.queryMetric}
                >
                  <EuiSelect options={queryMetrics} {...rest} />
                </EuiFormRow>
              )}
            </Field>
          </EuiFlexItem>

          <EuiFlexItem grow={false} style={{ width: 150 }}>
            <Field name={enumFieldName}>
              {({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
                <EuiFormRow
                  style={{ paddingLeft: '10px' }}
                  isInvalid={touched.thresholdEnum && !!errors.thresholdEnum}
                  error={errors.thresholdEnum}
                >
                  <EuiSelect options={THRESHOLD_ENUM_OPTIONS} {...rest} />
                </EuiFormRow>
              )}
            </Field>
          </EuiFlexItem>

          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <Field name={valueFieldName}>
              {({ field, form: { touched, errors } }) => (
                <EuiFormRow
                  style={{ paddingLeft: '10px' }}
                  isInvalid={touched.thresholdValue && !!errors.thresholdValue}
                  error={errors.thresholdValue}
                >
                  <EuiFieldNumber {...field} />
                </EuiFormRow>
              )}
            </Field>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  render() {
    const { openedStates } = this.state;
    const {
      index,
      andOrCondition,
      queryMetric,
      queryMetrics,
      thresholdEnum,
      thresholdValue,
      label,
    } = this.props;

    return (
      <EuiFlexGroup alignItems={'center'}>
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="aggregation-trigger-popover"
            button={
              <EuiFormRow label={label}>
                <div>
                  {index > 0 ? (
                    <EuiExpression
                      description={`${
                        _.isEmpty(andOrCondition)
                          ? AND_OR_CONDITION_OPTIONS[0].text
                          : andOrCondition
                      }`}
                      value={''}
                      isActive={openedStates.THRESHOLD}
                      onClick={() => this.openExpression(Expressions.THRESHOLD)}
                    />
                  ) : null}
                  <EuiExpression
                    description={'WHEN '}
                    value={`${
                      _.isEmpty(queryMetric) ? _.get(queryMetrics[0], 'text', '-') : queryMetric
                    }`}
                    isActive={openedStates.THRESHOLD}
                    onClick={() => this.openExpression(Expressions.THRESHOLD)}
                  />
                  <EuiExpression
                    description={`IS ${thresholdEnum}`}
                    value={`${thresholdValue.toLocaleString()}`}
                    isActive={openedStates.THRESHOLD}
                    onClick={() => this.openExpression(Expressions.THRESHOLD)}
                  />
                </div>
              </EuiFormRow>
            }
            isOpen={openedStates.THRESHOLD}
            closePopover={() => this.closeExpression(Expressions.THRESHOLD)}
            panelPaddingSize="none"
            ownFocus
            withTitle
            anchorPosition="downLeft"
          >
            {this.renderPopover()}
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default AggregationTriggerExpression;
