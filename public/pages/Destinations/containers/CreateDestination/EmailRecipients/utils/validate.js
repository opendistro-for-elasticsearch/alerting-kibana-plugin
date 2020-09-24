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
import { RECIPIENT_TYPE } from './constants';
import { isValidEmail } from '../../../../components/createDestinations/Email/utils/validate';

export const validateEmailRecipients = (options) => {
  if (_.isEmpty(options)) return 'Required';

  let invalidEmails = [];
  for (const option of options) {
    if (option.type === RECIPIENT_TYPE.EMAIL && !isValidEmail(option.value)) {
      invalidEmails.push(option.value);
    }
  }

  if (invalidEmails.length > 0) return `Invalid emails: ${invalidEmails.join(', ')}`;
};
