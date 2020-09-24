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

export const METHOD_TYPE = {
  NONE: 'none',
  SSL: 'ssl',
  TLS: 'starttls',
};

export const STATE = {
  NO_OP: 'no_op',
  UPDATED: 'updated',
  CREATED: 'created',
};

export const FORMIK_INITIAL_SENDER_VALUES = {
  name: '',
  email: '',
  host: '',
  port: '',
  method: METHOD_TYPE.NONE,
  state: STATE.CREATED,
};

export const FORMIK_INITIAL_EMAIL_GROUP_VALUES = {
  name: '',
  emails: [],
  state: STATE.CREATED,
};
