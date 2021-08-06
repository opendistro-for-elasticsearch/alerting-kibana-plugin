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
import BucketLevelTriggerExpression from './BucketLevelTriggerExpression';
import {
  DEFAULT_AND_OR_CONDITION,
  DEFAULT_METRIC_AGGREGATION,
} from '../containers/DefineBucketLevelTrigger/DefineBucketLevelTrigger';
import _ from 'lodash';

const BucketLevelTriggerGraph = ({
  arrayHelpers,
  index,
  fieldPath,
  monitorValues,
  triggerValues,
  response,
  queryMetrics,
}) => {
  const fieldNamePath = `${fieldPath}triggerConditions[${index}].`;
  let andOrCondition = _.get(triggerValues, `${fieldNamePath}andOrCondition`);
  if (index > 0 && _.isEmpty(andOrCondition)) {
    andOrCondition = DEFAULT_AND_OR_CONDITION;
    _.set(triggerValues, `${fieldNamePath}andOrCondition`, andOrCondition);
  }

  const queryMetric = _.get(
    triggerValues,
    `${fieldNamePath}queryMetric`,
    DEFAULT_METRIC_AGGREGATION.value
  );
  _.set(triggerValues, `${fieldNamePath}queryMetric`, queryMetric);

  const thresholdEnum = _.get(triggerValues, `${fieldNamePath}thresholdEnum`);
  const thresholdValue = _.get(triggerValues, `${fieldNamePath}thresholdValue`);

  return (
    <div style={{ padding: '0px 10px' }}>
      <BucketLevelTriggerExpression
        arrayHelpers={arrayHelpers}
        index={index}
        andOrCondition={andOrCondition}
        queryMetric={queryMetric}
        queryMetrics={queryMetrics}
        thresholdEnum={thresholdEnum}
        thresholdValue={thresholdValue}
        andOrConditionFieldName={`${fieldNamePath}andOrCondition`}
        queryMetricFieldName={`${fieldNamePath}queryMetric`}
        enumFieldName={`${fieldNamePath}thresholdEnum`}
        valueFieldName={`${fieldNamePath}thresholdValue`}
        label="Trigger conditions"
      />
      <EuiSpacer size={'s'} />
      {/*TODO: Implement VisualGraph illustrating the trigger expression similar to the implementation in TriggerGraph.js*/}
    </div>
  );
};

export default BucketLevelTriggerGraph;
