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

export const validateEmailSender = senders => value => {
  if (_.isEmpty(value)) return 'Required';
  // In case existing sender (email account) doesn't exist in list, invalidate the field
  const senderMatches = senders.filter(sender => sender.value === value[0].value);
  if (senderMatches.length === 0) {
    return 'Matching sender required';
  }
};
