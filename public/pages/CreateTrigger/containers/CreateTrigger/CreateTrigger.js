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

import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import chrome from 'ui/chrome';
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
import ConfigureActions from '../ConfigureActions';
import DefineTrigger from '../DefineTrigger';
import monitorToFormik from '../../../CreateMonitor/containers/CreateMonitor/utils/monitorToFormik';
import { buildSearchRequest } from '../../../CreateMonitor/containers/DefineMonitor/utils/searchRequests';
import { formikToTrigger, formikToThresholds } from './utils/formikToTrigger';
import { triggerToFormik } from './utils/triggerToFormik';
import { FORMIK_INITIAL_VALUES } from './utils/constants';

export default class CreateTrigger extends Component {
  constructor(props) {
    super(props);

    const useTriggerToFormik = this.props.edit && this.props.triggerToEdit;
    const initialValues = useTriggerToFormik
      ? triggerToFormik(this.props.triggerToEdit, this.props.monitor)
      : _.cloneDeep(FORMIK_INITIAL_VALUES);

    this.state = {
      triggerResponse: null,
      executeResponse: null,
      initialValues,
    };
    this.isDarkMode = chrome.getUiSettingsClient().get('theme:darkMode') || false;
  }

  componentDidMount() {
    this.onRunExecute();
  }

  componentWillUnmount() {
    this.props.setFlyout(null);
  }

  onCreate = (trigger, thresholds, { setSubmitting, setErrors }) => {
    const { monitor, updateMonitor, onCloseTrigger } = this.props;
    const { ui_metadata: uiMetadata, triggers } = monitor;
    const updatedTriggers = [trigger].concat(triggers);
    const updatedUiMetadata = {
      ...uiMetadata,
      thresholds: { ...uiMetadata.thresholds, ...thresholds },
    };
    updateMonitor({ triggers: updatedTriggers, ui_metadata: updatedUiMetadata })
      .then(res => {
        setSubmitting(false);
        if (res.data.ok) {
          onCloseTrigger();
        }
      })
      .catch(err => {
        console.error(err);
        setSubmitting(false);
        // TODO: setErrors
      });
  };

  onEdit = (trigger, thresholds, { setSubmitting, setErrors }) => {
    const { monitor, updateMonitor, onCloseTrigger, triggerToEdit } = this.props;
    const { ui_metadata: uiMetadata = {}, triggers } = monitor;
    const { name } = triggerToEdit;
    const updatedThresholds = _.cloneDeep(uiMetadata.thresholds || {});
    delete updatedThresholds[name];
    const updatedUiMetadata = {
      ...uiMetadata,
      thresholds: { ...updatedThresholds, ...thresholds },
    };
    const indexToUpdate = _.findIndex(triggers, { name });
    const updatedTriggers = triggers.slice();
    updatedTriggers.splice(indexToUpdate, 1, trigger);
    updateMonitor({ triggers: updatedTriggers, ui_metadata: updatedUiMetadata })
      .then(res => {
        setSubmitting(false);
        if (res.data.ok) {
          onCloseTrigger();
        }
      })
      .catch(err => {
        console.error(err);
        setSubmitting(false);
        // TODO: setErrors
      });
  };

  onRunExecute = (triggers = []) => {
    const { httpClient, monitor } = this.props;
    const formikValues = monitorToFormik(monitor);
    const monitorToExecute = _.cloneDeep(monitor);
    const searchRequest = buildSearchRequest(formikValues);
    _.set(monitorToExecute, 'triggers', triggers);
    _.set(monitorToExecute, 'inputs[0].search', searchRequest);
    httpClient
      .post('../api/alerting/monitors/_execute', monitorToExecute)
      .then(resp => {
        if (resp.data.ok) {
          this.setState({ executeResponse: resp.data.resp });
        } else {
          // TODO: need a notification system to show errors or banners at top
          console.error('err:', resp);
        }
      })
      .catch(err => {
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
    const thresholds = formikToThresholds(values);
    if (this.props.edit) this.onEdit(trigger, thresholds, formikBag);
    else this.onCreate(trigger, thresholds, formikBag);
  };

  getTriggerContext = (executeResponse, monitor, values) => ({
    periodStart: moment.utc(_.get(executeResponse, 'period_start', Date.now())).format(),
    periodEnd: moment.utc(_.get(executeResponse, 'period_end', Date.now())).format(),
    results: [_.get(executeResponse, 'input_results.results[0]')].filter(result => !!result),
    trigger: formikToTrigger(values, _.get(this.props.monitor, 'ui_metadata', {})),
    alert: null,
    error: null,
    monitor: monitor,
  });

  render() {
    const { monitor, onCloseTrigger, setFlyout, edit, httpClient } = this.props;
    const { initialValues, executeResponse } = this.state;
    return (
      <div style={{ padding: '25px 50px' }}>
        {this.renderSuccessCallOut()}
        <Formik
          initialValues={initialValues}
          onSubmit={this.onSubmit}
          validateOnChange={false}
          render={({ values, handleSubmit, isSubmitting }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{edit ? 'Edit' : 'Create'} trigger</h1>
              </EuiTitle>
              <EuiSpacer />
              <DefineTrigger
                context={this.getTriggerContext(executeResponse, monitor, values)}
                executeResponse={executeResponse}
                monitorValues={monitorToFormik(monitor)}
                onRun={this.onRunExecute}
                setFlyout={setFlyout}
                triggers={monitor.triggers}
                triggerValues={values}
                isDarkMode={this.isDarkMode}
              />
              <EuiSpacer />
              <FieldArray
                name="actions"
                validateOnChange={true}
                render={arrayHelpers => (
                  <ConfigureActions
                    arrayHelpers={arrayHelpers}
                    context={this.getTriggerContext(executeResponse, monitor, values)}
                    httpClient={httpClient}
                    setFlyout={setFlyout}
                    values={values}
                  />
                )}
              />
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
            </Fragment>
          )}
        />
      </div>
    );
  }
}
