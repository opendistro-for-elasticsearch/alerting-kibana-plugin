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

import { EuiText, EuiButtonEmpty, EuiSpacer, EuiPopover } from '@elastic/eui';
import { getIndexFields } from './utils/dataTypes';
import { getMetricExpressionAllowedTypes, getOfExpressionAllowedTypes } from './utils/helpers';
import _ from 'lodash';
import {
  FORMIK_INITIAL_AGG_VALUES,
  FORMIK_INITIAL_VALUES,
} from '../../../containers/CreateMonitor/utils/constants';
import { MetricItem } from './index';
import { Expressions } from './utils/constants';
import MetricPopover from './MetricPopover';

class MetricExpression extends Component {
  renderFieldItems = (arrayHelpers, fieldOptions, expressionWidth) => {
    const {
      formik: { values },
      onMadeChanges,
    } = this.props;
    return values.aggregations.map((aggregation, index) => {
      return (
        <MetricItem
          values={values}
          onMadeChanges={onMadeChanges}
          arrayHelpers={arrayHelpers}
          fieldOptions={fieldOptions}
          expressionWidth={expressionWidth}
          aggregation={aggregation}
          index={index}
        />
      );
    });
  };

  render() {
    const {
      formik: { values },
      arrayHelpers,
      closeExpression,
      openExpression,
      dataTypes,
    } = this.props;

    const fieldOptions = getIndexFields(dataTypes, getMetricExpressionAllowedTypes(values));
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
        <EuiSpacer size="s" />
        {this.renderFieldItems(
          arrayHelpers,
          fieldOptions,
          openExpression,
          closeExpression,
          expressionWidth
        )}
        <EuiSpacer size="xs" />
        <EuiButtonEmpty
          size="xs"
          onClick={() => {
            arrayHelpers.push(_.cloneDeep(FORMIK_INITIAL_AGG_VALUES));
          }}
          data-test-subj="addMetricButton"
        >
          + Add metric
        </EuiButtonEmpty>
      </div>
    );
  }
}

export default connect(MetricExpression);
