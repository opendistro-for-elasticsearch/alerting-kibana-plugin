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
import {
  EuiAccordion,
  EuiButton,
  EuiHorizontalRule,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import 'brace/mode/plain_text';
import { FormikFieldText, FormikSelect } from '../../../../components/FormControls';
import { isInvalid, hasError } from '../../../../utils/validate';
import { SEARCH_TYPE } from '../../../../utils/constants';
import {
  FORMIK_INITIAL_TRIGGER_CONDITION_VALUES,
  TRIGGER_TYPE,
} from '../CreateTrigger/utils/constants';
import AddTriggerConditionButton from '../../components/AddTriggerConditionButton';
import AggregationTriggerGraph from '../../components/AggregationTriggerGraph';
import AggregationTriggerQuery from '../../components/AggregationTriggerQuery';
import { validateTriggerName } from '../DefineTrigger/utils/validation';
import WhereExpression from '../../../CreateMonitor/components/MonitorExpressions/expressions/WhereExpression';
import { FieldArray } from 'formik';
import ConfigureActions from '../ConfigureActions';

const defaultRowProps = {
  label: 'Trigger name',
  // helpText: `Trigger names must be unique. Names can only contain letters, numbers, and special characters.`,
  style: { paddingLeft: '20px', paddingTop: '10px' },
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
  style: { paddingLeft: '20px' },
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

const DEFAULT_TRIGGER_NAME = 'Define trigger';
const MAX_TRIGGER_CONDITIONS = 5;
const MAX_WHERE_FILTERS = 1;

export const DEFAULT_METRIC_AGGREGATION = { value: '_count', text: 'Count of documents' };
export const DEFAULT_AND_OR_CONDITION = 'AND';

export const TRIGGER_OPERATORS_MAP = {
  INCLUDE: 'include',
  EXCLUDE: 'exclude',
};

export const TRIGGER_COMPARISON_OPERATORS = [
  {
    text: 'includes',
    value: TRIGGER_OPERATORS_MAP.INCLUDE,
    dataTypes: ['number', 'text', 'keyword', 'boolean'],
  },
  {
    text: 'excludes',
    value: TRIGGER_OPERATORS_MAP.EXCLUDE,
    dataTypes: ['number', 'text', 'keyword', 'boolean'],
  },
];

export const DEFAULT_CLOSED_STATES = {
  WHEN: false,
  OF_FIELD: false,
  THRESHOLD: false,
  OVER: false,
  FOR_THE_LAST: false,
  WHERE: false,
};

class DefineAggregationTrigger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openedStates: DEFAULT_CLOSED_STATES,
      madeChanges: false,
    };
  }

  openExpression = (expression) => {
    this.setState({
      openedStates: {
        ...DEFAULT_CLOSED_STATES,
        [expression]: true,
      },
    });
  };

  closeExpression = (expression) => {
    const { madeChanges, openedStates } = this.state;
    if (madeChanges && openedStates[expression]) {
      // if made changes and close expression that was currently open => run query

      // TODO: Re-enabled when support for rendering visual graph previews is implemented.
      // this.props.onRunQuery();
      this.setState({ madeChanges: false });
    }
    this.setState({ openedStates: { ...openedStates, [expression]: false } });
  };

  onMadeChanges = () => {
    this.setState({ madeChanges: true });
  };

  renderWhereExpression = (dataTypes, monitor, fieldPath) => {
    const compositeAggregations = _.get(
      monitor,
      'inputs[0].search.query.aggregations.composite_agg.composite.sources',
      []
    ).flatMap((entry) => _.keys(entry));
    return (
      <div>
        <WhereExpression
          openedStates={this.state.openedStates}
          closeExpression={this.closeExpression}
          openExpression={this.openExpression}
          onMadeChanges={this.onMadeChanges}
          dataTypes={dataTypes}
          indexFieldFilters={compositeAggregations}
          useTriggerFieldOperators={true}
          fieldPath={fieldPath}
        />
      </div>
    );
  };

  renderAggregationTriggerGraph = (
    arrayHelpers,
    monitor,
    monitorValues,
    response,
    triggerValues,
    triggerIndex
  ) => {
    const metricAggregations = _.keys(
      _.get(monitor, 'inputs[0].search.query.aggregations.composite_agg.aggregations', [])
    ).map((metric) => {
      return { value: metric, text: metric };
    });
    if (!metricAggregations.includes(DEFAULT_METRIC_AGGREGATION))
      metricAggregations.push(DEFAULT_METRIC_AGGREGATION);

    if (_.isEmpty(triggerValues.aggregationTriggers[triggerIndex].triggerConditions)) {
      arrayHelpers.push(_.cloneDeep(FORMIK_INITIAL_TRIGGER_CONDITION_VALUES));
    }

    return triggerValues.aggregationTriggers[
      triggerIndex
    ].triggerConditions.map((triggerCondition, index) => (
      <AggregationTriggerGraph
        key={index}
        arrayHelpers={arrayHelpers}
        index={index}
        triggerIndex={triggerIndex}
        monitorValues={monitorValues}
        triggerValues={triggerValues}
        response={response}
        queryMetrics={metricAggregations}
      />
    ));
  };

  renderAggregationTriggerQuery = (
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

  render() {
    const {
      triggerArrayHelpers,
      context,
      executeResponse,
      monitor,
      monitorValues,
      onRun,
      setFlyout,
      triggers,
      triggerValues,
      isDarkMode,
      dataTypes,
      triggerIndex,
      httpClient,
      notifications,
    } = this.props;
    const fieldPath = `aggregationTriggers[${triggerIndex}]`;
    const isGraph = _.get(monitorValues, 'searchType') === SEARCH_TYPE.GRAPH;
    const response = _.get(executeResponse, 'input_results.results[0]');
    const error = _.get(executeResponse, 'error') || _.get(executeResponse, 'input_results.error');
    const triggerName = _.get(triggerValues, `${fieldPath}.name`, DEFAULT_TRIGGER_NAME);
    const disableAddTriggerConditionButton =
      _.get(triggerValues, `${fieldPath}.triggerConditions`).length >= MAX_TRIGGER_CONDITIONS;

    const aggregationTriggerContent = isGraph ? (
      <div>
        <FieldArray name={`${fieldPath}.triggerConditions`} validateOnChange={true}>
          {(conditionsArrayHelpers) => (
            <div>
              {this.renderAggregationTriggerGraph(
                conditionsArrayHelpers,
                monitor,
                monitorValues,
                response,
                triggerValues,
                triggerIndex
              )}
              <div style={{ paddingLeft: '15px' }}>
                <AddTriggerConditionButton
                  arrayHelpers={conditionsArrayHelpers}
                  disabled={disableAddTriggerConditionButton}
                />
              </div>
            </div>
          )}
        </FieldArray>
        <EuiSpacer size={'m'} />
        <div style={{ paddingLeft: '20px' }}>
          {this.renderWhereExpression(dataTypes, monitor, fieldPath)}
        </div>
      </div>
    ) : (
      this.renderAggregationTriggerQuery(
        context,
        error,
        executeResponse,
        onRun,
        response,
        setFlyout,
        triggerValues,
        isDarkMode
      )
    );

    return (
      <EuiAccordion
        id={triggerName}
        buttonContent={
          <EuiTitle size={'s'}>
            <h1>{_.isEmpty(triggerName) ? DEFAULT_TRIGGER_NAME : triggerName}</h1>
          </EuiTitle>
        }
        extraAction={
          <EuiButton
            color={'danger'}
            onClick={() => {
              triggerArrayHelpers.remove(triggerIndex);
            }}
          >
            Delete
          </EuiButton>
        }
      >
        <EuiHorizontalRule margin="s" />
        <FormikFieldText
          name={`${fieldPath}.name`}
          fieldProps={{ validate: validateTriggerName(triggers, triggerValues, fieldPath) }}
          formRow
          rowProps={defaultRowProps}
          inputProps={defaultInputProps}
        />
        <EuiSpacer size={'m'} />
        <FormikSelect
          name={`${fieldPath}.severity`}
          formRow
          fieldProps={selectFieldProps}
          rowProps={selectRowProps}
          inputProps={selectInputProps}
        />
        <EuiSpacer size={'m'} />
        <EuiText style={{ paddingLeft: '20px' }}>
          <h3>Trigger Conditions</h3>
        </EuiText>
        {aggregationTriggerContent}
        <EuiSpacer size={'l'} />
        <FieldArray name={`${fieldPath}.actions`} validateOnChange={true}>
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
      </EuiAccordion>
    );
  }
}

DefineAggregationTrigger.propTypes = propTypes;

export default DefineAggregationTrigger;
