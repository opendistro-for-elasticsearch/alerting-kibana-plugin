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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Formik } from 'formik';
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
} from '@elastic/eui';
import ContentPanel from '../../../../components/ContentPanel';
import { hasError, isInvalid } from '../../../../utils/validate';
import { FormikFieldText, FormikSelect } from '../../../../components/FormControls';
import SubHeader from '../../../../components/SubHeader';
import { formikInitialValues } from './utils/constants';
import { DESTINATION_OPTIONS, DESTINATION_TYPE } from '../../utils/constants';
import { validateDestinationName } from './utils/validations';
import { formikToDestination } from './utils/formikToDestination';
import { destinationToFormik } from './utils/destinationToFormik';
import { Webhook, CustomWebhook, Mail } from '../../components/createDestinations';

const destinationType = {
  [DESTINATION_TYPE.SLACK]: props => <Webhook {...props} />,
  [DESTINATION_TYPE.CHIME]: props => <Webhook {...props} />,
  [DESTINATION_TYPE.CUSTOM_HOOK]: props => <CustomWebhook {...props} />,
  [DESTINATION_TYPE.MAIL]: props => <Mail {...props} />,
};

class CreateDestination extends React.Component {
  constructor(props) {
    super(props);
    let initialValues = formikInitialValues;

    const { location, edit, history } = this.props;
    let ifSeqNo, ifPrimaryTerm;
    if (edit) {
      // In case user is refreshing in edit mode , redirect them to the destination page.
      // TODO:: Ideally this should fetch the destination from ElasticSearch and fill in value
      const destinationToEdit = _.get(location, 'state.destinationToEdit', null);
      if (destinationToEdit) {
        initialValues = { ...destinationToFormik(destinationToEdit) };
        ifSeqNo = destinationToEdit.ifSeqNo;
        ifPrimaryTerm = destinationToEdit.ifPrimaryTerm;
      } else {
        history.push('/destinations');
      }
    }
    this.state = {
      initialValues,
      ifSeqNo,
      ifPrimaryTerm,
    };
  }

  getDestination = async destinationId => {
    const { httpClient, history } = this.props;
    try {
      const resp = await httpClient.get(`../api/alerting/destinations/${destinationId}`);
      if (resp.data.ok) {
        const ifSeqNo = _.get(resp, 'data.ifSeqNo');
        const ifPrimaryTerm = _.get(resp, 'data.ifPrimaryTerm');
        this.setState({
          ifSeqNo,
          ifPrimaryTerm,
        });
      } else {
        // Handle error, show message in case of 404
        history.push(`/destinations`);
      }
    } catch (e) {
      console.log('Unable to get the data');
    }
  };

  handleUpdate = async (requestData, { setSubmitting }) => {
    const {
      httpClient,
      match: {
        params: { destinationId },
      },
      history,
    } = this.props;
    const { ifSeqNo, ifPrimaryTerm } = this.state;
    try {
      const resp = await httpClient.put(
        `../api/alerting/destinations/${destinationId}?ifSeqNo=${ifSeqNo}&ifPrimaryTerm=${ifPrimaryTerm}`,
        requestData
      );
      const {
        data: { ok },
      } = resp;
      if (ok) {
        history.push(`/destinations`);
      } else {
        // Handles stale Destination data.
        setSubmitting(false);
        this.getDestination(destinationId);
      }
    } catch (e) {
      console.log('Unable to update destination', e);
      setSubmitting(false);
    }
  };

  handleCreate = async (requestData, { setSubmitting }) => {
    const { httpClient, history } = this.props;
    try {
      const resp = await httpClient.post('../api/alerting/destinations', requestData);
      setSubmitting(false);
      const {
        data: { ok },
      } = resp;
      if (ok) {
        history.push(`/destinations`);
      }
    } catch (e) {
      setSubmitting(false);
      console.error('Unable to create destination', e);
    }
  };
  // Handle Submit
  handleSubmit = (values, formikBag) => {
    const destinationRequest = formikToDestination(values);
    if (this.props.edit) {
      this.handleUpdate(destinationRequest, formikBag);
    } else {
      this.handleCreate(destinationRequest, formikBag);
    }
  };

  handleCancel = () => {
    const { edit, history } = this.props;
    if (edit) {
      history.goBack();
    } else {
      history.push('/destinations');
    }
  };
  render() {
    const { edit, httpClient, location } = this.props;
    const { initialValues } = this.state;

    return (
      <div style={{ padding: '25px 50px' }}>
        <Formik
          initialValues={initialValues}
          validateOnChange={false}
          onSubmit={this.handleSubmit}
          render={({ values, handleSubmit, isSubmitting }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{edit ? 'Edit' : 'Add'} destination</h1>
              </EuiTitle>
              <EuiSpacer size="m" />
              <ContentPanel title="Destination" titleSize="s" bodyStyles={{ padding: 'initial' }}>
                <div style={{ padding: '0px 10px' }}>
                  <FormikFieldText
                    name="name"
                    formRow
                    fieldProps={{
                      validate: validateDestinationName(
                        httpClient,
                        _.get(location, 'state.destinationToEdit')
                      ),
                    }}
                    rowProps={{
                      label: 'Name',
                      helpText: 'Specify a name of the destination.',
                      style: { paddingLeft: '10px' },
                      isInvalid,
                      error: hasError,
                    }}
                    inputProps={{
                      isInvalid,
                    }}
                  />
                  <FormikSelect
                    name="type"
                    formRow
                    rowProps={{
                      label: 'Type',
                      style: { paddingLeft: '10px' },
                    }}
                    inputProps={{
                      disabled: edit,
                      options: DESTINATION_OPTIONS,
                    }}
                  />
                  <EuiSpacer size="m" />
                  <SubHeader title={<h4>Settings</h4>} description={''} />
                  <EuiSpacer size="m" />
                  {destinationType[values.type]({ values, type: values.type })}
                </div>
                <EuiSpacer size="m" />
              </ContentPanel>
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={this.handleCancel}>Cancel</EuiButtonEmpty>
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

CreateDestination.propTypes = {
  edit: PropTypes.bool,
  httpClient: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

CreateDestination.defaultProps = {
  edit: false,
};
export default CreateDestination;
