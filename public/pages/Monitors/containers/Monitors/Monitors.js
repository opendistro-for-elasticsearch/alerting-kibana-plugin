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
import _ from 'lodash';
import queryString from 'query-string';
import { EuiBasicTable, EuiHorizontalRule } from '@elastic/eui';

import AcknowledgeModal from '../../components/AcknowledgeModal';
import ContentPanel from '../../../../components/ContentPanel';
import MonitorActions from '../../components/MonitorActions';
import MonitorControls from '../../components/MonitorControls';
import MonitorEmptyPrompt from '../../components/MonitorEmptyPrompt';
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from './utils/constants';
import { getURLQueryParams } from './utils/helpers';
import { columns as staticColumns } from './utils/tableUtils';
import { MONITOR_ACTIONS } from '../../../../utils/constants';

const MAX_MONITOR_COUNT = 1000;

// TODO: Abstract out a Table component to be used in both Dashboard and Monitors

export default class Monitors extends Component {
  constructor(props) {
    super(props);

    const { from, size, search, sortField, sortDirection, state } = getURLQueryParams(
      this.props.location
    );

    this.state = {
      alerts: [],
      totalAlerts: 0,
      totalMonitors: 0,
      page: Math.floor(from / size),
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      isPopoverOpen: false,
      monitors: [],
      monitorState: state,
      loadingMonitors: true,
    };

    this.getMonitors = _.debounce(this.getMonitors.bind(this), 500, { leading: true });
    this.onTableChange = this.onTableChange.bind(this);
    this.onMonitorStateChange = this.onMonitorStateChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.updateMonitor = this.updateMonitor.bind(this);
    this.deleteMonitor = this.deleteMonitor.bind(this);
    this.updateMonitors = this.updateMonitors.bind(this);
    this.deleteMonitors = this.deleteMonitors.bind(this);
    this.onClickAcknowledge = this.onClickAcknowledge.bind(this);
    this.onClickAcknowledgeModal = this.onClickAcknowledgeModal.bind(this);
    this.onClickEdit = this.onClickEdit.bind(this);
    this.onClickEnable = this.onClickEnable.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);
    this.onClickDisable = this.onClickDisable.bind(this);
    this.onBulkAcknowledge = this.onBulkAcknowledge.bind(this);
    this.onBulkEnable = this.onBulkEnable.bind(this);
    this.onBulkDelete = this.onBulkDelete.bind(this);
    this.onBulkDisable = this.onBulkDisable.bind(this);
    this.onPageClick = this.onPageClick.bind(this);
    this.getActiveAlerts = this.getActiveAlerts.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.resetFilters = this.resetFilters.bind(this);

