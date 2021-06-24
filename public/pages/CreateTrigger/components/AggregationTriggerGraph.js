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

import React from 'react';
import { EuiSpacer } from '@elastic/eui';
import AggregationTriggerExpression from './AggregationTriggerExpression';
import {
  DEFAULT_AND_OR_CONDITION,
  DEFAULT_METRIC_AGGREGATION,
} from '../containers/DefineAggregationTrigger/DefineAggregationTrigger';
import _ from 'lodash';

const AggregationTriggerGraph = ({
  arrayHelpers,
  index,
  triggerIndex,
  monitorValues,
  triggerValues,
  response,
  queryMetrics,
}) => {
  const fieldPath = `aggregationTriggers[${triggerIndex}].triggerConditions[${index}]`;

  let andOrCondition = _.get(triggerValues, `${fieldPath}.andOrCondition`);
  if (index > 0 && _.isEmpty(andOrCondition)) {
    andOrCondition = DEFAULT_AND_OR_CONDITION;
    _.set(triggerValues, `${fieldPath}.andOrCondition`, andOrCondition);
  }

  const queryMetric = _.get(
    triggerValues,
    `${fieldPath}.queryMetric`,
    DEFAULT_METRIC_AGGREGATION.value
  );
  _.set(triggerValues, `${fieldPath}.queryMetric`, queryMetric);

  const thresholdEnum = _.get(triggerValues, `${fieldPath}.thresholdEnum`);
  const thresholdValue = _.get(triggerValues, `${fieldPath}.thresholdValue`);

  return (
    <div style={{ padding: '0px 10px' }}>
      <AggregationTriggerExpression
        arrayHelpers={arrayHelpers}
        index={index}
        andOrCondition={andOrCondition}
        queryMetric={queryMetric}
        queryMetrics={queryMetrics}
        thresholdEnum={thresholdEnum}
        thresholdValue={thresholdValue}
        andOrConditionFieldName={
          index === undefined ? 'andOrCondition' : `${fieldPath}.andOrCondition`
        }
        queryMetricFieldName={index === undefined ? 'queryMetric' : `${fieldPath}.queryMetric`}
        enumFieldName={index === undefined ? 'thresholdEnum' : `${fieldPath}.thresholdEnum`}
        valueFieldName={index === undefined ? 'thresholdValue' : `${fieldPath}.thresholdValue`}
        label="Trigger conditions"
      />
      <EuiSpacer size={'s'} />
      {/*TODO: Implement VisualGraph illustrating the trigger expression similar to the implementation in TriggerGraph.js*/}
    </div>
  );
};

export default AggregationTriggerGraph;
