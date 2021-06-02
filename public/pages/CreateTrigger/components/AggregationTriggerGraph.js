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

const AggregationTriggerGraph = ({
  index,
  andOrCondition,
  monitorValues,
  response,
  queryMetric,
  queryMetrics,
  thresholdEnum,
  thresholdValue,
}) => (
  <div style={{ padding: '0px 10px' }}>
    <AggregationTriggerExpression
      index={index}
      andOrCondition={andOrCondition}
      queryMetric={queryMetric}
      queryMetrics={queryMetrics}
      thresholdEnum={thresholdEnum}
      thresholdValue={thresholdValue}
      andOrConditionFieldName={
        index === undefined ? 'andOrCondition' : `triggerConditions[${index}].andOrCondition`
      }
      queryMetricFieldName={
        index === undefined ? 'queryMetric' : `triggerConditions[${index}].queryMetric`
      }
      enumFieldName={
        index === undefined ? 'thresholdEnum' : `triggerConditions[${index}].thresholdEnum`
      }
      valueFieldName={
        index === undefined ? 'thresholdValue' : `triggerConditions[${index}].thresholdValue`
      }
      label="Trigger conditions"
    />
    <EuiSpacer size={'s'} />
    {/*TODO: Implement VisualGraph illustrating the trigger expression similar to the implementation in TriggerGraph.js*/}
  </div>
);

export default AggregationTriggerGraph;
