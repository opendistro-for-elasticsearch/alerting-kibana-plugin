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

import { FORMIK_INITIAL_TRIGGER_VALUES, TRIGGER_TYPE } from '../../CreateTrigger/utils/constants';

export const validateTriggerName = (triggers, triggerToEdit, fieldPath) => (value) => {
  if (!value) return 'Required';
  const nameExists = triggers.filter((trigger) => {
    const triggerId = _.get(
      trigger,
      `${TRIGGER_TYPE.BUCKET_LEVEL}.id`,
      _.get(trigger, `${TRIGGER_TYPE.QUERY_LEVEL}.id`)
    );
    const triggerName = _.get(
      trigger,
      `${TRIGGER_TYPE.BUCKET_LEVEL}.name`,
      _.get(trigger, `${TRIGGER_TYPE.QUERY_LEVEL}.name`, FORMIK_INITIAL_TRIGGER_VALUES.name)
    );
    const triggerToEditId = _.get(triggerToEdit, `${fieldPath}id`, triggerToEdit.id);
    return triggerToEditId !== triggerId && triggerName.toLowerCase() === value.toLowerCase();
  });
  if (nameExists.length > 0) {
    return 'Trigger name already used';
  }
  // TODO: character restrictions
  // TODO: character limits
};
