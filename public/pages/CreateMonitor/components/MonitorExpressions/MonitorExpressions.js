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
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText, EuiButtonEmpty } from '@elastic/eui';

import {
  ForExpression,
  OfExpression,
  OverExpression,
  WhenExpression,
  WhereExpression,
} from './expressions';
import MetricExpression from './expressions/MetricExpression';
import { FieldArray } from 'formik';

export const DEFAULT_CLOSED_STATES = {
  METRICS: false,
  WHEN: false,
  OF_FIELD: false,
  THRESHOLD: false,
  OVER: false,
  FOR_THE_LAST: false,
  WHERE: false,
};

export default class MonitorExpressions extends Component {
  state = {
    openedStates: DEFAULT_CLOSED_STATES,
    madeChanges: false,
  };

  openExpression = (expression) => {
    this.setState({
      openedStates: {
        ...DEFAULT_CLOSED_STATES,
        [expression]: true,
      },
    });
  };

  closeExpression = (expression) => {
    const { madeChanges, openedStates } = this.state;
    if (madeChanges && openedStates[expression]) {
      // if made changes and close expression that was currently open => run query
      this.props.onRunQuery();
      this.setState({ madeChanges: false });
    }
    this.setState({ openedStates: { ...openedStates, [expression]: false } });
  };

  onMadeChanges = () => {
    this.setState({ madeChanges: true });
  };

  getExpressionProps = () => ({
    openedStates: this.state.openedStates,
    closeExpression: this.closeExpression,
    openExpression: this.openExpression,
    onMadeChanges: this.onMadeChanges,
  });

  render() {
    const { dataTypes, ofEnabled } = this.props;
    return (
      <div>
        <FieldArray name={'aggregations'} validateOnChange={false}>
          {(arrayHelpers) => (
            <MetricExpression
              {...this.getExpressionProps()}
              arrayHelpers={arrayHelpers}
              dataTypes={dataTypes}
            />
          )}
        </FieldArray>
        <EuiSpacer size="xs" />
        <ForExpression {...this.getExpressionProps()} />
        <EuiSpacer size="xs" />
        <WhereExpression {...this.getExpressionProps()} dataTypes={dataTypes} />
        <EuiSpacer size="xs" />

        <EuiText size="xs">
          {' '}
          <h4>Group by</h4>{' '}
        </EuiText>

        <EuiButtonEmpty
          size="xs"
          data-test-subj="addGroupByButton"
          // onClick={arrayHelpers.push(_.cloneDeep({}))}
        >
          + Add another group by
        </EuiButtonEmpty>

        <EuiSpacer size="s" />

        {/*TODO: Remove the following EuiFlexGroup since they are the old version of monitor expression*/}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <WhenExpression {...this.getExpressionProps()} />
          </EuiFlexItem>

          {ofEnabled && (
            <EuiFlexItem grow={false}>
              <OfExpression {...this.getExpressionProps()} dataTypes={dataTypes} />
            </EuiFlexItem>
          )}

          <EuiFlexItem grow={false}>
            <OverExpression {...this.getExpressionProps()} />
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <ForExpression {...this.getExpressionProps()} />
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <WhereExpression {...this.getExpressionProps()} dataTypes={dataTypes} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
