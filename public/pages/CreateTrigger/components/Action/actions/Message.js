/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import Mustache from 'mustache';
import {
  EuiCheckbox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTextArea,
} from '@elastic/eui';

import {
  FormikTextArea,
  FormikFieldRadio,
  FormikFieldText,
  FormikCheckbox,
  FormikFieldNumber,
  FormikComboBox,
} from '../../../../../components/FormControls';
import {
  isInvalid,
  isInvalidActionThrottle,
  validateActionThrottle,
  hasError,
  required,
} from '../../../../../utils/validate';
import { URL, MAX_THROTTLE_VALUE, WRONG_THROTTLE_WARNING } from '../../../../../../utils/constants';
import { MONITOR_TYPE } from '../../../../../utils/constants';

export const NOTIFY_OPTIONS_VALUES = {
  PER_ALERT: 'per_alert',
  PER_EXECUTION: 'per_execution',
};

export const NOTIFY_OPTIONS_LABELS = {
  PER_ALERT: 'Per alert',
  PER_EXECUTION: 'Per execution',
};

export const ACTIONABLE_ALERTS_OPTIONS_VALUES = {
  COMPLETED: 'COMPLETED',
  DEDUPED: 'DEDUPED',
  NEW: 'NEW',
};

export const ACTIONABLE_ALERTS_OPTIONS_LABELS = {
  COMPLETED: 'Completed',
  DEDUPED: 'De-duplicated',
  NEW: 'New',
};

export const ACTIONABLE_ALERTS_OPTIONS = [
  {
    value: ACTIONABLE_ALERTS_OPTIONS_VALUES.COMPLETED,
    label: ACTIONABLE_ALERTS_OPTIONS_LABELS.COMPLETED,
  },
  {
    value: ACTIONABLE_ALERTS_OPTIONS_VALUES.DEDUPED,
    label: ACTIONABLE_ALERTS_OPTIONS_LABELS.DEDUPED,
  },
  {
    value: ACTIONABLE_ALERTS_OPTIONS_VALUES.NEW,
    label: ACTIONABLE_ALERTS_OPTIONS_LABELS.NEW,
  },
];

export const DEFAULT_ACTIONABLE_ALERTS_SELECTIONS = [
  {
    value: ACTIONABLE_ALERTS_OPTIONS_VALUES.DEDUPED,
    label: ACTIONABLE_ALERTS_OPTIONS_LABELS.DEDUPED,
  },
  {
    value: ACTIONABLE_ALERTS_OPTIONS_VALUES.NEW,
    label: ACTIONABLE_ALERTS_OPTIONS_LABELS.NEW,
  },
];

export const NO_ACTIONABLE_ALERT_SELECTIONS = 'Must select at least 1 option';

const messageHelpText = () => (
  <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
    <EuiFlexItem>
      <Fragment>
        <EuiText size="xs">
          Embed variables in your message using Mustache templates.{' '}
          <a href={URL.MUSTACHE}>Learn more</a>
        </EuiText>
      </Fragment>
    </EuiFlexItem>
  </EuiFlexGroup>
);

