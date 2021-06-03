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

import { EuiText, EuiButtonEmpty, EuiSpacer } from '@elastic/eui';
import { getIndexFields } from './utils/dataTypes';
import { getGroupByExpressionAllowedTypes } from './utils/helpers';
import GroupByItem from './GroupByItem';
import { GROUP_BY_ERROR } from './utils/constants';

class GroupByExpression extends Component {
  state = {
    addButtonTouched: false,
  };
  renderFieldItems = (arrayHelpers, fieldOptions, expressionWidth) => {
    const {
      formik: { values },
      onMadeChanges,
    } = this.props;
    return values.groupBy.map((groupByItem, index) => {
      return (
        <GroupByItem
          values={values}
          onMadeChanges={onMadeChanges}
          arrayHelpers={arrayHelpers}
          fieldOptions={fieldOptions}
          expressionWidth={expressionWidth}
          groupByItem={groupByItem}
          index={index}
        />
      );
    });
  };

  render() {
    const {
      formik: { values },
      errors,
      touched,
      arrayHelpers,
      dataTypes,
    } = this.props;

    const fieldOptions = getIndexFields(dataTypes, getGroupByExpressionAllowedTypes(values));
    const expressionWidth =
      Math.max(
        ...fieldOptions.map(({ options }) =>
          options.reduce((accu, curr) => Math.max(accu, curr.label.length), 0)
        )
      ) *
        8 +
      60;
    if (
      (this.state.addButtonTouched || touched.groupBy) &&
      !values.groupBy.length &&
      values.monitor_type === 'aggregation_monitor'
    )
      errors.groupBy = GROUP_BY_ERROR;
    return (
      <div>
        <EuiText size="xs">
          <h4>Group by</h4>
        </EuiText>
        {this.renderFieldItems(arrayHelpers, fieldOptions, expressionWidth)}
        <EuiSpacer size="xs" />
        <EuiButtonEmpty
          size="xs"
          onClick={() => {
            this.setState({ addButtonTouched: true });
            arrayHelpers.push('');
          }}
          data-test-subj="addGroupByButton"
        >
          + Add another group by
        </EuiButtonEmpty>
        <EuiText color="danger" size="xs">
          {errors.groupBy}
        </EuiText>
      </div>
    );
  }
}

export default connect(GroupByExpression);
