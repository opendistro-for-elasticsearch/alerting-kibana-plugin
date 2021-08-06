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
import { EuiAccordion, EuiButton, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import 'brace/mode/plain_text';
import { FormikFieldText, FormikSelect } from '../../../../components/FormControls';
import { isInvalid, hasError } from '../../../../utils/validate';
import { SEARCH_TYPE } from '../../../../utils/constants';
import { FORMIK_INITIAL_TRIGGER_CONDITION_VALUES } from '../CreateTrigger/utils/constants';
import AddTriggerConditionButton from '../../components/AddTriggerConditionButton';
import BucketLevelTriggerGraph from '../../components/BucketLevelTriggerGraph';
import BucketLevelTriggerQuery from '../../components/BucketLevelTriggerQuery';
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

class DefineBucketLevelTrigger extends Component {
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
    fieldPath,
    monitor,
    monitorValues,
    response,
    triggerValues
  ) => {
    const metricAggregations = _.keys(
      _.get(monitor, 'inputs[0].search.query.aggregations.composite_agg.aggs', [])
    ).map((metric) => {
      return { value: metric, text: metric };
    });
    if (!metricAggregations.includes(DEFAULT_METRIC_AGGREGATION)) {
      metricAggregations.push(DEFAULT_METRIC_AGGREGATION);
    }

    const triggerConditions = _.get(triggerValues, `${fieldPath}triggerConditions`, []);
    if (_.isEmpty(triggerConditions)) {
      arrayHelpers.push(_.cloneDeep(FORMIK_INITIAL_TRIGGER_CONDITION_VALUES));
    }

    return triggerConditions.map((triggerCondition, index) => (
      <BucketLevelTriggerGraph
        key={index}
        arrayHelpers={arrayHelpers}
        index={index}
        fieldPath={fieldPath}
        monitorValues={monitorValues}
        triggerValues={triggerValues}
        response={response}
        queryMetrics={metricAggregations}
      />
    ));
  };

  renderAggregationTriggerQuery = (
    context,
    executeResponse,
    onRun,
    setFlyout,
    triggerValues,
    isDarkMode,
    fieldPath
  ) => {
    return (
      <BucketLevelTriggerQuery
        context={context}
        executeResponse={executeResponse}
        onRun={onRun}
        setFlyout={setFlyout}
        triggerValues={triggerValues}
        isDarkMode={isDarkMode}
        fieldPath={fieldPath}
      />
    );
  };

  render() {
    const {
      edit,
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
    const fieldPath = triggerIndex !== undefined ? `triggerDefinitions[${triggerIndex}].` : '';
    const isGraph = _.get(monitorValues, 'searchType') === SEARCH_TYPE.GRAPH;
    const response = _.get(executeResponse, 'input_results.results[0]');
    const triggerName = _.get(triggerValues, `${fieldPath}name`, DEFAULT_TRIGGER_NAME);
    const disableAddTriggerConditionButton =
      _.get(triggerValues, `${fieldPath}triggerConditions`).length >= MAX_TRIGGER_CONDITIONS;

    const aggregationTriggerContent = isGraph ? (
      <div>
        <FieldArray name={`${fieldPath}triggerConditions`} validateOnChange={true}>
          {(conditionsArrayHelpers) => (
            <div>
              {this.renderAggregationTriggerGraph(
                conditionsArrayHelpers,
                fieldPath,
                monitor,
                monitorValues,
                response,
                triggerValues
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
        executeResponse,
        onRun,
        setFlyout,
        triggerValues,
        isDarkMode,
        fieldPath
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
        <div style={{ padding: '0px 10px' }}>
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

          {isGraph ? (
            <div>
              <EuiText style={{ paddingLeft: '0px' }}>
                <h4>Trigger conditions</h4>
              </EuiText>
              <EuiText color={'69707D'} size={'xs'} style={{ paddingLeft: '20px' }}>
                Specify thresholds for the metrics you have chosen in your query above.
              </EuiText>
            </div>
          ) : null}

          {aggregationTriggerContent}

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

DefineBucketLevelTrigger.propTypes = propTypes;

export default DefineBucketLevelTrigger;
