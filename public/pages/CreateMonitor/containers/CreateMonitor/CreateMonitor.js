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
import queryString from 'query-string';
import { FieldArray, Formik } from 'formik';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';

import DefineMonitor from '../DefineMonitor';
import { FORMIK_INITIAL_VALUES } from './utils/constants';
import monitorToFormik from './utils/monitorToFormik';
import { formikToMonitor } from './utils/formikToMonitor';
import { MONITOR_TYPE, SEARCH_TYPE } from '../../../../utils/constants';
import { initializeFromQueryParams } from './utils/monitorQueryParams';
import { SubmitErrorHandler } from '../../../../utils/SubmitErrorHandler';
import { backendErrorNotification } from '../../../../utils/helpers';
import MonitorDetails from '../MonitorDetails';
import ConfigureTriggers from '../../../CreateTrigger/containers/ConfigureTriggers';
import {
  formikToTrigger,
  formikToTriggerUiMetadata,
} from '../../../CreateTrigger/containers/CreateTrigger/utils/formikToTrigger';
import { triggerToFormik } from '../../../CreateTrigger/containers/CreateTrigger/utils/triggerToFormik';
import { TRIGGER_TYPE } from '../../../CreateTrigger/containers/CreateTrigger/utils/constants';

export default class CreateMonitor extends Component {
  static defaultProps = {
    edit: false,
    monitorToEdit: null,
    detectorId: null,
    updateMonitor: () => {},
  };

  constructor(props) {
    super(props);

    //pre-populate some of values if query params exists.
    let initialValues = _.mergeWith(
      {},
      _.cloneDeep(FORMIK_INITIAL_VALUES),
      initializeFromQueryParams(queryString.parse(this.props.location.search)),
      (initialValue, queryValue) => (_.isEmpty(queryValue) ? initialValue : queryValue)
    );

    this.state = {
      plugins: [],
      response: null,
      performanceResponse: null,
    };

    if (this.props.edit && this.props.monitorToEdit) {
      const triggers = triggerToFormik(
        _.get(this.props.monitorToEdit, 'triggers', []),
        this.props.monitorToEdit
      );
      _.set(this.state, 'triggerToEdit', triggers);
      initialValues = {
        ...monitorToFormik(this.props.monitorToEdit),
        triggerDefinitions: triggers.triggerDefinitions,
      };
    }

    _.set(this.state, 'initialValues', initialValues);

    this.onCancel = this.onCancel.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.getPlugins = this.getPlugins.bind(this);
  }

  componentDidMount() {
    this.getPlugins();
  }

  async getPlugins() {
    const { httpClient } = this.props;
    try {
      const pluginsResponse = await httpClient.get('../api/alerting/_plugins');
      if (pluginsResponse.ok) {
        this.setState({ plugins: pluginsResponse.resp.map((plugin) => plugin.component) });
      } else {
        console.error('There was a problem getting plugins list');
      }
    } catch (e) {
      console.error('There was a problem getting plugins list', e);
    }
  }

  resetResponse() {
    this.setState({ response: null, performanceResponse: null });
  }

  onCancel() {
    if (this.props.edit) this.props.history.goBack();
    else this.props.history.push('/monitors');
  }

