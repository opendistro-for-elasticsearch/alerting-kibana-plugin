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

import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Formik, FieldArray } from 'formik';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import 'brace/theme/github';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import ConfigureActions from '../../ConfigureActions';
import DefineTrigger from '../../DefineTrigger';
import monitorToFormik from '../../../../CreateMonitor/containers/CreateMonitor/utils/monitorToFormik';
import { buildSearchRequest } from '../../../../CreateMonitor/containers/DefineMonitor/utils/searchRequests';
import { formikToTrigger, formikToTriggerUiMetadata } from '../utils/formikToTrigger';
import { triggerToFormik } from '../utils/triggerToFormik';
import { FORMIK_INITIAL_TRIGGER_VALUES } from '../utils/constants';
import { SEARCH_TYPE } from '../../../../../utils/constants';
import { SubmitErrorHandler } from '../../../../../utils/SubmitErrorHandler';
import { backendErrorNotification } from '../../../../../utils/helpers';
import DefineBucketLevelTrigger from '../../DefineBucketLevelTrigger';
import { getPathsPerDataType } from '../../../../CreateMonitor/containers/DefineMonitor/utils/mappings';
import { MONITOR_TYPE } from '../../../../../utils/constants';

export const DEFAULT_CLOSED_STATES = {
  WHEN: false,
  OF_FIELD: false,
  THRESHOLD: false,
  OVER: false,
  FOR_THE_LAST: false,
  WHERE: false,
};

export default class CreateTrigger extends Component {
  constructor(props) {
    super(props);

    const useTriggerToFormik = this.props.edit && this.props.triggerToEdit;
    const initialValues = useTriggerToFormik
      ? triggerToFormik(this.props.triggerToEdit, this.props.monitor)
      : _.cloneDeep(FORMIK_INITIAL_TRIGGER_VALUES);

    this.state = {
      triggerResponse: null,
      executeResponse: null,
      initialValues,
      dataTypes: {},
      openedStates: DEFAULT_CLOSED_STATES,
      madeChanges: false,
    };
  }

  componentDidMount() {
    this.onRunExecute();
    this.onQueryMappings();
  }

  componentWillUnmount() {
    this.props.setFlyout(null);
  }

  onCreate = (trigger, triggerMetadata, { setSubmitting, setErrors }) => {
    const { monitor, updateMonitor, onCloseTrigger } = this.props;
    const { ui_metadata: uiMetadata, triggers } = monitor;
    const updatedTriggers = [trigger].concat(triggers);
    const updatedUiMetadata = {
      ...uiMetadata,
      triggers: { ...uiMetadata.triggers, ...triggerMetadata },
    };
    const actionKeywords = ['create', 'trigger'];
    updateMonitor({ triggers: updatedTriggers, ui_metadata: updatedUiMetadata }, actionKeywords)
      .then((res) => {
        setSubmitting(false);
        if (res.ok) {
          onCloseTrigger();
        }
      })
      .catch((err) => {
        console.error(err);
        setSubmitting(false);
        // TODO: setErrors
      });
  };

  onEdit = (trigger, triggerMetadata, { setSubmitting, setErrors }) => {
    const { monitor, updateMonitor, onCloseTrigger, triggerToEdit } = this.props;
    const { ui_metadata: uiMetadata = {}, triggers, monitor_type } = monitor;
    const { name } =
      monitor_type === MONITOR_TYPE.QUERY_LEVEL
        ? triggerToEdit.query_level_trigger
        : triggerToEdit.bucket_level_trigger;
    const updatedTriggersMetadata = _.cloneDeep(uiMetadata.triggers || {});
    delete updatedTriggersMetadata[name];
    const updatedUiMetadata = {
      ...uiMetadata,
      triggers: { ...updatedTriggersMetadata, ...triggerMetadata },
    };

    const findTriggerName = (element) => {
      return monitor_type === MONITOR_TYPE.QUERY_LEVEL
        ? name === element.query_level_trigger.name
        : name === element.bucket_level_trigger.name;
    };

    const indexToUpdate = _.findIndex(triggers, findTriggerName);
    const updatedTriggers = triggers.slice();
    updatedTriggers.splice(indexToUpdate, 1, trigger);
    const actionKeywords = ['update', 'trigger'];
    updateMonitor({ triggers: updatedTriggers, ui_metadata: updatedUiMetadata }, actionKeywords)
      .then((res) => {
        setSubmitting(false);
        if (res.ok) {
          onCloseTrigger();
        }
      })
      .catch((err) => {
        console.error(err);
        setSubmitting(false);
        // TODO: setErrors
      });
  };

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

  renderSuccessCallOut = () => {
    const { monitor, showSuccessCallOut, onCloseTrigger } = this.props;
    if (showSuccessCallOut) {
      return (
        <Fragment>
          <EuiCallOut
            title={
              <span>
                Monitor <strong>{monitor.name}</strong> has been created. Add a trigger to this
                monitor or{' '}
                {
                  <EuiLink style={{ textDecoration: 'underline' }} onClick={onCloseTrigger}>
                    cancel
                  </EuiLink>
                }{' '}
                to view monitor.
              </span>
            }
            color="success"
            iconType="alert"
            size="s"
          />
          <EuiSpacer size="s" />
        </Fragment>
      );
    }
    return null;
  };

