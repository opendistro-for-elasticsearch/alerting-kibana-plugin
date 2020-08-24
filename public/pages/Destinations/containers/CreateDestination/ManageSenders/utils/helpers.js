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
import {
  FORMIK_INITIAL_SENDER_VALUES,
  SENDER_STATE,
} from '../../../../components/createDestinations/Email/utils/constants';

export function senderToFormik(sender) {
  const { id, ifSeqNo, ifPrimaryTerm, name, email, host, port, method } = sender;
  return {
    ..._.cloneDeep(FORMIK_INITIAL_SENDER_VALUES),
    id,
    ifSeqNo,
    ifPrimaryTerm,
    name,
    email,
    host,
    port,
    method,
    state: SENDER_STATE.NO_OP,
  };
}
