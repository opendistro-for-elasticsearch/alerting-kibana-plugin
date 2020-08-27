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

import React, { Component } from 'react';
import {
  EuiButton,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
} from '@elastic/eui';

import { APP_PATH } from '../../../../../utils/constants';
import { PLUGIN_NAME } from '../../../../../../utils/constants';

export default class DestinationsActions extends Component {
  state = {
    isActionsOpen: false,
  };

  getActions = () => {
    return [
      <EuiContextMenuItem
        key="manageSenders"
        onClick={() => {
          this.onCloseActions();
          this.props.onClickManageSenders();
        }}
      >
        Manage email senders
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="manageEmailGroups"
        onClick={() => {
          this.onCloseActions();
          this.props.onClickManageEmailGroups();
        }}
      >
        Manage email groups
      </EuiContextMenuItem>,
    ];
  };

  onCloseActions = () => {
    this.setState({ isActionsOpen: false });
  };

  onClickActions = () => {
    this.setState(prevState => ({ isActionsOpen: !prevState.isActionsOpen }));
  };

  render() {
    const { isActionsOpen } = this.state;
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem>
          <EuiPopover
            id="destinationActionsPopover"
            button={
              <EuiButton onClick={this.onClickActions} iconType="arrowDown" iconSide="right">
                Actions
              </EuiButton>
            }
            isOpen={isActionsOpen}
            closePopover={this.onCloseActions}
            panelPaddingSize="none"
            anchorPosition="downLeft"
          >
            <EuiContextMenuPanel items={this.getActions()} />
          </EuiPopover>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DESTINATION}`}>
            Add destination
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
