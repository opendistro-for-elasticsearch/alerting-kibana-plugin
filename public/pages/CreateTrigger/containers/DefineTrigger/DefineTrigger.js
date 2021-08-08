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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { EuiAccordion, EuiButton, EuiSpacer, EuiTitle } from '@elastic/eui';
import 'brace/mode/plain_text';
import { FormikFieldText, FormikSelect } from '../../../../components/FormControls';
import { isInvalid, hasError } from '../../../../utils/validate';
import TriggerQuery from '../../components/TriggerQuery';
import TriggerGraph from '../../components/TriggerGraph';
import { validateTriggerName } from './utils/validation';
import { SEARCH_TYPE } from '../../../../utils/constants';
import { AnomalyDetectorTrigger } from './AnomalyDetectorTrigger';
import { TRIGGER_TYPE } from '../CreateTrigger/utils/constants';
import { FieldArray } from 'formik';
import ConfigureActions from '../ConfigureActions';
import monitorToFormik from '../../../CreateMonitor/containers/CreateMonitor/utils/monitorToFormik';
import { buildSearchRequest } from '../../../CreateMonitor/containers/DefineMonitor/utils/searchRequests';
import { backendErrorNotification } from '../../../../utils/helpers';

const defaultRowProps = {
  label: 'Trigger name',
  // helpText: `Trigger names must be unique. Names can only contain letters, numbers, and special characters.`,
  style: { paddingLeft: '10px' },
  isInvalid,
  error: hasError,
};
const defaultInputProps = { isInvalid };

const selectFieldProps = {
  validate: () => {},
};

const selectRowProps = {
  label: 'Severity level',
  // helpText: `Severity levels help you organize your triggers and actions. A trigger with a high severity level might page a specific individual, whereas a trigger with a low severity level might email a list.`,
  style: { paddingLeft: '10px', marginTop: '0px' },
  isInvalid,
  error: hasError,
};
const severityOptions = [
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
  { value: '4', text: '4' },
  { value: '5', text: '5' },
];

const triggerOptions = [
  { value: TRIGGER_TYPE.AD, text: 'Anomaly detector grade and confidence' },
  { value: TRIGGER_TYPE.ALERT_TRIGGER, text: 'Extraction query response' },
];

const selectInputProps = {
  options: severityOptions,
};

