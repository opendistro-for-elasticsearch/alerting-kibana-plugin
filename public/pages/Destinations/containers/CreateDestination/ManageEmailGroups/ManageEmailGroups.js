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

import AddEmailGroupButton from '../../../components/createDestinations/AddEmailGroupButton/AddEmailGroupButton';
import EmailGroup from '../../../components/createDestinations/Email/EmailGroup';
import EmailGroupEmptyPrompt from '../../../components/createDestinations/EmailGroupEmptyPrompt';
import { emailGroupToFormik } from './utils/helpers';
import getEmailGroups from '../EmailRecipients/utils/helpers';
import { STATE } from '../../../components/createDestinations/Email/utils/constants';
import { ignoreEscape } from '../../../../../utils/helpers';

const createEmailGroupContext = (emailGroups) => ({
  ctx: {
    emailGroups,
  },
});

const getInitialValues = (emailGroups) =>
  _.isEmpty(emailGroups)
    ? { emailGroups: [] }
    : { emailGroups: emailGroups.map((emailGroup) => emailGroupToFormik(emailGroup)) };

const getEmailOptions = (emailGroups) => {
  if (_.isEmpty(emailGroups)) return [];

  // Get emails from email groups
  const nestedEmails = emailGroups.map((emailGroup) => emailGroup.emails);
  const emailOptions = [].concat(...nestedEmails);

  // Extract the email if it's already wrapped in a label (custom option)
  // so it can be filtered out
  const emails = emailOptions.map((email) => (_.isString(email) ? email : email.label));

  // Return a unique list of emails as options
  return [...new Set(emails)].map((email) => ({ label: email }));
};

export default class ManageEmailGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      emailGroupsToDelete: [],
      loadingEmailGroups: true,
    };
  }

  componentDidMount() {
    this.loadInitialValues();
  }

  // Reload initial values when modal is no longer visible so changes
  // are reflected the next time it is opened
  componentDidUpdate(prevProps) {
    if (prevProps.isVisible && !this.props.isVisible) {
      this.loadInitialValues(this.props.emailGroups);
    }
  }

  loadInitialValues = async () => {
    const { httpClient } = this.props;
    this.setState({ loadingEmailGroups: true });

    const emailGroups = await getEmailGroups(httpClient);
    const initialValues = getInitialValues(emailGroups);

    this.setState({
      initialValues,
      emailGroupsToDelete: [],
      loadingEmailGroups: false,
    });
  };

  createEmailGroup = async (emailGroup) => {
    const { httpClient } = this.props;
    const body = {
      name: emailGroup.name,
      emails: emailGroup.emails.map((email) => ({ email: email.label })),
    };
    try {
      await httpClient.post(`../api/alerting/destinations/email_groups`, body);
    } catch (err) {
      console.error('Unable to create email group', err);
    }
  };

  updateEmailGroup = async (updatedEmailGroup) => {
    const { httpClient } = this.props;
    const { id, ifSeqNo, ifPrimaryTerm } = updatedEmailGroup;
    const body = {
      name: updatedEmailGroup.name,
      emails: updatedEmailGroup.emails.map((email) => ({ email: email.label })),
    };
    try {
      await httpClient.put(
        `../api/alerting/destinations/email_groups/${id}?ifSeqNo=${ifSeqNo}&ifPrimaryTerm=${ifPrimaryTerm}`,
        body
      );
    } catch (err) {
      console.error('Unable to update email group', err);
    }
  };

  deleteEmailGroup = async (emailGroup) => {
    const { httpClient } = this.props;
    const { id } = emailGroup;
    try {
      await httpClient.delete(`../api/alerting/destinations/email_groups/${id}`);
    } catch (err) {
      console.err('Unable to delete email group', err);
    }
  };

  // TODO: Cleanup this function (currently making sequential API calls since each one has 'awaits' on it)
  processEmailGroups = async (values) => {
    const { emailGroupsToDelete } = this.state;
    const { emailGroups } = values;

    // Create or update email groups
    for (const emailGroup of emailGroups) {
      if (emailGroup.state === STATE.CREATED) {
        await this.createEmailGroup(emailGroup);
      } else if (emailGroup.state === STATE.UPDATED) {
        await this.updateEmailGroup(emailGroup);
      }
    }

    // Delete any removed email groups
    for (const emailGroup of emailGroupsToDelete) {
      await this.deleteEmailGroup(emailGroup);
    }
  };

  renderEmailGroups = ({ values, arrayHelpers }) => {
    const hasEmailGroups = !_.isEmpty(values.emailGroups);
    // TODO: Change this to getEmailOptions from stored emailGroups state
    const emailOptions = getEmailOptions(values.emailGroups);
    return hasEmailGroups ? (
      <div>
        {values.emailGroups.map((emailGroup, index) => (
          <div key={index}>
            <EmailGroup
              emailGroup={emailGroup}
              emailOptions={emailOptions}
              arrayHelpers={arrayHelpers}
              context={createEmailGroupContext(values.emailGroups)}
              index={index}
              onDelete={() => {
                if (emailGroup.id) {
                  this.setState((prevState) => ({
                    emailGroupsToDelete: [...prevState.emailGroupsToDelete, emailGroup],
                  }));
                }
                arrayHelpers.remove(index);
              }}
            />
            <EuiSpacer className="accordion-separator" />
          </div>
        ))}
        <div style={{ justifyContent: 'left' }}>
          <AddEmailGroupButton arrayHelpers={arrayHelpers} />
        </div>
      </div>
    ) : (
      <EmailGroupEmptyPrompt arrayHelpers={arrayHelpers} />
    );
  };

  render() {
    const { isVisible, onClickCancel, onClickSave } = this.props;
    const { initialValues, loadingEmailGroups, emailGroupsToDelete } = this.state;
    return isVisible ? (
      <Formik
        initialValues={initialValues}
        onSubmit={(values, formikBag) => {
          this.processEmailGroups(values).then(() => onClickSave());
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
                <EuiModalHeaderTitle>Manage email groups</EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiHorizontalRule margin="s" />

              <EuiModalBody>
                <FieldArray
                  name="emailGroups"
                  validateOnChange={true}
                  render={(arrayHelpers) =>
                    loadingEmailGroups ? (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        Loading Email Groups...
                      </div>
                    ) : (
                      this.renderEmailGroups({ values, arrayHelpers })
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

ManageEmailGroups.propTypes = {
  httpClient: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
  onClickCancel: PropTypes.func,
  onClickSave: PropTypes.func,
};

ManageEmailGroups.defaultProps = {
  isVisible: false,
};
