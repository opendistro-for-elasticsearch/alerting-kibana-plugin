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
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiFlyoutFooter } from '@elastic/eui';

import Flyouts from './flyouts';

const getFlyoutData = ({ type, payload }) => {
  const flyout = Flyouts[type];
  if (!flyout || typeof flyout !== 'function') return null;
  return flyout(payload);
};

const propTypes = {
  flyout: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

const Flyout = ({ flyout, onClose }) => {
  if (!flyout) return null;
  const flyoutData = getFlyoutData(flyout);
  if (!flyoutData) return null;
  const {
    flyoutProps = {},
    headerProps = {},
    bodyProps = {},
    footerProps = {},
    header = null,
    body = null,
    footer = null,
  } = flyoutData;

  const flyoutHeader = header && <EuiFlyoutHeader {...headerProps}>{header}</EuiFlyoutHeader>;
  const flyoutBody = body && <EuiFlyoutBody {...bodyProps}>{body}</EuiFlyoutBody>;
  const flyoutFooter = footer && <EuiFlyoutFooter {...footerProps}>{footer}</EuiFlyoutFooter>;

  return (
    <EuiFlyout onClose={onClose} {...flyoutProps}>
      {flyoutHeader}
      {flyoutBody}
      {flyoutFooter}
    </EuiFlyout>
  );
};

Flyout.propTypes = propTypes;

export default Flyout;
