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
import PropTypes from 'prop-types';
import moment from 'moment';
import { EuiConfirmModal, EuiInMemoryTable, EuiOverlayMask } from '@elastic/eui';

export default class AcknowledgeModal extends Component {
  constructor(props) {
    super(props);

    this.state = { selectedItems: [] };

    this.onConfirm = this.onConfirm.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
  }

  onConfirm() {
    const { selectedItems } = this.state;
    if (!selectedItems.length) return;
    this.props.onAcknowledge(selectedItems);
  }

  onSelectionChange(selectedItems) {
    this.setState({ selectedItems });
  }

  renderTime(time) {
    const momentTime = moment(time);
    if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
    return '--';
  }

  render() {
    const { alerts, totalAlerts } = this.props;

    const columns = [
      {
        field: 'monitor_name',
        name: 'Monitor',
        truncateText: true,
      },
      {
        field: 'trigger_name',
        name: 'Trigger',
        truncateText: true,
      },
      {
        field: 'start_time',
        name: 'Start Time',
        truncateText: false,
        render: this.renderTime,
      },
      {
        field: 'severity',
        name: 'Severity',
        align: 'right',
        truncateText: false,
      },
    ];
    // TODO: Acknowledge loading, disable selection
    // TODO: Empty state, no active alerts found, or too many alerts found
    const selection = { onSelectionChange: this.onSelectionChange };

    return (
      <EuiOverlayMask>
        <EuiConfirmModal
          title="Acknowledge Alerts"
          maxWidth={650}
          onCancel={this.props.onClickCancel}
          onConfirm={this.onConfirm}
          cancelButtonText="cancel"
          confirmButtonText="Acknowledge"
        >
          <p>Select which alerts to acknowledge.</p>
          <EuiInMemoryTable
            items={alerts}
            itemId="id"
            columns={columns}
            isSelectable={true}
            selection={selection}
            onTableChange={this.onTableChange}
            style={{
              // TODO: Move to classname
              borderTop: '1px solid #D9D9D9',
              borderLeft: '1px solid #D9D9D9',
              borderRight: '1px solid #D9D9D9',
            }}
          />
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }
}

const AlertType = PropTypes.shape({});

AcknowledgeModal.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.any).isRequired,
  totalAlerts: PropTypes.number.isRequired,
  onClickCancel: PropTypes.func.isRequired,
  onAcknowledge: PropTypes.func.isRequired,
};
