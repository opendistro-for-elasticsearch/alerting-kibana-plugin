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
import {
  EuiAccordion,
  EuiButton,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { FormikFieldText, FormikComboBox } from '../../../../components/FormControls';
import { isInvalid, hasError, validateActionName } from '../../../../utils/validate';
import { ActionsMap } from './utils/constants';
import { validateDestination } from './utils/validate';
import { DEFAULT_ACTION_TYPE } from '../../utils/constants';

const Action = ({
  action,
  arrayHelpers,
  context,
  destinations,
  index,
  onDelete,
  sendTestMessage,
  setFlyout,
  fieldPath,
  values,
}) => {
  const selectedDestination = destinations.filter((item) => item.value === action.destination_id);
  const type = _.get(selectedDestination, '0.type', DEFAULT_ACTION_TYPE);
  const { name } = action;
  const ActionComponent = ActionsMap[type].component;
  const actionLabel = ActionsMap[type].label;
  const isFirstAction = index !== undefined && index === 0;
  return (
    <div style={{ paddingTop: isFirstAction ? undefined : '20px' }}>
      <EuiPanel panelStyles={{ backgroundColor: '#FFFFFF' }}>
        <EuiAccordion
          id={name}
          initialIsOpen={!name}
          className="accordion-action"
          buttonContent={
            <EuiText>
              {!_.get(selectedDestination, '0.type', undefined)
                ? 'Notification'
                : `${actionLabel}: ${name}`}
            </EuiText>
          }
          extraAction={
            <EuiButton color={'danger'} onClick={onDelete} size={'s'}>
              Remove action
            </EuiButton>
          }
        >
          <EuiHorizontalRule margin="s" />
          <div>
            <FormikFieldText
              name={`${fieldPath}actions.${index}.name`}
              formRow
              fieldProps={{
                validate: validateActionName(context.ctx.monitor, context.ctx.trigger),
              }}
              rowProps={{
                label: 'Action name',
                helpText: 'Names can only contain letters, numbers, and special characters',
                isInvalid,
                error: hasError,
              }}
              inputProps={{
                placeholder: 'Enter action name',
                isInvalid,
              }}
            />
            <FormikComboBox
              name={`${fieldPath}actions.${index}.destination_id`}
              formRow
              fieldProps={{ validate: validateDestination(destinations) }}
              rowProps={{
                label: 'Destination',
                isInvalid,
                error: hasError,
              }}
              inputProps={{
                placeholder: 'Select a destination',
                options: destinations,
                selectedOptions: selectedDestination,
                onChange: (options) => {
                  // Just a swap correct fields.
                  arrayHelpers.replace(index, {
                    ...action,
                    destination_id: options[0].value,
                  });
                },
                onBlur: (e, field, form) => {
                  form.setFieldTouched(`${fieldPath}actions.${index}.destination_id`, true);
                },
                singleSelection: { asPlainText: true },
                isClearable: false,
              }}
            />
            <EuiSpacer size="m" />
            <ActionComponent
              action={action}
              context={context}
              index={index}
              sendTestMessage={sendTestMessage}
              setFlyout={setFlyout}
              fieldPath={fieldPath}
              values={values}
            />
          </div>
          <EuiSpacer size={'l'} />
        </EuiAccordion>
      </EuiPanel>
    </div>
  );
};

export default Action;
