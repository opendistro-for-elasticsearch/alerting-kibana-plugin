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
import { EuiEmptyPrompt, EuiText } from '@elastic/eui';
import AddEmailGroupButton from '../AddEmailGroupButton/AddEmailGroupButton';

const emailGroupEmptyText =
  'Use an email group to manage a list of email addresses you frequently send to at the same time. ' +
  'You can create as many email groups as needed and use them together with individual email addresses when ' +
  'specifying recipients.';
const addEmailGroupButton = (arrayHelpers) => <AddEmailGroupButton arrayHelpers={arrayHelpers} />;

const EmailGroupEmptyPrompt = ({ arrayHelpers }) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <h1>You have no email group set up</h1>
        <p>{emailGroupEmptyText}</p>
      </EuiText>
    }
    actions={addEmailGroupButton(arrayHelpers)}
  />
);

export default EmailGroupEmptyPrompt;
