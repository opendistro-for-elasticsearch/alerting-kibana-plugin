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
import Mustache from 'mustache';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiButtonEmpty,
  EuiTextArea,
} from '@elastic/eui';

import {
  FormikTextArea,
  FormikFieldText,
  FormikCheckbox,
  FormikFieldNumber,
} from '../../../../../components/FormControls';
import {
  isInvalid,
  isInvalidActionThrottle,
  validateActionThrottle,
  hasError,
  required,
} from '../../../../../utils/validate';
import { URL, MAX_THROTTLE_VALUE, WRONG_THROTTLE_WARNING } from '../../../../../../utils/constants';

const messageHelpText = (index, sendTestMessage) => (
  <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
    <EuiFlexItem>
      <EuiText size="xs">
        Embed variables in your message using Mustache templates.{' '}
        <a href={URL.MUSTACHE}>Learn more about Mustache</a>
      </EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiText size="xs">
        <EuiButtonEmpty
          onClick={() => {
            sendTestMessage(index);
          }}
        >
          Send test message
        </EuiButtonEmpty>
      </EuiText>
    </EuiFlexItem>
  </EuiFlexGroup>
);

const Message = ({
  action,
  context,
  index,
  isSubjectDisabled = false,
  sendTestMessage,
  setFlyout,
}) => {
  let preview = '';
  try {
    preview = Mustache.render(action.message_template.source, context);
  } catch (err) {
    preview = err.message;
    console.error('There was an error rendering mustache template', err);
  }
  return (
    <div>
      {!isSubjectDisabled ? (
        <FormikFieldText
          name={`actions.${index}.subject_template.source`}
          formRow
          fieldProps={{ validate: required }}
          rowProps={{
            label: 'Message subject',
            isInvalid,
            error: hasError,
          }}
          inputProps={{ isInvalid }}
        />
      ) : null}
      <FormikTextArea
        name={`actions.${index}.message_template.source`}
        formRow
        fieldProps={{ validate: required }}
        rowProps={{
          label: (
            <div>
              <span>Message</span>
              <EuiButtonEmpty
                size="s"
                onClick={() => {
                  setFlyout({ type: 'message' });
                }}
              >
                Info
              </EuiButtonEmpty>
            </div>
          ),
          helpText: messageHelpText(index, sendTestMessage),
          style: { maxWidth: '100%' },
          isInvalid,
          error: hasError,
        }}
        inputProps={{
          placeholder: 'Can use mustache templates',
          fullWidth: true,
          isInvalid,
        }}
      />

      <EuiFormRow label="Message preview" style={{ maxWidth: '100%' }}>
        <EuiTextArea
          placeholder="Preview of mustache template"
          fullWidth
          value={preview}
          readOnly
          className="read-only-text-area"
        />
      </EuiFormRow>

      <EuiSpacer size="s" />

      <EuiFormRow
        label={
          <div>
            <span style={{ color: '#343741' }}>Action throttling</span>
            <EuiButtonEmpty
              size="s"
              onClick={() => {
                setFlyout({ type: 'messageFrequency' });
              }}
            >
              Info
            </EuiButtonEmpty>
          </div>
        }
        style={{ maxWidth: '100%' }}
      >
        <EuiFlexGroup direction="column">
          <EuiFlexItem
            grow={false}
            style={{ marginBottom: _.get(action, `throttle_enabled`) ? '0px' : '12px' }}
          >
            <FormikCheckbox
              name={`actions.${index}.throttle_enabled`}
              inputProps={{ label: 'Enable action throttling' }}
            />
          </EuiFlexItem>
          <EuiFlexGroup
            alignItems="center"
            style={{ margin: '0px', display: _.get(action, `throttle_enabled`) ? '' : 'none' }}
          >
            <EuiFlexItem grow={false} style={{ marginRight: '0px' }}>
              <EuiFormRow label="Throttle actions to only trigger every">
                <FormikFieldNumber
                  name={`actions.${index}.throttle.value`}
                  fieldProps={{ validate: validateActionThrottle(action) }}
                  formRow={true}
                  rowProps={{
                    isInvalid: isInvalidActionThrottle(action),
                    error: [WRONG_THROTTLE_WARNING],
                  }}
                  inputProps={{
                    style: { width: '400px', height: '40px' },
                    min: 1,
                    max: MAX_THROTTLE_VALUE,
                    compressed: true,
                    append: (
                      <EuiText
                        style={{
                          height: '40px',
                          lineHeight: '24px',
                          backgroundColor: 'transparent',
                          paddingLeft: '2px',
                        }}
                      >
                        minutes
                      </EuiText>
                    ),
                    class: 'euiFieldText',
                    disabled: !_.get(action, `throttle_enabled`) ? 'disabled' : '',
                  }}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </EuiFormRow>
    </div>
  );
};

export default Message;
