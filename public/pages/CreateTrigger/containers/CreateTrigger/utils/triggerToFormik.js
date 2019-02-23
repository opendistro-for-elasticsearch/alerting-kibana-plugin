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

import _ from 'lodash';
import { FORMIK_INITIAL_VALUES } from './constants';

export function triggerToFormik(trigger, monitor) {
  const {
    id,
    name,
    severity,
    condition: { script },
    actions,
    min_time_between_executions: minTimeBetweenExecutions,
    rolling_window_size: rollingWindowSize,
  } = trigger;

  const thresholdEnum = _.get(
    monitor,
    `ui_metadata.thresholds[${name}].enum`,
    FORMIK_INITIAL_VALUES.thresholdEnum
  );
  const thresholdValue = _.get(
    monitor,
    `ui_metadata.thresholds[${name}].value`,
    FORMIK_INITIAL_VALUES.thresholdValue
  );

  return {
    ..._.cloneDeep(FORMIK_INITIAL_VALUES),
    id,
    name,
    severity,
    script,
    actions,
    minTimeBetweenExecutions,
    rollingWindowSize,
    thresholdEnum,
    thresholdValue,
  };
}
