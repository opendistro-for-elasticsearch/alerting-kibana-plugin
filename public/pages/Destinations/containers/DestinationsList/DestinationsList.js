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
import { EuiBasicTable, EuiHorizontalRule, EuiCallOut } from '@elastic/eui';
import queryString from 'query-string';
import _ from 'lodash';
import ContentPanel from '../../../../components/ContentPanel';
import {
  EmptyDestinations,
  DestinationsActions,
  DestinationsControls,
  DeleteConfirmation,
} from '../../components/DestinationsList';
import { staticColumns, MAX_DESTINATIONS } from './utils/constants';
import { getURLQueryParams } from './utils/helpers';
import { isDeleteAllowedQuery } from './utils/deleteHelpers';
import { INDEX } from '../../../../../utils/constants';
import { DESTINATION_ACTIONS } from '../../../../utils/constants';
import ManageSenders from '../CreateDestination/ManageSenders';
import ManageEmailGroups from '../CreateDestination/ManageEmailGroups';
import { getAllowList } from '../../utils/helpers';
import { DESTINATION_TYPE } from '../../utils/constants';

class DestinationsList extends React.Component {
  constructor(props) {
    super(props);

    const { from, size, search, sortField, sortDirection, type } = getURLQueryParams(
      props.location
    );

    this.state = {
      showDeleteConfirmation: false,
      isDestinationLoading: true,
      destinations: [],
      destinationToDelete: undefined,
      totalDestinations: 0,
      page: Math.floor(from / size),
      queryParams: {
        size,
        search,
        sortField,
        sortDirection,
        type,
      },
      selectedItems: [],
      allowList: [],
      showManageSenders: false,
      showManageEmailGroups: false,
    };

    this.columns = [
      ...staticColumns,
      {
        name: 'Actions',
        width: '35px',
        actions: [
          {
            name: 'Edit',
            description: 'Edit this destination.',
            enabled: this.isEditEnabled,
            onClick: this.handleEditDestination,
          },
          {
            name: 'Delete',
            description: 'Delete this destination.',
            onClick: this.handleDeleteAction,
          },
        ],
      },
    ];
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !_.isEqual(
        { page: prevState.page, ...prevState.queryParams },
        { page: this.state.page, ...this.state.queryParams }
      )
    ) {
      const { page, queryParams } = this.state;
      this.getDestinations(page * queryParams.size, queryParams);
    }
  }

  async componentDidMount() {
    const { httpClient } = this.props;
    const allowList = await getAllowList(httpClient);
    this.setState({ allowList });

    const { page, queryParams } = this.state;
    this.getDestinations(page * queryParams.size, queryParams);
  }

  isEmailAllowed = () => {
    const { allowList } = this.state;
    return allowList.includes(DESTINATION_TYPE.EMAIL);
  };

  isDeleteAllowed = async (type, id) => {
    const { httpClient } = this.props;
    const requestBody = {
      query: isDeleteAllowedQuery(type, id),
      index: INDEX.SCHEDULED_JOBS,
    };
    const resp = await httpClient.post('../api/alerting/monitors/_search', {
      body: JSON.stringify(requestBody),
    });
    const total = _.get(resp, 'resp.hits.total.value');
    return total === 0;
  };

  handleDeleteAction = async (destinationToDelete) => {
    const { id, type } = destinationToDelete;
    const allowDelete = await this.isDeleteAllowed(type, id);
    if (allowDelete) {
      this.setState({
        showDeleteConfirmation: true,
        destinationToDelete,
      });
    } else {
      this.setState({
        destinationConsumedByOthers: true,
        destinationToDelete,
      });
      //dismiss callout after 30 Seconds
      setTimeout(
        () => this.setState({ destinationConsumedByOthers: false, destinationToDelete: null }),
        5000
      );
    }
  };

  handleDeleteDestination = async () => {
    const { id: destinationId } = this.state.destinationToDelete;
    const { httpClient } = this.props;
    try {
      const resp = await httpClient.delete(`../api/alerting/destinations/${destinationId}`);
      if (resp.ok) {
        await this.getDestinations();
      } else {
        // TODO::handle error
        //Something went wrong unable to delete if trying to delete already deleted destination
        console.log('Unable to delete destination');
      }
      this.setState({
        showDeleteConfirmation: false,
        destinationToDelete: null,
      });
    } catch (e) {
      console.log('unable to delete destination', e);
    }
  };

  isEditEnabled = (destination) => {
    const { allowList } = this.state;
    // Prevent editing disallowed Destination types since dependent API (like in the case of Email)
    // may be blocked in this case, not making it possible to load the Edit page
    return allowList.includes(destination.type);
  };

  handleEditDestination = (destinationToEdit) => {
    this.props.history.push({
      pathname: `destinations/${destinationToEdit.id}`,
      search: `?action=${DESTINATION_ACTIONS.UPDATE_DESTINATION}`,
      state: { destinationToEdit },
    });
  };

  handleSearchChange = (e) => {
    const searchText = e.target.value;
    this.setState((state) => ({
      page: 0,
      queryParams: { ...state.queryParams, search: searchText },
    }));
  };

  handleTypeChange = (e) => {
    const type = e.target.value;
    this.setState((state) => {
      return {
        page: 0,
        queryParams: { ...state.queryParams, type },
      };
    });
  };

  getDestinations = _.debounce(
    async (from, params) => {
      this.setState({
        isDestinationLoading: true,
      });
      const { history, httpClient } = this.props;
      const queryParms = queryString.stringify({ from, ...params });
      history.replace({
        ...this.props.location,
        search: queryParms,
      });
      try {
        const resp = await httpClient.get('../api/alerting/destinations', {
          query: { from, ...params },
        });
        if (resp.ok) {
          this.setState({
            isDestinationLoading: false,
            destinations: resp.destinations,
            totalDestinations: resp.totalDestinations,
          });
        } else {
          this.setState({
            isDestinationLoading: false,
          });
        }
      } catch (err) {
        console.error('Unable to get destinations', err);
      }
    },
    500,
    { leading: true }
  );

  handlePageChange = ({ page: tablePage = {}, sort = {} }) => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;

    this.setState((state) => ({
      page,
      queryParams: {
        ...state.queryParams,
        size,
        sortField,
        sortDirection,
      },
    }));
  };

  handlePageClick = (page) => {
    this.setState({ page });
  };

  handleResetFilter = () => {
    this.setState((state) => ({
      ...state,
      queryParams: {
        ...state.queryParams,
        search: '',
        type: 'ALL',
      },
    }));
  };

  hideManageSendersModal = () => {
    this.setState({ showManageSenders: false });
  };

  hideManageEmailGroupsModal = () => {
    this.setState({ showManageEmailGroups: false });
  };

  render() {
    const { httpClient, notifications } = this.props;
    const {
      destinationToDelete,
      page,
      queryParams: { size, search, type, sortDirection, sortField },
      totalDestinations,
      isDestinationLoading,
      destinationConsumedByOthers,
      allowList,
    } = this.state;
    const isFilterApplied = !!search || type !== 'ALL';
    const pagination = {
      pageIndex: page,
      pageSize: size,
      totalItemCount: Math.min(MAX_DESTINATIONS, totalDestinations),
      pageSizeOptions: [5, 10, 20, 50],
    };
    const sorting = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };
    return (
      <React.Fragment>
        {destinationConsumedByOthers ? (
          <EuiCallOut
            title={`Couldn't delete destination ${destinationToDelete.name}. One or more monitors uses this destination.`}
            iconType="cross"
            color="danger"
          />
        ) : null}
        <ContentPanel
          bodyStyles={{ padding: 'initial' }}
          title="Destinations"
          actions={
            <DestinationsActions
              isEmailAllowed={this.isEmailAllowed()}
              onClickManageSenders={() => {
                this.setState({ showManageSenders: true });
              }}
              onClickManageEmailGroups={() => {
                this.setState({ showManageEmailGroups: true });
              }}
            />
          }
        >
          <DeleteConfirmation
            isVisible={this.state.showDeleteConfirmation}
            onCancel={() => {
              this.setState({ showDeleteConfirmation: false });
            }}
            onConfirm={this.handleDeleteDestination}
          />

          <ManageSenders
            httpClient={httpClient}
            isEmailAllowed={this.isEmailAllowed()}
            isVisible={this.state.showManageSenders}
            onClickCancel={this.hideManageSendersModal}
            onClickSave={this.hideManageSendersModal}
            notifications={notifications}
          />

          <ManageEmailGroups
            httpClient={httpClient}
            isEmailAllowed={this.isEmailAllowed()}
            isVisible={this.state.showManageEmailGroups}
            onClickCancel={this.hideManageEmailGroupsModal}
            onClickSave={this.hideManageEmailGroupsModal}
            notifications={notifications}
          />

          <DestinationsControls
            activePage={page}
            pageCount={Math.ceil(totalDestinations / size) || 1}
            search={search}
            type={type}
            onSearchChange={this.handleSearchChange}
            onTypeChange={this.handleTypeChange}
            onPageClick={this.handlePageClick}
            allowList={allowList}
          />
          <EuiHorizontalRule margin="xs" />
          <EuiBasicTable
            columns={this.columns}
            hasActions={true}
            isSelectable={true}
            items={this.state.destinations}
            pagination={pagination}
            noItemsMessage={
              isDestinationLoading ? (
                'Loading destinations...'
              ) : (
                <EmptyDestinations
                  isFilterApplied={isFilterApplied}
                  onResetFilters={this.handleResetFilter}
                />
              )
            }
            onChange={this.handlePageChange}
            sorting={sorting}
          />
        </ContentPanel>
      </React.Fragment>
    );
  }
}

DestinationsList.propTypes = {
  httpClient: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  notifications: PropTypes.object.isRequired,
};
export default DestinationsList;
