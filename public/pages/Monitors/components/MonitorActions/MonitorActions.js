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
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
} from '@elastic/eui';

import { APP_PATH } from '../../../../utils/constants';
import { PLUGIN_NAME } from '../../../../../utils/constants';

export default class MonitorActions extends Component {
  state = {
    isActionsOpen: false,
  };

  getActions = () => {
    return [
      <EuiContextMenuItem
        key="acknowledge"
        data-test-subj="acknowledgeItem"
        onClick={() => {
          this.onCloseActions();
          this.props.onBulkAcknowledge();
        }}
      >
        Acknowledge
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="enable"
        data-test-subj="enableItem"
        onClick={() => {
          this.onCloseActions();
          this.props.onBulkEnable();
        }}
      >
        Enable
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="disable"
        data-test-subj="disableItem"
        onClick={() => {
          this.onCloseActions();
          this.props.onBulkDisable();
        }}
      >
        Disable
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="delete"
        data-test-subj="deleteItem"
        onClick={() => {
          this.onCloseActions();
          this.props.onBulkDelete();
        }}
      >
        Delete
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
    const { isEditDisabled, onClickEdit } = this.props;
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="actionsPopover"
            button={
              <EuiButton
                onClick={this.onClickActions}
                iconType="arrowDown"
                iconSide="right"
                data-test-subj="actionsButton"
              >
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
          <EuiButton disabled={isEditDisabled} onClick={onClickEdit} data-test-subj="editButton">
            Edit
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            href={`${PLUGIN_NAME}#${APP_PATH.CREATE_MONITOR}`}
            data-test-subj="createButton"
          >
            Create monitor
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
