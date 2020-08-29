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

import React from 'react';
import _ from 'lodash';
import { Formik, FieldArray } from 'formik';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiOverlayMask,
  EuiSpacer,
} from '@elastic/eui';
import PropTypes from 'prop-types';

import AddSenderButton from '../../../components/createDestinations/AddSenderButton/AddSenderButton';
import Sender from '../../../components/createDestinations/Email/Sender';
import SenderEmptyPrompt from '../../../components/createDestinations/SenderEmptyPrompt';
import { senderToFormik } from './utils/helpers';
import getSenders from '../EmailSender/utils/helpers';
import { STATE } from '../../../components/createDestinations/Email/utils/constants';
import { ignoreEscape } from '../../../../../utils/helpers';

const createSenderContext = senders => ({
  ctx: {
    senders,
  },
});

const getInitialValues = senders =>
  _.isEmpty(senders) ? { senders: [] } : { senders: senders.map(sender => senderToFormik(sender)) };

export default class ManageSenders extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sendersToDelete: [],
      loadingSenders: true,
    };

    this.getSenders = getSenders.bind(this);
  }

  componentDidMount() {
    this.loadInitialValues();
  }

  // Reload initial values when modal is no longer visible so changes
  // are reflected the next time it is opened
  componentDidUpdate(prevProps) {
    if (prevProps.isVisible && !this.props.isVisible) {
      this.loadInitialValues();
    }
  }

  loadInitialValues = async () => {
    this.setState({ loadingSenders: true });

    const senders = await this.getSenders();
    const initialValues = getInitialValues(senders);

    this.setState({
      initialValues,
      sendersToDelete: [],
      loadingSenders: false,
    });
  };

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

  // TODO: Cleanup this function (currently making sequential API calls since each one has 'awaits' on it)
  processSenders = async values => {
    const { sendersToDelete } = this.state;
    const { senders } = values;

    // Create or update email senders
    for (const sender of senders) {
      if (sender.state === STATE.CREATED) {
        await this.createSender(sender);
      } else if (sender.state === STATE.UPDATED) {
        await this.updateSender(sender);
      }
    }

    // Delete any removed email senders
    for (const sender of sendersToDelete) {
      await this.deleteSender(sender);
    }
  };

  renderSenders = ({ values, arrayHelpers }) => {
    const hasSenders = !_.isEmpty(values.senders);
    return hasSenders ? (
      <div>
        {values.senders.map((sender, index) => (
          <div key={index}>
            <Sender
              sender={sender}
              arrayHelpers={arrayHelpers}
              context={createSenderContext(values.senders)}
              index={index}
              onDelete={() => {
                if (sender.id) {
                  this.setState(prevState => ({
                    sendersToDelete: [...prevState.sendersToDelete, sender],
                  }));
                }
                arrayHelpers.remove(index);
              }}
            />
            <EuiSpacer className="accordion-separator" />
          </div>
        ))}
        <div style={{ justifyContent: 'left' }}>
          <AddSenderButton arrayHelpers={arrayHelpers} />
        </div>
      </div>
    ) : (
      <SenderEmptyPrompt arrayHelpers={arrayHelpers} />
    );
  };

  render() {
    const { isVisible, onClickCancel, onClickSave } = this.props;
    const { initialValues, loadingSenders } = this.state;
    return isVisible ? (
      <Formik
        initialValues={initialValues}
        onSubmit={(values, formikBag) => {
          this.processSenders(values).then(() => onClickSave());
        }}
        validateOnChange={false}
        render={({ values, handleSubmit, isSubmitting }) => (
          <EuiOverlayMask>
            <EuiModal
              className="modal-manage-email"
              maxWidth={1000}
              onClose={ignoreEscape(onClickCancel)}
            >
              <EuiModalHeader>
                <EuiModalHeaderTitle>Manage email senders</EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiHorizontalRule margin="s" />

              <EuiModalBody>
                <FieldArray
                  name="senders"
                  validateOnChange={true}
                  render={arrayHelpers =>
                    loadingSenders ? (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        Loading Senders...
                      </div>
                    ) : (
                      this.renderSenders({ values, arrayHelpers })
                    )
                  }
                />
              </EuiModalBody>

              <EuiHorizontalRule margin="s" />

              <EuiModalFooter>
                <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty onClick={onClickCancel}>Cancel</EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton onClick={handleSubmit} isLoading={isSubmitting} fill>
                      Save
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiModalFooter>
            </EuiModal>
          </EuiOverlayMask>
        )}
      />
    ) : null;
  }
}

ManageSenders.propTypes = {
  httpClient: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
  onClickCancel: PropTypes.func,
  onClickSave: PropTypes.func,
};

ManageSenders.defaultProps = {
  isVisible: false,
};