    this.columns = [
      ...staticColumns,
      {
        name: 'Actions',
        width: '75px',
        actions: [
          {
            name: 'Acknowledge',
            description: 'Acknowledge this Monitor',
            onClick: this.onClickAcknowledge,
          },
          {
            name: 'Enable',
            description: 'Enable this Monitor',
            onClick: this.onClickEnable,
          },
          {
            name: 'Disable',
            description: 'Disable this Monitor',
            onClick: this.onClickDisable,
          },
          {
            name: 'Delete',
            description: 'Delete this Monitor',
            onClick: this.onClickDelete,
          },
        ],
      },
    ];
  }

  componentDidMount() {
    const { page, size, search, sortField, sortDirection, monitorState } = this.state;
    this.getMonitors(page * size, size, search, sortField, sortDirection, monitorState);
  }

  componentDidUpdate(prevProps, prevState) {
    const prevQuery = this.getQueryObjectFromState(prevState);
    const currQuery = this.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      const { page, size, search, sortField, sortDirection, monitorState } = this.state;
      this.getMonitors(page * size, size, search, sortField, sortDirection, monitorState);
    }
  }

  getQueryObjectFromState({ page, size, search, sortField, sortDirection, monitorState }) {
    return {
      page,
      size,
      search,
      sortField,
      sortDirection,
      monitorState,
    };
  }

  async getMonitors(from, size, search, sortField, sortDirection, state) {
    this.setState({ loadingMonitors: true });
    try {
      const params = { from, size, search, sortField, sortDirection, state };
      const queryParamsString = queryString.stringify(params);
      const { httpClient, history } = this.props;
      history.replace({ ...this.props.location, search: queryParamsString });
      const response = await httpClient.get('../api/alerting/monitors', { query: params });
      if (response.ok) {
        const { monitors, totalMonitors } = response;
        this.setState({ monitors, totalMonitors });
      } else {
        console.log('error getting monitors:', response);
      }
    } catch (err) {
      console.error(err);
    }
    this.setState({ loadingMonitors: false });
  }

  onTableChange({ page: tablePage = {}, sort = {} }) {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ page, size, sortField, sortDirection });
  }

  onMonitorStateChange(e) {
    this.setState({ page: 0, monitorState: e.target.value });
  }

  onSelectionChange(selectedItems) {
    this.setState({ selectedItems });
  }

  onSearchChange(e) {
    this.setState({ page: 0, search: e.target.value });
  }

  updateMonitor(item, update) {
    const { httpClient } = this.props;
    const { id, ifSeqNo, ifPrimaryTerm, monitor } = item;
    return httpClient
      .put(`../api/alerting/monitors/${id}`, {
        query: { ifSeqNo, ifPrimaryTerm },
        body: JSON.stringify({ ...monitor, ...update }),
      })
      .then((resp) => resp)
      .catch((err) => err);
  }

  deleteMonitor(item) {
    const { httpClient } = this.props;
    const { id, version } = item;
    return httpClient
      .delete(`../api/alerting/monitors/${id}`, { query: { version } })
      .then((resp) => resp)
      .catch((err) => err);
  }

  updateMonitors(items, update) {
    const arrayOfPromises = items.map((item) =>
      this.updateMonitor(item, update).catch((error) => error)
    );

    return Promise.all(arrayOfPromises).then((values) => {
      // TODO: Show which values failed, succeeded, etc.
      const { page, size, search, sortField, sortDirection, monitorState } = this.state;
      this.getMonitors(page * size, size, search, sortField, sortDirection, monitorState);
      this.setState({ selectedItems: [] });
    });
  }

  deleteMonitors(items) {
    const arrayOfPromises = items.map((item) => this.deleteMonitor(item).catch((error) => error));

    return Promise.all(arrayOfPromises).then((values) => {
      // TODO: Show which values failed, succeeded, etc.
      const { page, size, search, sortField, sortDirection, monitorState } = this.state;
      this.getMonitors(page * size, size, search, sortField, sortDirection, monitorState);
      this.setState({ selectedItems: [] });
    });
  }

  async onClickAcknowledge(item) {
    await this.getActiveAlerts([item]);
  }

  async onClickAcknowledgeModal(alerts) {
    const { httpClient } = this.props;

    const monitorAlerts = alerts.reduce((monitorAlerts, alert) => {
      const { id, monitor_id: monitorId } = alert;
      if (monitorAlerts[monitorId]) monitorAlerts[monitorId].push(id);
      else monitorAlerts[monitorId] = [id];
      return monitorAlerts;
    }, {});

    const promises = Object.entries(monitorAlerts).map(([monitorId, alerts]) =>
      httpClient
        .post(`../api/alerting/monitors/${monitorId}/_acknowledge/alerts`, {
          body: JSON.stringify({ alerts }),
        })
        .catch((error) => error)
    );

    const values = await Promise.all(promises);
    // TODO: Show which values failed, succeeded, etc.
    const { page, size, search, sortField, sortDirection, monitorState } = this.state;
    this.getMonitors(page * size, size, search, sortField, sortDirection, monitorState);
    this.setState({ alerts: [], totalAlerts: 0, showAcknowledgeModal: false, selectedItems: [] });
  }

  onClickEdit() {
    const {
      selectedItems: [{ id }],
    } = this.state;
    if (id) this.props.history.push(`/monitors/${id}?action=${MONITOR_ACTIONS.UPDATE_MONITOR}`);
  }

  onClickEnable(item) {
    this.updateMonitors([item], { enabled: true });
  }

  onClickDelete(item) {
    this.deleteMonitors([item]);
  }

  onClickDisable(item) {
    this.updateMonitors([item], { enabled: false });
  }

  async onBulkAcknowledge() {
    await this.getActiveAlerts(this.state.selectedItems);
  }

  onBulkEnable() {
    this.updateMonitors(this.state.selectedItems, { enabled: true });
  }

  onBulkDelete() {
    this.deleteMonitors(this.state.selectedItems);
  }

  onBulkDisable() {
    this.updateMonitors(this.state.selectedItems, { enabled: false });
  }

  onPageClick(page) {
    this.setState({ page });
  }

  async getActiveAlerts(selectedItems) {
    const monitorIds = selectedItems.map((monitor) => monitor.id);
    if (!monitorIds.length) return;
    // TODO: Limiting to 100.. otherwise could be bringing back large amount of alerts that all need to be acknowledged 1 by 1, handle case when there are more than 100 on UI
    const params = {
      from: 0,
      size: 100,
      sortField: 'monitor_name',
      sortDirection: 'asc',
      alertState: 'ACTIVE',
      monitorIds,
    };

    const { httpClient } = this.props;

    const response = await httpClient.get('../api/alerting/alerts', { query: params });

    if (response.ok) {
      const { alerts, totalAlerts } = response;
      this.setState({
        alerts,
        totalAlerts,
        showAcknowledgeModal: true,
      });
    } else {
      console.error(response);
    }
  }

  onClickCancel() {
    this.setState({ showAcknowledgeModal: false });
  }

  resetFilters() {
    this.setState({
      search: DEFAULT_QUERY_PARAMS.search,
      monitorState: DEFAULT_QUERY_PARAMS.state,
    });
  }

  getItemId(item) {
    return `${item.id}-${item.currentTime}`;
  }

  render() {
    const {
      alerts,
      monitors,
      monitorState,
      page,
      search,
      selectedItems,
      showAcknowledgeModal,
      size,
      sortDirection,
      sortField,
      totalAlerts,
      totalMonitors,
      loadingMonitors,
    } = this.state;
    const filterIsApplied = !!search || monitorState !== DEFAULT_QUERY_PARAMS.state;

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Math.min(MAX_MONITOR_COUNT, totalMonitors),
    };

    const sorting = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection = {
      onSelectionChange: this.onSelectionChange,
      selectableMessage: (selectable) => (selectable ? undefined : undefined),
    };

    return (
      <ContentPanel
        actions={
          <MonitorActions
            isEditDisabled={selectedItems.length !== 1}
            onBulkAcknowledge={this.onBulkAcknowledge}
            onBulkEnable={this.onBulkEnable}
            onBulkDisable={this.onBulkDisable}
            onBulkDelete={this.onBulkDelete}
            onClickEdit={this.onClickEdit}
          />
        }
        bodyStyles={{ padding: 'initial' }}
        title="Monitors"
      >
        <MonitorControls
          activePage={page}
          pageCount={Math.ceil(totalMonitors / size) || 1}
          search={search}
          state={monitorState}
          onSearchChange={this.onSearchChange}
          onStateChange={this.onMonitorStateChange}
          onPageClick={this.onPageClick}
        />

        <EuiHorizontalRule margin="xs" />

        {showAcknowledgeModal && (
          <AcknowledgeModal
            alerts={alerts}
            totalAlerts={totalAlerts}
            onAcknowledge={this.onClickAcknowledgeModal}
            onClickCancel={this.onClickCancel}
          />
        )}

        <EuiBasicTable
          columns={this.columns}
          hasActions={true}
          isSelectable={true}
          /*
           * EUI doesn't let you manually control the selectedItems, so we have to use the itemId for now
           * If using monitor ID, doesn't correctly update selectedItems when doing certain bulk actions, because the ID is the same
           * If using monitor ID + monitor version, it works for everything except Acknowledge, because Acknowledge isn't updating the monitor document
           * So the best approach for now is to set a currentTime on API response for the table to use as part of itemId,
           * and whenever new monitors are fetched from the server, we should be deselecting all monitors
           * */
          itemId={this.getItemId}
          items={monitors}
          noItemsMessage={
            <MonitorEmptyPrompt
              filterIsApplied={filterIsApplied}
              loading={loadingMonitors}
              resetFilters={this.resetFilters}
            />
          }
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    );
  }
}
