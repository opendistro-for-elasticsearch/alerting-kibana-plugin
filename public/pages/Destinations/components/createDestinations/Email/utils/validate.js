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

export const validateSenderName = senders => value => {
  if (!value) {
    return 'Required';
  } else if (!/^[A-Z0-9_-]+$/i.test(value)) {
    return 'Invalid sender name';
  }

  const matches = senders.filter(sender => sender.name === value);
  if (matches.length > 1) return 'Sender name is already being used';
};

export const validateEmailGroupName = emailGroups => value => {
  if (!value) {
    return 'Required';
  } else if (!/^[A-Z0-9_-]+$/i.test(value)) {
    return 'Invalid email group name';
  }

  const matches = emailGroups.filter(emailGroup => emailGroup.name === value);
  if (matches.length > 1) return 'Email group name is already being used';
};

export const validateEmailGroupEmails = options => {
  if (_.isEmpty(options)) return 'Must specify an email';

  if (options.some(option => !isValidEmail(option))) {
    return 'At least one of the specified emails is invalid';
  }
};

export const validateEmail = value => {
  if (!value) {
    return 'Required';
  } else if (!isValidEmail(value)) {
    return 'Invalid email address';
  }
};

export const validateHost = value => {
  // SMTP hosts are usually of the format smtp.serveraddress.com
  // but this is not always the case so choosing not to validate the format here
  if (!value) return 'Required';
};

export const validatePort = value => {
  if (!value) return 'Required';
};

export const isValidEmail = value => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