  async onCreate(monitor, { setSubmitting, setErrors }) {
    const { httpClient, notifications } = this.props;
    try {
      const resp = await httpClient.post('../api/alerting/monitors', {
        body: JSON.stringify(monitor),
      });
      setSubmitting(false);
      const {
        ok,
        resp: { _id },
      } = resp;
      if (ok) {
        this.props.history.push(`/monitors/${_id}`);
      } else {
        console.log('Failed to create:', resp);
        backendErrorNotification(notifications, 'create', 'monitor', resp.resp);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      // TODO: setErrors
    }
  }

  prepareTriggers = (trigger, triggerMetadata, monitor) => {
    const { edit } = this.props;
    const { ui_metadata: uiMetadata = {}, triggers, monitor_type } = monitor;

    let updatedTriggers;
    let updatedUiMetadata;

    if (edit) {
      updatedTriggers = _.isArray(trigger) ? trigger.concat(triggers) : [trigger].concat(triggers);
      updatedUiMetadata = {
        ...uiMetadata,
        triggers: { ...uiMetadata.triggers, ...triggerMetadata },
      };
    } else {
      const { triggerToEdit = [] } = this.state;

      let updatedTriggersMetadata = _.cloneDeep(uiMetadata.triggers || {});

      let triggerType;
      switch (monitor_type) {
        case MONITOR_TYPE.QUERY_LEVEL:
          triggerType = TRIGGER_TYPE.QUERY_LEVEL;
          break;
        case MONITOR_TYPE.BUCKET_LEVEL:
          triggerType = TRIGGER_TYPE.BUCKET_LEVEL;
          break;
      }

      if (_.isArray(triggerToEdit)) {
        const names = triggerToEdit.map((entry) => _.get(entry, `${triggerType}.name`));
        names.forEach((name) => delete updatedTriggersMetadata[name]);
        updatedTriggers = _.cloneDeep(trigger);
      } else {
        const { name } = _.get(triggerToEdit, `${triggerType}`);
        delete updatedTriggersMetadata[name];

        const findTriggerName = (element) => {
          return name === _.get(element, `${triggerType}.name`);
        };

        const indexToUpdate = _.findIndex(triggers, findTriggerName);
        updatedTriggers = triggers.slice();
        updatedTriggers.splice(indexToUpdate, 1, trigger);
      }

      updatedUiMetadata = {
        ...uiMetadata,
        triggers: { ...updatedTriggersMetadata, ...triggerMetadata },
      };
    }

    return { triggers: updatedTriggers, ui_metadata: updatedUiMetadata };
  };

  async onUpdate(monitor, { setSubmitting, setErrors }) {
    const { updateMonitor } = this.props;
    const updatedMonitor = _.cloneDeep(monitor);
    try {
      const resp = await updateMonitor(updatedMonitor);
      setSubmitting(false);
      const { ok, id } = resp;
      if (ok) {
        this.props.history.push(`/monitors/${id}`);
      } else {
        console.log('Failed to update:', resp);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      // TODO: setErrors
    }
  }

  onSubmit(values, formikBag) {
    const { edit } = this.props;
    let monitor = formikToMonitor(values);

    if (!_.isEmpty(_.get(values, 'triggerDefinitions'))) {
      const monitorUiMetadata = _.get(monitor, 'ui_metadata', {});
      const triggerMetadata = formikToTriggerUiMetadata(values, monitorUiMetadata);
      const triggers = this.prepareTriggers(
        formikToTrigger(values, monitorUiMetadata),
        triggerMetadata,
        monitor
      );
      monitor = { ...monitor, ...triggers };
    }

    if (edit) this.onUpdate(monitor, formikBag);
    else this.onCreate(monitor, formikBag);
  }

  onCloseTrigger = () => {
    this.props.history.push({ ...this.props.location, search: '' });
  };

  componentWillUnmount() {
    this.props.setFlyout(null);
  }

  render() {
    const { initialValues, plugins } = this.state;
    const { edit, httpClient, monitorToEdit, notifications, isDarkMode } = this.props;
    return (
      <div style={{ padding: '25px 50px' }}>
        <Formik initialValues={initialValues} onSubmit={this.onSubmit} validateOnChange={false}>
          {({ values, errors, handleSubmit, isSubmitting, isValid, touched }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{edit ? 'Edit' : 'Create'} monitor</h1>
              </EuiTitle>
              <EuiSpacer />
              <MonitorDetails
                values={values}
                errors={errors}
                httpClient={httpClient}
                monitorToEdit={monitorToEdit}
                plugins={plugins}
                isAd={values.searchType === SEARCH_TYPE.AD}
              />
              <EuiSpacer />
              <DefineMonitor
                values={values}
                errors={errors}
                touched={touched}
                httpClient={httpClient}
                detectorId={this.props.detectorId}
                notifications={notifications}
                isDarkMode={isDarkMode}
              />
              <EuiSpacer />
              <FieldArray name={'triggerDefinitions'} validateOnChange={true}>
                {(triggerArrayHelpers) => (
                  <ConfigureTriggers
                    edit={edit}
                    triggerArrayHelpers={triggerArrayHelpers}
                    monitor={formikToMonitor(values)}
                    monitorValues={values}
                    setFlyout={this.props.setFlyout}
                    triggers={_.get(formikToMonitor(values), 'triggers', [])}
                    triggerValues={values}
                    isDarkMode={this.props.isDarkMode}
                    httpClient={httpClient}
                    notifications={notifications}
                  />
                )}
              </FieldArray>
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={this.onCancel}>Cancel</EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton fill onClick={handleSubmit} isLoading={isSubmitting}>
                    {edit ? 'Update' : 'Create'}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
              <SubmitErrorHandler
                errors={errors}
                isSubmitting={isSubmitting}
                isValid={isValid}
                onSubmitError={() =>
                  notifications.toasts.addDanger({
                    title: `Failed to ${edit ? 'update' : 'create'} the monitor`,
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
