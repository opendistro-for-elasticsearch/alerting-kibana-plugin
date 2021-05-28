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
import PropTypes from 'prop-types';
import _ from 'lodash';
import { EuiAccordion, EuiButton } from '@elastic/eui';
import 'brace/mode/plain_text';
import { FormikFieldText, FormikSelect } from '../../../../components/FormControls';
import { isInvalid, hasError } from '../../../../utils/validate';
import ContentPanel from '../../../../components/ContentPanel/index';
import TriggerQuery from '../../components/TriggerQuery';
import TriggerGraph from '../../components/TriggerGraph';
import { validateTriggerName } from './utils/validation';
import { SEARCH_TYPE } from '../../../../utils/constants';
import { AnomalyDetectorTrigger } from './AnomalyDetectorTrigger';
import { TRIGGER_TYPE } from '../CreateTrigger/utils/constants';
import AddTriggerButton from '../../components/AddTriggerButton';
import TriggerEmptyPrompt from '../../components/TriggerEmptyPrompt';

const defaultRowProps = {
  label: 'Trigger name',
  helpText: `Trigger names must be unique. Names can only contain letters, numbers, and special characters.`,
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
  helpText: `Severity levels help you organize your triggers and actions. A trigger with a high severity level might page a specific individual, whereas a trigger with a low severity level might email a list.`,
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

const renderTriggerContents = (
  arrayHelpers,
  isTraditionalMonitor,
  context,
  executeResponse,
  monitorValues,
  onRun,
  setFlyout,
  triggers,
  triggerValues,
  isDarkMode,
  index
) => {
  const isGraph = _.get(monitorValues, 'searchType') === SEARCH_TYPE.GRAPH;
  const isAd = _.get(monitorValues, 'searchType') === SEARCH_TYPE.AD;
  const detectorId = _.get(monitorValues, 'detectorId');
  const response = _.get(executeResponse, 'input_results.results[0]');
  const error = _.get(executeResponse, 'error') || _.get(executeResponse, 'input_results.error');
  const thresholdEnum = isTraditionalMonitor
    ? triggerValues.thresholdEnum
    : triggerValues.triggerConditions[index].thresholdEnum;
  const thresholdValue = isTraditionalMonitor
    ? triggerValues.thresholdValue
    : triggerValues.triggerConditions[index].thresholdValue;
  const adValues = triggerValues.anomalyDetector;
  const adTriggerType = triggerValues.anomalyDetector.triggerType;

  let triggerContent = (
    <TriggerQuery
      context={context}
      error={error}
      executeResponse={executeResponse}
      onRun={onRun}
      response={response}
      setFlyout={setFlyout}
      triggerValues={triggerValues}
      isDarkMode={isDarkMode}
      index={index}
    />
  );
  if (isAd && adTriggerType === TRIGGER_TYPE.AD) {
    triggerContent = <AnomalyDetectorTrigger detectorId={detectorId} adValues={adValues} />;
  }
  if (isGraph) {
    triggerContent = (
      <TriggerGraph
        index={index}
        monitorValues={monitorValues}
        response={response}
        thresholdEnum={thresholdEnum}
        thresholdValue={thresholdValue}
      />
    );
  }

  return triggerContent;
};

const renderTriggerConditions = (
  arrayHelpers,
  isTraditionalMonitor,
  context,
  executeResponse,
  monitorValues,
  onRun,
  setFlyout,
  triggers,
  triggerValues,
  isDarkMode
) => {
  const hasTriggerConditions = !_.isEmpty(triggerValues.triggerConditions);

  return hasTriggerConditions ? (
    triggerValues.triggerConditions.map((trigCondition, index) => (
      <EuiAccordion
        key={`${index}`}
        id={`${index}`}
        initialIsOpen={hasTriggerConditions}
        className={'trigger-condition-accordion'}
        buttonContent={`Trigger condition ${index + 1}`}
        extraAction={
          <div style={{ paddingRight: '10px' }}>
            <EuiButton
              onClick={() => {
                arrayHelpers.remove(index);
              }}
            >
              Delete
            </EuiButton>
          </div>
        }
      >
        {renderTriggerContents(
          arrayHelpers,
          isTraditionalMonitor,
          context,
          executeResponse,
          monitorValues,
          onRun,
          setFlyout,
          triggers,
          triggerValues,
          isDarkMode,
          index
        )}
      </EuiAccordion>
    ))
  ) : (
    <TriggerEmptyPrompt arrayHelpers={arrayHelpers} />
  );
};

const DefineTrigger = ({
  arrayHelpers,
  monitor,
  context,
  executeResponse,
  monitorValues,
  onRun,
  setFlyout,
  triggers,
  triggerValues,
  isDarkMode,
}) => {
  const isAd = _.get(monitorValues, 'searchType') === SEARCH_TYPE.AD;
  const isTraditionalMonitor = _.get(monitor, 'monitor_type') === 'traditional_monitor';

  const triggerContents = isTraditionalMonitor
    ? renderTriggerContents(
        arrayHelpers,
        isTraditionalMonitor,
        context,
        executeResponse,
        monitorValues,
        onRun,
        setFlyout,
        triggers,
        triggerValues,
        isDarkMode
      )
    : renderTriggerConditions(
        arrayHelpers,
        isTraditionalMonitor,
        context,
        executeResponse,
        monitorValues,
        onRun,
        setFlyout,
        triggers,
        triggerValues,
        isDarkMode
      );

  return (
    <ContentPanel title="Define trigger" titleSize="s" bodyStyles={{ padding: 'initial' }}>
      <FormikFieldText
        name="name"
        fieldProps={{ validate: validateTriggerName(triggers, triggerValues) }}
        formRow
        rowProps={defaultRowProps}
        inputProps={defaultInputProps}
      />
      <FormikSelect
        name="severity"
        formRow
        fieldProps={selectFieldProps}
        rowProps={selectRowProps}
        inputProps={selectInputProps}
      />
      {isAd ? (
        <FormikSelect
          name="anomalyDetector.triggerType"
          formRow
          rowProps={{
            label: 'Trigger type',
            helpText: 'Define type of trigger',
            style: { paddingLeft: '10px', marginTop: '0px' },
          }}
          inputProps={{ options: triggerOptions }}
        />
      ) : null}
      {triggerContents}
      {!isTraditionalMonitor ? (
        <div style={{ paddingLeft: '10px' }}>
          <AddTriggerButton arrayHelpers={arrayHelpers} />
        </div>
      ) : null}
    </ContentPanel>
  );
};

DefineTrigger.propTypes = propTypes;

export default DefineTrigger;
