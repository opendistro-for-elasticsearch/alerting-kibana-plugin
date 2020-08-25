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
import { EuiFlexGroup, EuiFlexItem, EuiButton } from '@elastic/eui';

import { FormikComboBox } from '../../../../../components/FormControls';
import { validateEmailSender } from './utils/validate';
import { isInvalid, hasError } from '../../../../../utils/validate';
import ManageSenders from '../ManageSenders';
import { STATE } from '../../../components/createDestinations/Email/utils/constants';

export default class EmailSender extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      senders: [],
      senderOptions: [],
      loadingSenders: true,
      showManageSendersModal: false,
    };

    this.onClickManageSenders = this.onClickManageSenders.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
  }

  componentDidMount() {
    this.loadSenders();
  }

  onClickManageSenders() {
    this.setState({ showManageSendersModal: true });
  }

  onClickCancel() {
    this.setState({ showManageSendersModal: false });
  }

  createSender = async sender => {
    const { httpClient } = this.props;
    const body = {
      name: sender.name,
      email: sender.email,
      host: sender.host,
      port: sender.port,
      method: sender.method,
    };
    try {
      await httpClient.post(`../api/alerting/email_accounts`, body);
    } catch (err) {
      console.error('Unable to create sender', err);
    }
  };

  updateSender = async updatedSender => {
    const { httpClient } = this.props;
    const { id, ifSeqNo, ifPrimaryTerm } = updatedSender;
    const body = {
      name: updatedSender.name,
      email: updatedSender.email,
      host: updatedSender.host,
      port: updatedSender.port,
      method: updatedSender.method,
    };
    try {
      await httpClient.put(
        `../api/alerting/email_accounts/${id}?ifSeqNo=${ifSeqNo}&ifPrimaryTerm=${ifPrimaryTerm}`,
        body
      );
    } catch (err) {
      console.error('Unable to update sender', err);
    }
  };

  deleteSender = async sender => {
    const { httpClient } = this.props;
    const { id } = sender;
    try {
      await httpClient.delete(`../api/alerting/email_accounts/${id}`);
    } catch (err) {
      console.error('Unable to delete sender', err);
    }
  };

  // Using a curried function to pass custom values to the formik submission handler
  // TODO: Cleanup this function (currently making sequential API calls since each one has 'awaits' on it)
  onClickSave = sendersToDelete => async (values, formikBag) => {
    const { senders } = values;
    for (const sender of senders) {
      if (sender.state === STATE.CREATED) {
        await this.createSender(sender);
      } else if (sender.state === STATE.UPDATED) {
        await this.updateSender(sender);
      }
    }

    for (const sender of sendersToDelete) {
      await this.deleteSender(sender);
    }

    // this.setState({ showManageSendersModal: false });
    this.loadSenders().then(r => this.setState({ showManageSendersModal: false }));
  };

  loadSenders = async (searchText = '') => {
    const { httpClient } = this.props;
    this.setState({ loadingSenders: true });
    try {
      const response = await httpClient.get(
        `../api/alerting/email_accounts?search=${searchText}&size=200`
      );
      const emailAccounts = response.data.emailAccounts;
      const emailAccountOptions = emailAccounts.map(emailAccount => ({
        label: emailAccount.name,
        value: emailAccount.id,
      }));
      this.setState({
        senders: emailAccounts,
        senderOptions: emailAccountOptions,
        loadingSenders: false,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        senders: [],
        senderOptions: [],
        loadingSenders: false,
      });
    }
  };

  render() {
    const { httpClient, type } = this.props;
    const { senders, senderOptions, loadingSenders, showManageSendersModal } = this.state;
    return (
      <Fragment>
        <EuiFlexGroup
          direction="row"
          gutterSize="s"
          alignItems="flexStart"
          style={{ paddingLeft: '10px' }}
        >
          <EuiFlexItem grow={false}>
            <FormikComboBox
              name={`${type}.emailSender`}
              formRow
              fieldProps={{ validate: validateEmailSender(senderOptions) }}
              rowProps={{
                label: 'Sender',
                helpText:
                  'A destination only allows one sender. ' +
                  'Use "Manage senders" to create a sender with its email address, host, port, etc.',
                isInvalid,
                error: hasError,
              }}
              inputProps={{
                placeholder: 'Sender name',
                async: true,
                isLoading: loadingSenders,
                options: senderOptions,
                onChange: (options, field, form) => {
                  form.setFieldValue(`${type}.emailSender`, options);
                },
                onBlur: (e, field, form) => {
                  form.setFieldTouched(`${type}.emailSender`, true);
                },
                singleSelection: { asPlainText: true },
                isClearable: false,
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton style={{ marginTop: 22 }} onClick={this.onClickManageSenders}>
              Manage senders
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        {showManageSendersModal && (
          <ManageSenders
            httpClient={httpClient}
            senders={senders}
            loadingSenders={loadingSenders}
            onClickCancel={this.onClickCancel}
            onClickSave={this.onClickSave}
          />
        )}
      </Fragment>
    );
  }
}

EmailSender.propTypes = {
  httpClient: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};
