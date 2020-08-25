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
import { isInvalid, hasError } from '../../../../../utils/validate';
import ManageEmailGroups from '../ManageEmailGroups';
import { STATE } from '../../../components/createDestinations/Email/utils/constants';
import { validateEmailRecipients } from './utils/validate';
import { RECIPIENT_TYPE } from './utils/constants';

export default class EmailRecipients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      emailGroups: [], // TODO: Possibly add emails here instead of ManageEmailGroups
      recipientOptions: [],
      isLoading: true,
      showManageEmailGroupsModal: false,
    };

    this.onClickManageEmailGroups = this.onClickManageEmailGroups.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  onClickManageEmailGroups() {
    this.setState({ showManageEmailGroupsModal: true });
  }

  onClickCancel() {
    this.setState({ showManageEmailGroupsModal: false });
  }

  onCreateOption = (fieldName, value, selectedOptions, setFieldValue) => {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) return;

    const newOption = {
      label: value,
      value: value,
      type: RECIPIENT_TYPE.EMAIL,
    };
    setFieldValue(fieldName, [...selectedOptions, newOption]);
  };

  createEmailGroup = async emailGroup => {
    const { httpClient } = this.props;
    const body = {
      name: emailGroup.name,
      emails: emailGroup.emails.map(email => ({ email: email })),
    };
    try {
      await httpClient.post(`../api/alerting/email_groups`, body);
    } catch (err) {
      console.error('Unable to create email group', err);
    }
  };

  updateEmailGroup = async updatedEmailGroup => {
    const { httpClient } = this.props;
    const { id, ifSeqNo, ifPrimaryTerm } = updatedEmailGroup;
    const body = {
      name: updatedEmailGroup.name,
      emails: updatedEmailGroup.emails.map(email => ({ email: email })),
    };
    try {
      await httpClient.put(
        `../api/alerting/email_groups/${id}?ifSeqNo=${ifSeqNo}&ifPrimaryTerm=${ifPrimaryTerm}`,
        body
      );
    } catch (err) {
      console.error('Unable to update email group', err);
    }
  };

  deleteEmailGroup = async emailGroup => {
    const { httpClient } = this.props;
    const { id } = emailGroup;
    try {
      await httpClient.delete(`../api/alerting/email_groups/${id}`);
    } catch (err) {
      console.err('Unable to delete email group', err);
    }
  };

  // Using a curried function to pass custom values to the formik submission handler
  // TODO: Cleanup this function (currently making sequential API calls since each one has 'awaits' on it)
  onClickSave = emailGroupsToDelete => async (values, formikBag) => {
    const { emailGroups } = values;
    for (const emailGroup of emailGroups) {
      if (emailGroup.state === STATE.CREATED) {
        await this.createEmailGroup(emailGroup);
      } else if (emailGroup.state === STATE.UPDATED) {
        await this.updateEmailGroup(emailGroup);
      }
    }

    for (const emailGroup of emailGroupsToDelete) {
      await this.deleteEmailGroup(emailGroup);
    }

    // this.setState({ showManageEmailGroupsModal: false });
    this.loadData().then(r => this.setState({ showManageEmailGroupsModal: false }));
  };

  // TODO: Only loading email groups here at the moment, should add emails as options too
  loadData = async (searchText = '') => {
    const { httpClient } = this.props;
    this.setState({ isLoading: true });
    try {
      const response = await httpClient.get(
        `../api/alerting/email_groups?search=${searchText}&size=200`
      );
      const emailGroups = response.data.emailGroups;
      const emailGroupOptions = emailGroups.map(emailGroup => ({
        label: emailGroup.name,
        value: emailGroup.id,
        type: RECIPIENT_TYPE.EMAIL_GROUP,
      }));
      this.setState({
        emailGroups: emailGroups,
        recipientOptions: emailGroupOptions,
        isLoading: false,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        emailGroups: [],
        recipientOptions: [],
        isLoading: false,
      });
    }
  };

  render() {
    const { httpClient, type } = this.props;
    const { emailGroups, recipientOptions, isLoading, showManageEmailGroupsModal } = this.state;
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
              name={`${type}.emailRecipients`}
              formRow
              fieldProps={{ validate: validateEmailRecipients }}
              rowProps={{
                label: 'Recipients',
                helpText:
                  'Add recipient(s) using an email address or a pre-created email group. ' +
                  'Use "Manage email groups" to create or remove email groups.',
                isInvalid,
                error: hasError,
              }}
              inputProps={{
                placeholder: 'Email address, email group name',
                async: true,
                isLoading: isLoading,
                options: recipientOptions,
                onChange: (options, field, form) => {
                  form.setFieldValue(`${type}.emailRecipients`, options);
                },
                onBlur: (e, field, form) => {
                  form.setFieldTouched(`${type}.emailRecipients`, true);
                },
                onCreateOption: (value, field, form) => {
                  this.onCreateOption(
                    `${type}.emailRecipients`,
                    value,
                    field.value,
                    form.setFieldValue
                  );
                },
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton style={{ marginTop: 22 }} onClick={this.onClickManageEmailGroups}>
              Manage email groups
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        {showManageEmailGroupsModal && (
          <ManageEmailGroups
            httpClient={httpClient}
            emailGroups={emailGroups}
            loadingEmailGroups={isLoading}
            onClickCancel={this.onClickCancel}
            onClickSave={this.onClickSave}
          />
        )}
      </Fragment>
    );
  }
}

EmailRecipients.propTypes = {
  httpClient: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};
