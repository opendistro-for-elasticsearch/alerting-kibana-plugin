/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { get, isEmpty } from 'lodash';
export const migrateTriggerMetadata = monitor => {
  const uiMetadata = get(monitor, 'ui_metadata', {});
  if (isEmpty(uiMetadata)) return monitor;
  // Already migrated no need to perform any action
  if (uiMetadata.triggers) return monitor;
  const { thresholds = {}, ...rest } = uiMetadata;
  return {
    ...monitor,
    ui_metadata: {
      ...rest,
      triggers: {
        ...thresholds,
      },
    },
  };
};
