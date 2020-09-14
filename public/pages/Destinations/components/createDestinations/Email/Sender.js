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
import { EuiAccordion, EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import {
  FormikFieldText,
  FormikFieldNumber,
  FormikSelect,
} from '../../../../../components/FormControls';
import { isInvalid, hasError } from '../../../../../utils/validate';
import { validateEmail, validateHost, validatePort, validateSenderName } from './utils/validate';
import { METHOD_TYPE, STATE } from './utils/constants';

const methodOptions = [
  { value: METHOD_TYPE.NONE, text: 'None' },
  { value: METHOD_TYPE.SSL, text: 'SSL' },
  { value: METHOD_TYPE.TLS, text: 'TLS' },
];

const onSenderChange = (index, sender, arrayHelpers) => {
  // Checking for id here since new senders should not be marked as updated
  // Also will not replace the sender state if it has already been marked as updated
  if (sender.id && sender.state !== STATE.UPDATED) {
    arrayHelpers.replace(index, {
      ...sender,
      state: STATE.UPDATED,
    });
  }
};

const Sender = ({ sender, arrayHelpers, context, index, onDelete }) => {
  const { name } = sender;
  return (
    <EuiAccordion
      id={name}
      buttonContent={!name ? 'New sender' : name}
      paddingSize="l"
      extraAction={
        <EuiButton color="danger" size="s" onClick={onDelete}>
          Remove sender
        </EuiButton>
      }
    >
      <FormikFieldText
        name={`senders.${index}.name`}
        formRow
        fieldProps={{ validate: validateSenderName(context.ctx.senders) }}
        rowProps={{
          label: 'Sender name',
          helpText:
            'A unique and descriptive name that is easy to search. ' +
            'Valid characters are upper and lowercase a-z, 0-9, _ (underscore) and - (hyphen).',
          style: { padding: '10px 0px' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          placeholder: 'my-sender',
          onChange: (e, field, form) => {
            field.onChange(e);
            onSenderChange(index, sender, arrayHelpers);
          },
          isInvalid,
        }}
      />
      <EuiFlexGroup
        alignItems="baseline"
        justifyContent="flexStart"
        style={{ padding: '10px 0px' }}
      >
        <EuiFlexItem grow={false}>
          <FormikFieldText
            name={`senders.${index}.email`}
            formRow
            fieldProps={{ validate: validateEmail }}
            rowProps={{
              label: 'Email address',
              isInvalid,
              error: hasError,
            }}
            inputProps={{
              placeholder: 'username@xxx.com',
              onChange: (e, field, form) => {
                field.onChange(e);
                onSenderChange(index, sender, arrayHelpers);
              },
              isInvalid,
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <FormikFieldText
            name={`senders.${index}.host`}
            formRow
            fieldProps={{ validate: validateHost }}
            rowProps={{
              label: 'Host',
              isInvalid,
              error: hasError,
            }}
            inputProps={{
              placeholder: 'smtp.xxx.com',
              onChange: (e, field, form) => {
                field.onChange(e);
                onSenderChange(index, sender, arrayHelpers);
              },
              isInvalid,
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <FormikFieldNumber
            name={`senders.${index}.port`}
            formRow
            fieldProps={{ validate: validatePort }}
            rowProps={{
              label: 'Port',
              isInvalid,
              error: hasError,
            }}
            inputProps={{
              placeholder: '25',
              onChange: (e, field, form) => {
                field.onChange(e);
                onSenderChange(index, sender, arrayHelpers);
              },
              isInvalid,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <FormikSelect
        name={`senders.${index}.method`}
        formRow
        rowProps={{
          label: 'Encryption method',
          helpText: `SSL or TLS is recommended for security.
          SSL and TLS requires validation by adding the following fields to the Elasticsearch keystore:
          opendistro.alerting.destination.email.${!name ? '[sender name]' : name}.username
          opendistro.alerting.destination.email.${!name ? '[sender name]' : name}.password`,
          style: { padding: '10px 0px' },
        }}
        inputProps={{
          options: methodOptions,
          onChange: (e, field, form) => {
            field.onChange(e);
            onSenderChange(index, sender, arrayHelpers);
          },
        }}
      />
    </EuiAccordion>
  );
};

export default Sender;