const propTypes = {
  context: PropTypes.object.isRequired,
  executeResponse: PropTypes.object,
  monitorValues: PropTypes.object.isRequired,
  onRun: PropTypes.func.isRequired,
  setFlyout: PropTypes.func.isRequired,
  triggers: PropTypes.arrayOf(PropTypes.object).isRequired,
  triggerValues: PropTypes.object.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

const DEFAULT_TRIGGER_NAME = 'New trigger';

class DefineTrigger extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onRunExecute = (triggers = []) => {
    const { httpClient, monitor, notifications } = this.props;
    const formikValues = monitorToFormik(monitor);
    const searchType = formikValues.searchType;
    const monitorToExecute = _.cloneDeep(monitor);
    _.set(monitorToExecute, 'triggers', triggers);

    switch (searchType) {
      case SEARCH_TYPE.QUERY:
      case SEARCH_TYPE.GRAPH:
        const searchRequest = buildSearchRequest(formikValues);
        _.set(monitorToExecute, 'inputs[0].search', searchRequest);
        break;
      default:
        console.log(`Unsupported searchType found: ${JSON.stringify(searchType)}`, searchType);
    }

    httpClient
      .post('../api/alerting/monitors/_execute', { body: JSON.stringify(monitorToExecute) })
      .then((resp) => {
        if (resp.ok) {
          this.setState({ executeResponse: resp.resp });
        } else {
          // TODO: need a notification system to show errors or banners at top
          console.error('err:', resp);
          backendErrorNotification(notifications, 'run', 'trigger', resp.resp);
        }
      })
      .catch((err) => {
        console.log('err:', err);
      });
  };

  render() {
    const {
      edit,
      triggerArrayHelpers,
      context,
      monitorValues,
      onRun,
      setFlyout,
      triggers,
      triggerValues,
      isDarkMode,
      triggerIndex,
      httpClient,
      notifications,
    } = this.props;
    const executeResponse = _.get(this.state, 'executeResponse', this.props.executeResponse);
    const fieldPath = triggerIndex !== undefined ? `triggerDefinitions[${triggerIndex}].` : '';
    const isGraph = _.get(monitorValues, 'searchType') === SEARCH_TYPE.GRAPH;
    const isAd = _.get(monitorValues, 'searchType') === SEARCH_TYPE.AD;
    const detectorId = _.get(monitorValues, 'detectorId');
    const response = _.get(executeResponse, 'input_results.results[0]');
    const thresholdEnum = _.get(triggerValues, `${fieldPath}thresholdEnum`);
    const thresholdValue = _.get(triggerValues, `${fieldPath}thresholdValue`);
    const adTriggerType = _.get(triggerValues, `${fieldPath}anomalyDetector.triggerType`);
    const triggerName = _.get(triggerValues, `${fieldPath}name`, DEFAULT_TRIGGER_NAME);

    let triggerContent = (
      <TriggerQuery
        context={context}
        executeResponse={executeResponse}
        onRun={_.isEmpty(fieldPath) ? onRun : this.onRunExecute}
        setFlyout={setFlyout}
        triggerValues={triggerValues}
        isDarkMode={isDarkMode}
        fieldPath={fieldPath}
      />
    );
    if (isAd && adTriggerType === TRIGGER_TYPE.AD) {
      const adValues = _.get(triggerValues, `${fieldPath}anomalyDetector`);
      triggerContent = (
        <AnomalyDetectorTrigger detectorId={detectorId} adValues={adValues} fieldPath={fieldPath} />
      );
    }
    if (isGraph) {
      triggerContent = (
        <TriggerGraph
          monitorValues={monitorValues}
          response={response}
          thresholdEnum={thresholdEnum}
          thresholdValue={thresholdValue}
          fieldPath={fieldPath}
        />
      );
    }

    return (
      <EuiAccordion
        id={triggerName}
        buttonContent={
          <EuiTitle size={'s'}>
            <h1>{_.isEmpty(triggerName) ? DEFAULT_TRIGGER_NAME : triggerName}</h1>
          </EuiTitle>
        }
        initialIsOpen={edit ? false : triggerIndex === 0}
        extraAction={
          <EuiButton
            color={'danger'}
            onClick={() => {
              triggerArrayHelpers.remove(triggerIndex);
            }}
            size={'s'}
          >
            Remove trigger
          </EuiButton>
        }
      >
        <div style={{ padding: '0px 20px' }}>
          <FormikFieldText
            name={`${fieldPath}name`}
            fieldProps={{ validate: validateTriggerName(triggers, triggerValues, fieldPath) }}
            formRow
            rowProps={defaultRowProps}
            inputProps={defaultInputProps}
          />
          <EuiSpacer size={'m'} />
          <FormikSelect
            name={`${fieldPath}severity`}
            formRow
            fieldProps={selectFieldProps}
            rowProps={selectRowProps}
            inputProps={selectInputProps}
          />
          <EuiSpacer size={'m'} />
          {isAd ? (
            <div>
              <FormikSelect
                name={`${fieldPath}anomalyDetector.triggerType`}
                formRow
                rowProps={{
                  label: 'Trigger type',
                  helpText: 'Define type of trigger',
                  style: { paddingLeft: '10px', marginTop: '0px' },
                }}
                inputProps={{ options: triggerOptions }}
              />
              <EuiSpacer size={'m'} />
            </div>
          ) : null}
          {triggerContent}
          <EuiSpacer size={'l'} />
          <FieldArray name={`${fieldPath}actions`} validateOnChange={true}>
            {(arrayHelpers) => (
              <ConfigureActions
                arrayHelpers={arrayHelpers}
                context={context}
                httpClient={httpClient}
                setFlyout={setFlyout}
                values={triggerValues}
                notifications={notifications}
                fieldPath={fieldPath}
                triggerIndex={triggerIndex}
              />
            )}
          </FieldArray>
          <EuiSpacer />
        </div>
      </EuiAccordion>
    );
  }
}

DefineTrigger.propTypes = propTypes;

export default DefineTrigger;
