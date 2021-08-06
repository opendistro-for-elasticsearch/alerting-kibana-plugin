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
import _ from 'lodash';
import { EuiButton } from '@elastic/eui';

import { DEFAULT_MESSAGE_SOURCE, FORMIK_INITIAL_ACTION_VALUES } from '../../utils/constants';
import { MONITOR_TYPE } from '../../../../utils/constants';

const AddActionButton = ({ arrayHelpers, type = 'slack', numOfActions }) => {
  const buttonText =
    numOfActions === undefined || numOfActions === 0 ? 'Add action' : 'Add another action';
  const monitorType = _.get(arrayHelpers, 'form.values.monitor_type', MONITOR_TYPE.QUERY_LEVEL);
  const initialActionValues = _.cloneDeep(FORMIK_INITIAL_ACTION_VALUES);
  switch (monitorType) {
    case MONITOR_TYPE.BUCKET_LEVEL:
      _.set(
        initialActionValues,
        'message_template.source',
        DEFAULT_MESSAGE_SOURCE.BUCKET_LEVEL_MONITOR
      );
      break;
    case MONITOR_TYPE.QUERY_LEVEL:
      _.set(
        initialActionValues,
        'message_template.source',
        DEFAULT_MESSAGE_SOURCE.QUERY_LEVEL_MONITOR
      );
      break;
  }
  return (
    <EuiButton fill={false} size={'s'} onClick={() => arrayHelpers.push(initialActionValues)}>
      {buttonText}
    </EuiButton>
  );
};

export default AddActionButton;
