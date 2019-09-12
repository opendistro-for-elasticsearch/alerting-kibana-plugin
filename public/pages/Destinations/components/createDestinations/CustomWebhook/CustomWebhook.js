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
import HeaderParamsEditor from './HeaderParamsEditor';
import MethodEditor from './MethodEditor';
import URLInfo from './URLInfo';

const propTypes = {
  type: PropTypes.string.isRequired,
};
const CustomWebhook = ({ type, values }) => (
  <div>
    <URLInfo type={type} values={values} />
    <EuiSpacer size="m" />
    <MethodEditor type={type} />
    <EuiSpacer size="m" />
    <HeaderParamsEditor type={type} headerParams={values[type].headerParams} />
  </div>
);

CustomWebhook.propTypes = propTypes;

export default CustomWebhook;
