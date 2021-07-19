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
import { Field } from 'formik';
import _ from 'lodash';
import Mustache from 'mustache';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiRadioGroup,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
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

export const NO_ACTIONABLE_ALERT_SELECTIONS = 'Must select at least 1 option';

export const NOTIFY_OPTIONS = {
  PER_ALERT: 'per_alert',
  PER_EXECUTION: 'per_execution',
};

// TODO: EuiRadioGroup will need id:label format
// export const notifyOptions = [
//   { id: NOTIFY_OPTIONS.PER_ALERT, label: 'Per alert' },
//   { id: NOTIFY_OPTIONS.PER_EXECUTION, label: 'Per execution' },
// ];

export const notifyOptions = [
  { value: NOTIFY_OPTIONS.PER_ALERT, text: 'Per alert' },
  { value: NOTIFY_OPTIONS.PER_EXECUTION, text: 'Per execution' },
];

export const ACTIONABLE_ALERTS_OPTIONS = {
  COMPLETED: 'Completed',
  DEDUPED: 'Deduped',
  NEW: 'New',
};

export const actionableAlertsOptions = [
  { value: 'COMPLETED', label: ACTIONABLE_ALERTS_OPTIONS.COMPLETED },
  { value: 'DEDUPED', label: ACTIONABLE_ALERTS_OPTIONS.DEDUPED },
  { value: 'NEW', label: ACTIONABLE_ALERTS_OPTIONS.NEW },
];

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
  isAggregationMonitor,
  displayPreview,
  setDisplayPreview
) => (
  <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexStart">
    <EuiFlexItem>
      <EuiSwitch
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
        {isAggregationMonitor ? (
          <EuiFlexItem>
            <EuiText size="xs">
              For aggregation triggers, at least one bucket of data is required from the monitor
              input query.
            </EuiText>
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    </EuiFlexItem>
  </EuiFlexGroup>
);

const validateActionableAlertsSelections = (options) => {
  if (!_.isArray(options) || _.isEmpty(options)) return NO_ACTIONABLE_ALERT_SELECTIONS;
};

export default function Message(
  { action, context, index, isSubjectDisabled = false, sendTestMessage, fieldPath } = this.props
) {
  const [displayPreview, setDisplayPreview] = useState(false);
  const onDisplayPreviewChange = (e) => setDisplayPreview(e.target.checked);
  const isAggregationMonitor =
    _.get(context, 'ctx.monitor.monitor_type', MONITOR_TYPE.TRADITIONAL) ===
    MONITOR_TYPE.AGGREGATION;
  const actionExecutionPolicyPath = isAggregationMonitor
    ? `${fieldPath}actions.${index}.action_execution_policy`
    : `${fieldPath}actions.${index}`;

  let actionExecutionFrequencyId = isAggregationMonitor
    ? _.get(action, 'action_execution_policy.action_execution_frequency', NOTIFY_OPTIONS.PER_ALERT)
    : '';
  if (!_.isString(actionExecutionFrequencyId))
    actionExecutionFrequencyId = _.keys(actionExecutionFrequencyId)[0];

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
            isInvalid,
            error: hasError,
          }}
          inputProps={{ isInvalid }}
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
          isAggregationMonitor,
          displayPreview,
          onDisplayPreviewChange
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

      <EuiFormRow
        label={<span style={{ color: '#343741' }}>Action throttling</span>}
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

      {/*// TODO: The UX mocks use the EuiRadio component, not EuiSelect. */}
      {/*However, I was having trouble getting EuiRadio to function for this purpose. */}
      {/*Using EuiSelect for now for demo purposes.*/}
      {isAggregationMonitor ? (
        <EuiFormRow
          label={<span style={{ color: '#343741' }}>Notify</span>}
          style={{ maxWidth: '100%' }}
        >
          <Field name={`${actionExecutionPolicyPath}.action_execution_frequency`}>
            {({ field: { onBlur, ...rest }, form: { touched, errors } }) => (
              <EuiSelect options={notifyOptions} {...rest} />
            )}
          </Field>
        </EuiFormRow>
      ) : null}

      {/*{isAggregationMonitor ? (*/}
      {/*  <EuiFormRow*/}
      {/*    label={<span style={{ color: '#343741' }}>Notify</span>}*/}
      {/*    style={{ maxWidth: '100%' }}*/}
      {/*  >*/}
      {/*    <Field*/}
      {/*      name={`${actionExecutionPolicyPath}.action_execution_frequency`}*/}
      {/*    >*/}
      {/*      {({*/}
      {/*          field: { value, onChange, onBlur, ...rest },*/}
      {/*          form: { touched, errors, setFieldValue },*/}
      {/*        }) => (*/}
      {/*        <EuiRadioGroup*/}
      {/*          name={`${actionExecutionPolicyPath}.action_execution_frequency`}*/}
      {/*          options={notifyOptions}*/}
      {/*          idSelected={actionExecutionFrequencyId}*/}
      {/*          onChange={(optionId) => {*/}
      {/*            setFieldValue(*/}
      {/*              `${actionExecutionPolicyPath}.action_execution_frequency`,*/}
      {/*              optionId*/}
      {/*            );*/}
      {/*          }}*/}
      {/*        />*/}
      {/*      )}*/}
      {/*    </Field>*/}
      {/*  </EuiFormRow>*/}
      {/*) : null}*/}

      {actionExecutionFrequencyId === NOTIFY_OPTIONS.PER_ALERT ? (
        <EuiFormRow style={{ maxWidth: '100%' }}>
          <EuiFlexGroup
            alignItems="center"
            style={{
              margin: '0px',
              maxWidth: '100%',
            }}
          >
            <FormikComboBox
              name={`${actionExecutionPolicyPath}.action_execution_frequency.${NOTIFY_OPTIONS.PER_ALERT}.actionable_alerts`}
              formRow
              fieldProps={{ validate: validateActionableAlertsSelections }}
              rowProps={{
                label: 'Actionable alerts',
                style: { width: '400px' },
                isInvalid,
                error: hasError,
              }}
              inputProps={{
                placeholder: 'Select alert options',
                options: actionableAlertsOptions,
                onBlur: (e, field, form) => {
                  form.setFieldTouched(
                    `${actionExecutionPolicyPath}.action_execution_frequency.${NOTIFY_OPTIONS.PER_ALERT}.actionable_alerts`,
                    true
                  );
                },
                onChange: (options, field, form) => {
                  form.setFieldValue(
                    `${actionExecutionPolicyPath}.action_execution_frequency.${NOTIFY_OPTIONS.PER_ALERT}.actionable_alerts`,
                    options
                  );
                },
                isClearable: true,
              }}
            />
          </EuiFlexGroup>
        </EuiFormRow>
      ) : null}
    </div>
  );
}
