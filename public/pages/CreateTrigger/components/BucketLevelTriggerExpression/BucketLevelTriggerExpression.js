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
import { Field } from 'formik';
import {
  EuiButton,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
} from '@elastic/eui';

const DEFAULT_CLOSED_STATES = { THRESHOLD: false };
export const Expressions = { THRESHOLD: 'THRESHOLD' };

const THRESHOLD_ENUM_OPTIONS = [
  { value: 'ABOVE', text: 'IS ABOVE' },
  { value: 'BELOW', text: 'IS BELOW' },
  { value: 'EXACTLY', text: 'IS EXACTLY' },
];

const AND_OR_CONDITION_OPTIONS = [
  { value: 'AND', text: 'AND' },
  { value: 'OR', text: 'OR' },
];

class BucketLevelTriggerExpression extends Component {
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

  render() {
    const {
      arrayHelpers,
      queryMetrics,
      index,
      andOrConditionFieldName,
      queryMetricFieldName,
      enumFieldName,
      valueFieldName,
    } = this.props;
    const isFirstCondition = index === 0;
    return (
      <EuiFlexGroup
        style={{
          maxWidth: 1000,
          paddingLeft: '10px',
          paddingTop: '10px',
          whiteSpace: 'nowrap',
        }}
        gutterSize={'m'}
        alignItems={'flexStart'}
      >
        {!isFirstCondition ? (
          <EuiFlexItem grow={false} style={{ width: 90 }}>
            <Field name={andOrConditionFieldName}>
              {({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
                <EuiFormRow
                  isInvalid={touched.andOrCondition && !!errors.andOrCondition}
                  error={errors.andOrCondition}
                >
                  <EuiSelect options={AND_OR_CONDITION_OPTIONS} {...rest} />
                </EuiFormRow>
              )}
            </Field>
          </EuiFlexItem>
        ) : null}

        <EuiFlexItem grow={true} style={{ minWidth: 300, maxWidth: 495 }}>
          <Field name={queryMetricFieldName} fullWidth={true}>
            {({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
              <EuiFormRow
                fullWidth={true}
                label={isFirstCondition ? 'Metric' : null}
                isInvalid={touched.queryMetric && !!errors.queryMetric}
                error={errors.queryMetric}
              >
                <EuiSelect fullWidth={true} options={queryMetrics} {...rest} />
              </EuiFormRow>
            )}
          </Field>
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ maxWidth: 200 }}>
          <Field name={enumFieldName}>
            {({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
              <EuiFormRow
                label={isFirstCondition ? 'Threshold' : null}
                isInvalid={touched.thresholdEnum && !!errors.thresholdEnum}
                error={errors.thresholdEnum}
              >
                <EuiSelect options={THRESHOLD_ENUM_OPTIONS} {...rest} />
              </EuiFormRow>
            )}
          </Field>
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ maxWidth: 200 }}>
          <Field name={valueFieldName}>
            {({ field, form: { touched, errors } }) => (
              <EuiFormRow
                label={isFirstCondition ? 'Value' : null}
                isInvalid={touched.thresholdValue && !!errors.thresholdValue}
                error={errors.thresholdValue}
              >
                <EuiFieldNumber {...field} />
              </EuiFormRow>
            )}
          </Field>
        </EuiFlexItem>

        {!isFirstCondition ? (
          <EuiFlexItem grow={false}>
            <EuiButton
              color={'danger'}
              onClick={() => {
                arrayHelpers.remove(index);
              }}
            >
              Remove condition
            </EuiButton>
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    );
  }
}

export default BucketLevelTriggerExpression;
