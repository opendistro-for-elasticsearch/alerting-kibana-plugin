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

const createEmailGroupContext = emailGroups => ({
  ctx: {
    emailGroups,
  },
});

const getInitialValues = emailGroups =>
  _.isEmpty(emailGroups)
    ? { emailGroups: [] }
    : { emailGroups: emailGroups.map(emailGroup => emailGroupToFormik(emailGroup)) };

const getEmailOptions = emailGroups => {
  if (_.isEmpty(emailGroups)) return [];

  // Return a unique list of all emails across all email groups
  const nestedEmails = emailGroups.map(emailGroup => emailGroup.emails);
  const emails = [].concat(...nestedEmails);
  // Don't wrap the email in a label if it was a custom option since it already is
  return [...new Set(emails)].map(email => (_.isString(email) ? { label: email } : email));
};

export default class ManageEmailGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      emailGroupsToDelete: [],
      loadingEmailGroups: true,
    };

    this.getEmailGroups = getEmailGroups.bind(this);
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
    this.setState({ loadingEmailGroups: true });

    const emailGroups = await this.getEmailGroups();
    const initialValues = getInitialValues(emailGroups);

    this.setState({
      initialValues,
      emailGroupsToDelete: [],
      loadingEmailGroups: false,
    });
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
                  this.setState(prevState => ({
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
        onSubmit={onClickSave(emailGroupsToDelete)}
        validateOnChange={false}
        render={({ values, handleSubmit, isSubmitting }) => (
          <EuiOverlayMask>
            <EuiModal className="modal-manage-email" maxWidth={1000} onClose={onClickCancel}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>Manage email groups</EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiHorizontalRule />

              <EuiModalBody>
                <FieldArray
                  name="emailGroups"
                  validateOnChange={true}
                  render={arrayHelpers =>
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
