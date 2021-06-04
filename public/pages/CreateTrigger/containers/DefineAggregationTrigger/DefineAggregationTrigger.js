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

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { EuiAccordion, EuiButton, EuiSpacer } from '@elastic/eui';
import 'brace/mode/plain_text';
import { FormikFieldText, FormikSelect } from '../../../../components/FormControls';
import { isInvalid, hasError } from '../../../../utils/validate';
import ContentPanel from '../../../../components/ContentPanel/index';
import { SEARCH_TYPE } from '../../../../utils/constants';
import { TRIGGER_TYPE } from '../CreateTrigger/utils/constants';
import AddTriggerButton from '../../components/AddTriggerButton';
import TriggerEmptyPrompt from '../../components/TriggerEmptyPrompt';
import AggregationTriggerGraph from '../../components/AggregationTriggerGraph';
import AggregationTriggerQuery from '../../components/AggregationTriggerQuery';
import { validateTriggerName } from '../DefineTrigger/utils/validation';
import WhereExpression from '../../../CreateMonitor/components/MonitorExpressions/expressions/WhereExpression';

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

const triggerOptions = [{ value: TRIGGER_TYPE.ALERT_TRIGGER, text: 'Extraction query response' }];

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

const MAX_TRIGGER_CONDITIONS = 5;

const MAX_WHERE_FILTERS = 1;

const renderWhereExpression = (
  openedStates,
  closeExpression,
  openExpression,
  onMadeChanges,
  dataTypes
) => {
  return (
    <WhereExpression
      openedStates={openedStates}
      closeExpression={closeExpression}
      openExpression={openExpression}
      onMadeChanges={onMadeChanges}
      dataTypes={dataTypes}
    />
  );
};

const renderAggregationTriggerGraph = (index, monitor, monitorValues, response, triggerValues) => {
  const andOrCondition = triggerValues.triggerConditions[index].andOrCondition;
  const queryMetric = triggerValues.triggerConditions[index].queryMetric;
  const thresholdEnum = triggerValues.triggerConditions[index].thresholdEnum;
  const thresholdValue = triggerValues.triggerConditions[index].thresholdValue;

  const metricAggregations = _.keys(
    _.get(monitor, 'inputs[0].search.query.aggregations.composite_agg.aggregations', [])
  ).map((metric) => {
    return { value: metric, text: metric };
  });
  // TODO: Something like this needs to be passed into the WHERE of the Aggregation Trigger definition
  // const compositeAggregations = _.get(
  //   monitor,
  //   'inputs[0].search.query.aggregations.composite_agg.composite.sources',
  //   []
  // ).flatMap((entry) => _.keys(entry));

  return (
    <AggregationTriggerGraph
      index={index}
      andOrCondition={andOrCondition}
      monitorValues={monitorValues}
      response={response}
      queryMetric={queryMetric}
      queryMetrics={metricAggregations}
      thresholdEnum={thresholdEnum}
      thresholdValue={thresholdValue}
    />
  );
};

const renderAggregationTriggerQuery = (
  index,
  context,
  error,
  executeResponse,
  onRun,
  response,
  setFlyout,
  triggerValues,
  isDarkMode
) => {
  return (
    <AggregationTriggerQuery
      index={index}
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
};

const DefineAggregationTrigger = ({
  arrayHelpers,
  context,
  executeResponse,
  monitor,
  monitorValues,
  onRun,
  setFlyout,
  triggers,
  triggerValues,
  isDarkMode,
  openedStates,
  closeExpression,
  openExpression,
  onMadeChanges,
  dataTypes,
}) => {
  const isGraph = _.get(monitorValues, 'searchType') === SEARCH_TYPE.GRAPH;
  const response = _.get(executeResponse, 'input_results.results[0]');
  const error = _.get(executeResponse, 'error') || _.get(executeResponse, 'input_results.error');

  const hasTriggerConditions = !_.isEmpty(triggerValues.triggerConditions);

  let aggregationTriggerContent = hasTriggerConditions ? (
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
        {isGraph
          ? renderAggregationTriggerGraph(index, monitor, monitorValues, response, triggerValues)
          : renderAggregationTriggerQuery(
              index,
              context,
              error,
              executeResponse,
              onRun,
              response,
              setFlyout,
              triggerValues,
              isDarkMode
            )}
      </EuiAccordion>
    ))
  ) : (
    <TriggerEmptyPrompt arrayHelpers={arrayHelpers} />
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
      {aggregationTriggerContent}
      {isGraph ? (
        <div style={{ paddingLeft: '10px' }}>
          <AddTriggerButton
            arrayHelpers={arrayHelpers}
            disabled={triggerValues.triggerConditions.length >= MAX_TRIGGER_CONDITIONS}
          />
          {/*<EuiSpacer />*/}
          {/*// TODO: Implement WHERE filter logic*/}
          {/*{renderWhereExpression(*/}
          {/*    openedStates,*/}
          {/*    closeExpression,*/}
          {/*    openExpression,*/}
          {/*    onMadeChanges,*/}
          {/*    dataTypes*/}
          {/*)}*/}
        </div>
      ) : null}
    </ContentPanel>
  );
};

DefineAggregationTrigger.propTypes = propTypes;

export default DefineAggregationTrigger;
