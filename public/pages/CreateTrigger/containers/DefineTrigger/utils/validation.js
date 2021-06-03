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

import { FORMIK_INITIAL_TRIGGER_VALUES } from '../../CreateTrigger/utils/constants';

export const validateTriggerName = (triggers, triggerToEdit) => (value) => {
  if (!value) return 'Required';
  const nameExists = triggers.filter((trigger) => {
    const triggerId = _.get(
      trigger,
      'aggregation_trigger.id',
      _.get(trigger, 'traditional_trigger.id')
    );
    const triggerName = _.get(
      trigger,
      'aggregation_trigger.name',
      _.get(trigger, `traditional_trigger.name`, FORMIK_INITIAL_TRIGGER_VALUES.name)
    );
    return triggerToEdit.id !== triggerId && triggerName.toLowerCase() === value.toLowerCase();
  });
  if (nameExists.length > 0) {
    return 'Trigger name already used';
  }
  // TODO: character restrictions
  // TODO: character limits
};
