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
import getSenders from './utils/helpers';

export default class EmailSender extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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

  onClickSave = () => {
    // TODO: Check if 'then' is necessary here
    // this.setState({ showManageSendersModal: false })
    this.loadSenders().then((r) => this.setState({ showManageSendersModal: false }));
  };

  loadSenders = async () => {
    const { httpClient } = this.props;
    this.setState({ loadingSenders: true });

    const senders = await getSenders(httpClient);
    const senderOptions = senders.map((sender) => ({
      label: sender.name,
      value: sender.id,
    }));

    this.setState({
      senderOptions,
      loadingSenders: false,
    });
  };

  render() {
    const { httpClient, type } = this.props;
    const { senderOptions, loadingSenders, showManageSendersModal } = this.state;
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

        <ManageSenders
          httpClient={httpClient}
          isVisible={showManageSendersModal}
          onClickCancel={this.onClickCancel}
          onClickSave={this.onClickSave}
        />
      </Fragment>
    );
  }
}

EmailSender.propTypes = {
  httpClient: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};
