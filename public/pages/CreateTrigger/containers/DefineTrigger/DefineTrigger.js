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

const defaultRowProps = {
  label: 'Trigger name',
  helpText: `Trigger names must be unique. Names can only contain letters, numbers, and special characters.`,
  style: { paddingLeft: '10px' },
  isInvalid,
  error: hasError,
};
const defaultInputProps = { isInvalid };

const selectFieldProps = { validate: () => {} };
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

const DefineTrigger = ({
  context,
  executeResponse,
  monitorValues,
  onRun,
  setFlyout,
  triggers,
  triggerValues,
  isDarkMode,
}) => {
  const isGraph = _.get(monitorValues, 'searchType') === SEARCH_TYPE.GRAPH;
  const isAd = _.get(monitorValues, 'searchType') === SEARCH_TYPE.AD;
  const detectorId = _.get(monitorValues, 'detectorId');
  const response = _.get(executeResponse, 'input_results.results[0]');
  const error = _.get(executeResponse, 'error') || _.get(executeResponse, 'input_results.error');
  const thresholdEnum = triggerValues.thresholdEnum;
  const thresholdValue = triggerValues.thresholdValue;
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
    />
  );
  if (isAd && adTriggerType === TRIGGER_TYPE.AD) {
    triggerContent = (
      <AnomalyDetectorTrigger detectorId={detectorId} adValues={triggerValues.anomalyDetector} />
    );
  }
  if (isGraph) {
    triggerContent = (
      <TriggerGraph
        monitorValues={monitorValues}
        response={response}
        thresholdEnum={thresholdEnum}
        thresholdValue={thresholdValue}
      />
    );
  }

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
      {triggerContent}
    </ContentPanel>
  );
};

DefineTrigger.propTypes = propTypes;

export default DefineTrigger;
