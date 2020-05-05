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
import queryString from 'query-string';
import { Formik } from 'formik';
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
} from '@elastic/eui';

import ConfigureMonitor from '../ConfigureMonitor';
import DefineMonitor from '../DefineMonitor';
import { FORMIK_INITIAL_VALUES } from './utils/constants';
import monitorToFormik from './utils/monitorToFormik';
import { formikToMonitor } from './utils/formikToMonitor';
import { DefineSchedule } from '../DefineSchedule';
import { TRIGGER_ACTIONS, SEARCH_TYPE } from '../../../../utils/constants';
import { initializeFromQueryParams } from './utils/monitorQueryParams';

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

    if (this.props.edit && this.props.monitorToEdit) {
      initialValues = monitorToFormik(this.props.monitorToEdit);
    }

    this.state = { initialValues };

    this.onCancel = this.onCancel.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
  }

  onCancel() {
    if (this.props.edit) this.props.history.goBack();
    else this.props.history.push('/monitors');
  }

  async onCreate(monitor, { setSubmitting, setErrors }) {
    const { httpClient } = this.props;
    try {
      const resp = await httpClient.post('../api/alerting/monitors', monitor);
      setSubmitting(false);
      const {
        data: {
          ok,
          resp: { _id },
        },
      } = resp;
      if (ok) {
        this.props.history.push(
          `/monitors/${_id}?action=${TRIGGER_ACTIONS.CREATE_TRIGGER}&success=true`
        );
      } else {
        console.log('Failed to create:', resp.data);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      // TODO: setErrors
    }
  }

  async onUpdate(monitor, { setSubmitting, setErrors }) {
    const { updateMonitor } = this.props;
    // Since we are creating a monitor from formik values, we do not want to override the current existing triggers
    // delete the triggers key so when merging original monitor with updated monitor we are keeping the original triggers
    const updatedMonitor = _.cloneDeep(monitor);
    delete updatedMonitor.triggers;
    try {
      const resp = await updateMonitor(updatedMonitor);
      setSubmitting(false);
      const {
        data: { ok, id },
      } = resp;
      if (ok) {
        this.props.history.push(`/monitors/${id}`);
      } else {
        console.log('Failed to update:', resp.data);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      // TODO: setErrors
    }
  }

  onSubmit(values, formikBag) {
    const { edit } = this.props;
    const monitor = formikToMonitor(values);
    if (edit) this.onUpdate(monitor, formikBag);
    else this.onCreate(monitor, formikBag);
  }

  render() {
    const { initialValues } = this.state;
    const { edit, httpClient, monitorToEdit } = this.props;
    return (
      <div style={{ padding: '25px 50px' }}>
        <Formik
          initialValues={initialValues}
          onSubmit={this.onSubmit}
          validateOnChange={false}
          render={({ values, errors, handleSubmit, isSubmitting }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{edit ? 'Edit' : 'Create'} monitor</h1>
              </EuiTitle>
              <EuiSpacer />
              <ConfigureMonitor httpClient={httpClient} monitorToEdit={monitorToEdit} />
              <EuiSpacer />
              <DefineMonitor
                values={values}
                errors={errors}
                httpClient={httpClient}
                detectorId={this.props.detectorId}
              />
              <Fragment>
                <EuiSpacer />
                <DefineSchedule isAd={values.searchType === SEARCH_TYPE.AD} />
              </Fragment>
              <EuiSpacer />
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
            </Fragment>
          )}
        />
      </div>
    );
  }
}
