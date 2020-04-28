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

import React, { Component } from 'react';
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

class TriggerExpressions extends Component {
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
    const { keyFieldName, valueFieldName } = this.props;
    return (
      <div style={POPOVER_STYLE}>
        <EuiFlexGroup
          style={{
            maxWidth: 600,
            padding: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          <EuiFlexItem grow={false} style={{ width: 150 }}>
            <Field
              name={keyFieldName}
              render={({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
                <EuiFormRow
                  isInvalid={touched.thresholdEnum && !!errors.thresholdEnum}
                  error={errors.thresholdEnum}
                >
                  <EuiSelect options={THRESHOLD_ENUM_OPTIONS} {...rest} />
                </EuiFormRow>
              )}
            />
          </EuiFlexItem>

          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <Field
              name={valueFieldName}
              render={({ field, form: { touched, errors } }) => (
                <EuiFormRow
                  style={{ paddingLeft: '10px' }}
                  isInvalid={touched.thresholdValue && !!errors.thresholdValue}
                  error={errors.thresholdValue}
                >
                  <EuiFieldNumber {...field} />
                </EuiFormRow>
              )}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  render() {
    const { openedStates } = this.state;
    const { thresholdEnum, thresholdValue, label } = this.props;
    return (
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="trigger-popover"
            button={
              <EuiFormRow label={label}>
                <EuiExpression
                  description={`IS ${thresholdEnum}`}
                  value={`${thresholdValue.toLocaleString()}`}
                  isActive={openedStates.THRESHOLD}
                  onClick={() => this.openExpression(Expressions.THRESHOLD)}
                />
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

export default TriggerExpressions;