const renderSendTestMessageButton = (
  index,
  sendTestMessage,
  isBucketLevelMonitor,
  displayPreview,
  setDisplayPreview,
  fieldPath
) => {
  return (
    <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexStart">
      <EuiFlexItem>
        <EuiCheckbox
          id={`${fieldPath}actions.${index}`}
          label={'Preview message'}
          checked={displayPreview}
          onChange={(e) => setDisplayPreview(e)}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup alignItems="flexEnd" direction="column" gutterSize="xs">
          <EuiFlexItem grow={false}>
            <EuiLink
              onClick={() => {
                sendTestMessage(index);
              }}
            >
              <EuiText>Send test message</EuiText>
            </EuiLink>
          </EuiFlexItem>
          {isBucketLevelMonitor ? (
            <EuiFlexItem>
              <EuiText size="xs">
                For bucket-level triggers, at least one bucket of data is required from the monitor
                input query.
              </EuiText>
            </EuiFlexItem>
          ) : null}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const validateActionableAlertsSelections = (options) => {
  if (!_.isArray(options) || _.isEmpty(options)) return NO_ACTIONABLE_ALERT_SELECTIONS;
};

export default function Message(
  { action, context, index, isSubjectDisabled = false, sendTestMessage, fieldPath, values } = this
    .props
) {
  const [displayPreview, setDisplayPreview] = useState(false);
  const onDisplayPreviewChange = (e) => setDisplayPreview(e.target.checked);
  const isBucketLevelMonitor =
    _.get(context, 'ctx.monitor.monitor_type', MONITOR_TYPE.QUERY_LEVEL) ===
    MONITOR_TYPE.BUCKET_LEVEL;
  const actionExecutionPolicyPath = isBucketLevelMonitor
    ? `${fieldPath}actions.${index}.action_execution_policy`
    : `${fieldPath}actions.${index}`;

  let actionExecutionScopeId = isBucketLevelMonitor
    ? _.get(
        action,
        'action_execution_policy.action_execution_scope',
        NOTIFY_OPTIONS_VALUES.PER_ALERT
      )
    : '';
  if (!_.isString(actionExecutionScopeId))
    actionExecutionScopeId = _.keys(actionExecutionScopeId)[0];

  let actionableAlertsSelections = _.get(
    values,
    `${actionExecutionPolicyPath}.action_execution_scope.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`
  );
  if (
    actionExecutionScopeId === NOTIFY_OPTIONS_VALUES.PER_ALERT &&
    _.isEmpty(actionableAlertsSelections)
  )
    _.set(
      values,
      `${actionExecutionPolicyPath}.action_execution_scope.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`,
      DEFAULT_ACTIONABLE_ALERTS_SELECTIONS
    );

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
          name={`${fieldPath}actions.${index}.subject_template.source`}
          formRow
          fieldProps={{ validate: required }}
          rowProps={{
            label: 'Message subject',
            style: { maxWidth: '100%' },
            isInvalid,
            error: hasError,
          }}
          inputProps={{
            placeholder: 'Enter a subject',
            fullWidth: true,
            isInvalid,
          }}
        />
      ) : null}
      <FormikTextArea
        name={`${fieldPath}actions.${index}.message_template.source`}
        formRow
        fieldProps={{ validate: required }}
        rowProps={{
          label: (
            <div>
              <span>Message</span>
              {messageHelpText}
            </div>
          ),
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

      <EuiFormRow style={{ maxWidth: '100%' }}>
        {renderSendTestMessageButton(
          index,
          sendTestMessage,
          isBucketLevelMonitor,
          displayPreview,
          onDisplayPreviewChange,
          fieldPath
        )}
      </EuiFormRow>

      {displayPreview ? (
        <EuiFormRow label="Message preview" style={{ maxWidth: '100%' }}>
          <EuiTextArea
            placeholder="Preview of mustache template"
            fullWidth
            value={preview}
            readOnly
            className="read-only-text-area"
          />
        </EuiFormRow>
      ) : null}

      <EuiSpacer size="m" />

      <EuiText>
        <h4>Action configuration</h4>
      </EuiText>

      <EuiSpacer size="m" />

      {isBucketLevelMonitor ? (
        <EuiFormRow
          label={<span style={{ color: '#343741' }}>Perform action</span>}
          style={{ maxWidth: '100%' }}
        >
          <EuiFlexGroup direction={'column'} gutterSize={'xs'}>
            <EuiFlexItem>
              <FormikFieldRadio
                name={`${actionExecutionPolicyPath}.action_execution_scope`}
                formRow
                inputProps={{
                  id: `${actionExecutionPolicyPath}.${NOTIFY_OPTIONS_VALUES.PER_ALERT}`,
                  value: NOTIFY_OPTIONS_VALUES.PER_ALERT,
                  checked: actionExecutionScopeId === NOTIFY_OPTIONS_VALUES.PER_ALERT,
                  label: NOTIFY_OPTIONS_LABELS.PER_ALERT,
                  onChange: (e, field, form) => {
                    field.onChange(e);
                  },
                }}
              />
            </EuiFlexItem>

            <EuiFlexItem>
              {actionExecutionScopeId === NOTIFY_OPTIONS_VALUES.PER_ALERT ? (
                <EuiFormRow style={{ maxWidth: '100%' }}>
                  <EuiFlexGroup
                    alignItems="center"
                    style={{
                      margin: '0px',
                      maxWidth: '100%',
                    }}
                  >
                    <FormikComboBox
                      name={`${actionExecutionPolicyPath}.action_execution_scope.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`}
                      formRow
                      fieldProps={{ validate: validateActionableAlertsSelections }}
                      rowProps={{
                        label: 'Actionable alerts',
                        style: { width: '400px' },
                        isInvalid: _.isEmpty(
                          _.get(
                            action,
                            `action_execution_policy.action_execution_scope.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`
                          )
                        ),
                        error: NO_ACTIONABLE_ALERT_SELECTIONS,
                      }}
                      inputProps={{
                        placeholder: 'Select alert options',
                        options: ACTIONABLE_ALERTS_OPTIONS,
                        onBlur: (e, field, form) => {
                          form.setFieldTouched(
                            `${actionExecutionPolicyPath}.action_execution_scope.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`,
                            true
                          );
                        },
                        onChange: (options, field, form) => {
                          form.setFieldValue(
                            `${actionExecutionPolicyPath}.action_execution_scope.${NOTIFY_OPTIONS_VALUES.PER_ALERT}.actionable_alerts`,
                            options
                          );
                        },
                        isClearable: true,
                        selectedOptions: actionableAlertsSelections,
                      }}
                    />
                  </EuiFlexGroup>
                </EuiFormRow>
              ) : null}
            </EuiFlexItem>

            <EuiFlexItem>
              <FormikFieldRadio
                name={`${actionExecutionPolicyPath}.action_execution_scope`}
                formRow
                inputProps={{
                  id: `${actionExecutionPolicyPath}.${NOTIFY_OPTIONS_VALUES.PER_EXECUTION}`,
                  value: NOTIFY_OPTIONS_VALUES.PER_EXECUTION,
                  checked: actionExecutionScopeId === NOTIFY_OPTIONS_VALUES.PER_EXECUTION,
                  label: NOTIFY_OPTIONS_LABELS.PER_EXECUTION,
                  onChange: (e, field, form) => {
                    field.onChange(e);
                  },
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
      ) : null}

      <EuiFormRow
        label={<span style={{ color: '#343741' }}>Throttling</span>}
        style={{ maxWidth: '100%' }}
      >
        <EuiFlexGroup direction="column">
          <EuiFlexItem
            grow={false}
            style={{ marginBottom: _.get(action, `throttle_enabled`) ? '0px' : '12px' }}
          >
            <FormikCheckbox
              name={`${fieldPath}actions.${index}.throttle_enabled`}
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
                  name={`${actionExecutionPolicyPath}.throttle.value`}
                  fieldProps={{ validate: validateActionThrottle(action) }}
                  formRow={true}
                  rowProps={{
                    isInvalid: isInvalidActionThrottle(action),
                    helpText: !isInvalidActionThrottle(action) && WRONG_THROTTLE_WARNING,
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
                          paddingLeft: '4px',
                        }}
                      >
                        minutes
                      </EuiText>
                    ),
                    className: 'euiFieldText',
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
}