  onSubmit = (values, formikBag) => {
    const monitorUiMetadata = _.get(this.props.monitor, 'ui_metadata', {});
    const trigger = formikToTrigger(values, monitorUiMetadata);
    const triggerMetadata = formikToTriggerUiMetadata(values, monitorUiMetadata);
    if (this.props.edit) this.onEdit(trigger, triggerMetadata, formikBag);
    else this.onCreate(trigger, triggerMetadata, formikBag);
  };

  getTriggerContext = (executeResponse, monitor, values) => ({
    periodStart: moment.utc(_.get(executeResponse, 'period_start', Date.now())).format(),
    periodEnd: moment.utc(_.get(executeResponse, 'period_end', Date.now())).format(),
    results: [_.get(executeResponse, 'input_results.results[0]')].filter((result) => !!result),
    trigger: formikToTrigger(values, _.get(this.props.monitor, 'ui_metadata', {})),
    alert: null,
    error: null,
    monitor: monitor,
  });

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

      // TODO: Re-enable once we have implementation to support
      //  rendering visual graphs for bucket-level triggers.
      // this.props.onRunQuery();

      this.setState({ madeChanges: false });
    }
    this.setState({ openedStates: { ...openedStates, [expression]: false } });
  };

  onMadeChanges = () => {
    this.setState({ madeChanges: true });
  };

  getExpressionProps = () => ({
    openedStates: this.state.openedStates,
    closeExpression: this.closeExpression,
    openExpression: this.openExpression,
    onMadeChanges: this.onMadeChanges,
  });

  async queryMappings(index) {
    if (!index.length) {
      return {};
    }

    try {
      const response = await this.props.httpClient.post('../api/alerting/_mappings', {
        body: JSON.stringify({ index }),
      });
      if (response.ok) {
        return response.resp;
      }
      return {};
    } catch (err) {
      throw err;
    }
  }

  async onQueryMappings() {
    const indices = this.props.monitor.inputs[0].search.indices;
    try {
      const mappings = await this.queryMappings(indices);
      const dataTypes = getPathsPerDataType(mappings);
      this.setState({ dataTypes });
    } catch (err) {
      console.error('There was an error getting mappings for query', err);
    }
  }

  render() {
    const { monitor, onCloseTrigger, setFlyout, edit, httpClient, notifications } = this.props;
    const { dataTypes, initialValues, executeResponse } = this.state;
    const isQueryLevelMonitor = _.get(monitor, 'monitor_type') === MONITOR_TYPE.QUERY_LEVEL;

    return (
      <div style={{ padding: '25px 50px' }}>
        {this.renderSuccessCallOut()}
        <Formik initialValues={initialValues} onSubmit={this.onSubmit} validateOnChange={false}>
          {({ values, handleSubmit, isSubmitting, errors, isValid }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{edit ? 'Edit' : 'Create'} trigger</h1>
              </EuiTitle>
              <EuiSpacer />
              {isQueryLevelMonitor ? (
                <DefineTrigger
                  context={this.getTriggerContext(executeResponse, monitor, values)}
                  executeResponse={executeResponse}
                  monitorValues={monitorToFormik(monitor)}
                  onRun={this.onRunExecute}
                  setFlyout={setFlyout}
                  triggers={monitor.triggers}
                  triggerValues={values}
                  isDarkMode={this.props.isDarkMode}
                />
              ) : (
                <FieldArray name={'triggerConditions'} validateOnChange={true}>
                  {(arrayHelpers) => (
                    <DefineBucketLevelTrigger
                      arrayHelpers={arrayHelpers}
                      context={this.getTriggerContext(executeResponse, monitor, values)}
                      executeResponse={executeResponse}
                      monitor={monitor}
                      monitorValues={monitorToFormik(monitor)}
                      onRun={this.onRunExecute}
                      setFlyout={setFlyout}
                      triggers={monitor.triggers}
                      triggerValues={values}
                      isDarkMode={this.props.isDarkMode}
                      openedStates={this.state.openedStates}
                      closeExpression={this.closeExpression}
                      openExpression={this.openExpression}
                      onMadeChanges={this.onMadeChanges}
                      dataTypes={dataTypes}
                    />
                  )}
                </FieldArray>
              )}
              <EuiSpacer />
              <FieldArray name="actions" validateOnChange={true}>
                {(arrayHelpers) => (
                  <ConfigureActions
                    arrayHelpers={arrayHelpers}
                    context={this.getTriggerContext(executeResponse, monitor, values)}
                    httpClient={httpClient}
                    setFlyout={setFlyout}
                    values={values}
                    notifications={notifications}
                  />
                )}
              </FieldArray>
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={onCloseTrigger}>Cancel</EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton onClick={handleSubmit} isLoading={isSubmitting} fill>
                    {edit ? 'Update' : 'Create'}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
              <SubmitErrorHandler
                errors={errors}
                isSubmitting={isSubmitting}
                isValid={isValid}
                onSubmitError={() =>
                  this.props.notifications.toasts.addDanger({
                    title: `Failed to ${edit ? 'update' : 'create'} the trigger`,
                    text: 'Fix all highlighted error(s) before continuing.',
                  })
                }
              />
            </Fragment>
          )}
        </Formik>
      </div>
    );
  }
}
