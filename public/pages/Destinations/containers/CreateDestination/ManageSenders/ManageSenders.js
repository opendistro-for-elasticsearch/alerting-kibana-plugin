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
import Sender from '../../../components/createDestinations/Email/Sender';
import SenderEmptyPrompt from '../../../components/createDestinations/SenderEmptyPrompt';
import { senderToFormik } from './utils/helpers';
import AddSenderButton from '../../../components/createDestinations/AddSenderButton/AddSenderButton';

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

    const { senders } = this.props;
    const initialValues = getInitialValues(senders);

    this.state = {
      initialValues,
      sendersToDelete: [],
    };
  }

  // Reload initial values so the change reflects on subsequent renders
  // after senders have been altered
  componentDidUpdate(prevProps) {
    if (!this.props.loadingSenders && prevProps.loadingSenders) {
      this.reloadInitialValues(this.props.senders);
    }
  }

  reloadInitialValues = senders => {
    const initialValues = _.isEmpty(senders)
      ? { senders: [] }
      : { senders: senders.map(sender => senderToFormik(sender)) };

    this.setState({
      initialValues,
      sendersToDelete: [],
    });
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
    const { loadingSenders, onClickCancel, onClickSave } = this.props;
    const { initialValues, sendersToDelete } = this.state;
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={onClickSave(sendersToDelete)}
        validateOnChange={false}
        render={({ values, handleSubmit, isSubmitting }) => (
          <EuiOverlayMask>
            <EuiModal className="modal-manage-senders" maxWidth={1000} onClose={onClickCancel}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>Manage email senders</EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiHorizontalRule />

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

              <EuiHorizontalRule />

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
    );
  }
}

ManageSenders.propTypes = {
  httpClient: PropTypes.func.isRequired,
  senders: PropTypes.array,
  loadingSenders: PropTypes.bool,
  onClickCancel: PropTypes.func,
  onClickSave: PropTypes.func,
};

ManageSenders.defaultProps = {
  senders: [],
  loadingSenders: false,
};
