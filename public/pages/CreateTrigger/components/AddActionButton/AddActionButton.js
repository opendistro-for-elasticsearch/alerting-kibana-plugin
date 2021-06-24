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

import React from 'react';
import _ from 'lodash';
import { EuiButton } from '@elastic/eui';

import { FORMIK_INITIAL_ACTION_VALUES } from '../../utils/constants';

const AddActionButton = ({ arrayHelpers, type = 'slack' }, numOfActions) => {
  const buttonText =
    numOfActions === undefined || numOfActions === 0 ? 'Add action' : 'Add another action';
  return (
    <EuiButton
      fill={false}
      onClick={() => arrayHelpers.unshift(_.cloneDeep(FORMIK_INITIAL_ACTION_VALUES))}
    >
      {buttonText}
    </EuiButton>
  );
};

export default AddActionButton;
