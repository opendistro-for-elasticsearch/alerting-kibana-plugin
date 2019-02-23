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
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiTitle } from '@elastic/eui';

const ContentPanel = ({
  title = '',
  titleSize = 'l',
  bodyStyles = {},
  panelStyles = {},
  horizontalRuleClassName = '',
  actions,
  children,
}) => (
  <EuiPanel style={{ paddingLeft: '0px', paddingRight: '0px', ...panelStyles }}>
    <EuiFlexGroup style={{ padding: '0px 10px' }} justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem>
        <EuiTitle size={titleSize}>
          <h3>{title}</h3>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          {Array.isArray(actions) ? (
            actions.map((action, idx) => <EuiFlexItem key={idx}>{action}</EuiFlexItem>)
          ) : (
            <EuiFlexItem>{actions}</EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiHorizontalRule margin="xs" className={horizontalRuleClassName} />

    <div style={{ padding: '0px 10px', ...bodyStyles }}>{children}</div>
  </EuiPanel>
);

ContentPanel.propTypes = {
  title: PropTypes.string,
  titleSize: PropTypes.string,
  bodyStyles: PropTypes.object,
  panelStyles: PropTypes.object,
  horizontalRuleClassName: PropTypes.string,
  actions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]).isRequired,
};

export default ContentPanel;
