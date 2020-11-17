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
import PropTypes from 'prop-types';
import { EuiSpacer } from '@elastic/eui';
import EmailSender from '../../../containers/CreateDestination/EmailSender';
import EmailRecipients from '../../../containers/CreateDestination/EmailRecipients';

const propTypes = {
  type: PropTypes.string.isRequired,
  core: PropTypes.object.isRequired,
};
const Email = ({ httpClient, type, values, core }) => (
  <div>
    <EmailSender httpClient={httpClient} type={type} core={core} />
    <EuiSpacer size="m" />
    <EmailRecipients httpClient={httpClient} type={type} core={core} />
  </div>
);

Email.propTypes = propTypes;

export default Email;
