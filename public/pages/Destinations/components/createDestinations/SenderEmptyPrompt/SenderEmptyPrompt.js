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
import AddSenderButton from '../AddSenderButton/AddSenderButton';

const senderEmptyText =
  'A sender specifies the sender name, sender email, port, host, ' +
  'and encryption method for your destination(s). You can reuse the same sender across different destinations ' +
  'or create as many senders as needed.';
const addSenderButton = (arrayHelpers) => <AddSenderButton arrayHelpers={arrayHelpers} />;

const SenderEmptyPrompt = ({ arrayHelpers }) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <h1>You have no sender set up</h1>
        <p>{senderEmptyText}</p>
      </EuiText>
    }
    actions={addSenderButton(arrayHelpers)}
  />
);

export default SenderEmptyPrompt;
