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

import _ from 'lodash';

import { CLUSTER } from './utils/constants';
import { INDEX } from '../../utils/constants';

export default class DestinationsService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  createDestination = async (req, h) => {
    try {
      const params = { body: JSON.stringify(req.payload) };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const createResponse = await callWithRequest(req, 'alerting.createDestination', params);
      return { ok: true, resp: createResponse };
    } catch (err) {
      console.error('Alerting - DestinationService - createDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  updateDestination = async (req, h) => {
    try {
      const { destinationId } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = {
        body: JSON.stringify(req.payload),
        destinationId,
        ifSeqNo,
        ifPrimaryTerm,
      };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const updateResponse = await callWithRequest(req, 'alerting.updateDestination', params);
      const { _version, _id } = updateResponse;
      return { ok: true, version: _version, id: _id };
    } catch (err) {
      console.error('Alerting - DestinationService - updateDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  deleteDestination = async (req, h) => {
    try {
      const { destinationId } = req.params;
      const params = { destinationId };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const response = await callWithRequest(req, 'alerting.deleteDestination', params);
      return { ok: response.result === 'deleted' };
    } catch (err) {
      console.error('Alerting - DestinationService - deleteDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  getDestination = async (req, h) => {
    const { destinationId } = req.params;
    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.ALERTING);
    try {
      const params = {
        destinationId,
      };
      const resp = await callWithRequest(req, 'alerting.getDestination', params);

      const destination = resp.destinations[0];
      const version = destination.schema_version;
      const ifSeqNo = destination.seq_no;
      const ifPrimaryTerm = destination.primary_term;

      return { ok: true, destination, version, ifSeqNo, ifPrimaryTerm };
    } catch (err) {
      console.error('Alerting - DestinationService - getDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  getDestinations = async (req, h) => {
    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.ALERTING);

    const {
      from = 0,
      size = 20,
      search = '',
      sortDirection = 'desc',
      sortField = 'start_time',
      type = 'ALL',
    } = req.query;

    var params;
    switch (sortField) {
      case 'name':
        params = {
          sortString: 'destination.name.keyword',
          sortOrder: sortDirection,
        };
        break;
      case 'type':
        params = {
          sortString: 'destination.type',
          sortOrder: sortDirection,
        };
        break;
      default:
        params = {};
        break;
    }
    params.startIndex = from;
    params.size = size;
    params.searchString = search;
    if (search.trim()) params.searchString = `*${search.trim().split(' ').join('* *')}*`;

    try {
      const resp = await callWithRequest(req, 'alerting.searchDestinations', params);

      const destinations = resp.destinations.map((hit) => {
        const destination = hit;
        const id = destination.id;
        const version = destination.schema_version;
        const ifSeqNo = destination.seq_no;
        const ifPrimaryTerm = destination.primary_term;
        return { id, ...destination, version, ifSeqNo, ifPrimaryTerm };
      });

      const totalDestinations = resp.totalDestinations;

      return { ok: true, destinations, totalDestinations };
    } catch (err) {
      return { ok: false, err: err.message };
    }
  };

  /**
   *  -----------------------------------------------------
   *  ----------------- Email Account API -----------------
   *  -----------------------------------------------------
   */

  createEmailAccount = async (req, h) => {
    try {
      const params = { body: JSON.stringify(req.payload) };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const createResponse = await callWithRequest(req, 'alerting.createEmailAccount', params);
      return { ok: true, resp: createResponse };
    } catch (err) {
      console.error('Alerting - DestinationService - createEmailAccount:', err);
      return { ok: false, resp: err.message };
    }
  };

  updateEmailAccount = async (req, h) => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = {
        emailAccountId: id,
        ifSeqNo,
        ifPrimaryTerm,
        body: JSON.stringify(req.payload),
      };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const updateResponse = await callWithRequest(req, 'alerting.updateEmailAccount', params);
      const { _id } = updateResponse;
      return { ok: true, id: _id };
    } catch (err) {
      console.error('Alerting - DestinationService - updateEmailAccount:', err);
      return { ok: false, resp: err.message };
    }
  };

  deleteEmailAccount = async (req, h) => {
    try {
      const { id } = req.params;
      const params = { emailAccountId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const deleteResponse = await callWithRequest(req, 'alerting.deleteEmailAccount', params);
      return { ok: deleteResponse.result === 'deleted' };
    } catch (err) {
      console.error('Alerting - DestinationService - deleteEmailAccount:', err);
      return { ok: false, resp: err.message };
    }
  };

  getEmailAccount = async (req, h) => {
    try {
      const { id } = req.params;
      const params = { emailAccountId: id };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.ALERTING);
      const getResponse = await callWithRequest(req, 'alerting.getEmailAccount', params);
      const emailAccount = _.get(getResponse, 'email_account', null);
      const ifSeqNo = _.get(getResponse, '_seq_no', null);
      const ifPrimaryTerm = _.get(getResponse, '_primary_term', null);
      if (emailAccount) {
        return { ok: true, resp: emailAccount, ifSeqNo, ifPrimaryTerm };
      } else {
        return { ok: false };
      }
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailAccount:', err);
      return { ok: false, resp: err.message };
    }
  };

  getEmailAccounts = async (req, h) => {
    try {
      const {
        from = 0,
        size = 20,
        search = '',
        sortDirection = 'desc',
        sortField = 'name',
      } = req.query;

      let must = { match_all: {} };
      if (search.trim()) {
        must = {
          query_string: {
            default_field: 'email_account.name',
            default_operator: 'AND',
            query: `*${search.trim().split(' ').join('* *')}*`,
          },
        };
      }

      const sortQueryMap = { name: { 'email_account.name.keyword': sortDirection } };

      let sort = [];
      const sortQuery = sortQueryMap[sortField];
      if (sortQuery) sort = sortQuery;

      const params = {
        body: {
          from,
          size,
          sort,
          query: {
            bool: {
              must,
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const getResponse = await callWithRequest(req, 'alerting.getEmailAccounts', params);

      const totalEmailAccounts = _.get(getResponse, 'hits.total.value', 0);
      const emailAccounts = _.get(getResponse, 'hits.hits', []).map((result) => {
        const {
          _id: id,
          _seq_no: ifSeqNo,
          _primary_term: ifPrimaryTerm,
          _source: emailAccount,
        } = result;
        return { id, ...emailAccount, ifSeqNo, ifPrimaryTerm };
      });
      return { ok: true, emailAccounts, totalEmailAccounts };
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailAccounts:', err);
      return { ok: false, err: err.message };
    }
  };

  /**
   *  -----------------------------------------------------
   *  ----------------- Email Group API -------------------
   *  -----------------------------------------------------
   */

  createEmailGroup = async (req, h) => {
    try {
      const params = { body: JSON.stringify(req.payload) };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const createResponse = await callWithRequest(req, 'alerting.createEmailGroup', params);
      return { ok: true, resp: createResponse };
    } catch (err) {
      console.error('Alerting - DestinationService - createEmailGroup:', err);
      return { ok: false, resp: err.message };
    }
  };

  updateEmailGroup = async (req, h) => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = {
        emailGroupId: id,
        ifSeqNo,
        ifPrimaryTerm,
        body: JSON.stringify(req.payload),
      };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const updateResponse = await callWithRequest(req, 'alerting.updateEmailGroup', params);
      const { _id } = updateResponse;
      return { ok: true, id: _id };
    } catch (err) {
      console.error('Alerting - DestinationService - updateEmailGroup:', err);
      return { ok: false, resp: err.message };
    }
  };

  deleteEmailGroup = async (req, h) => {
    try {
      const { id } = req.params;
      const params = { emailGroupId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const deleteResponse = await callWithRequest(req, 'alerting.deleteEmailGroup', params);
      return { ok: deleteResponse.result === 'deleted' };
    } catch (err) {
      console.error('Alerting - DestinationService - deleteEmailGroup:', err);
      return { ok: false, resp: err.message };
    }
  };

  getEmailGroup = async (req, h) => {
    try {
      const { id } = req.params;
      const params = { emailGroupId: id };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.ALERTING);
      const getResponse = await callWithRequest(req, 'alerting.getEmailGroup', params);
      const emailGroup = _.get(getResponse, 'email_group', null);
      const ifSeqNo = _.get(getResponse, '_seq_no', null);
      const ifPrimaryTerm = _.get(getResponse, '_primary_term', null);
      if (emailGroup) {
        return { ok: true, resp: emailGroup, ifSeqNo, ifPrimaryTerm };
      } else {
        return { ok: false };
      }
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailGroup:', err);
      return { ok: false, resp: err.message };
    }
  };

  getEmailGroups = async (req, h) => {
    try {
      const {
        from = 0,
        size = 20,
        search = '',
        sortDirection = 'desc',
        sortField = 'name',
      } = req.query;

      let must = { match_all: {} };
      if (search.trim()) {
        must = {
          query_string: {
            default_field: 'email_group.name',
            default_operator: 'AND',
            query: `*${search.trim().split(' ').join('* *')}*`,
          },
        };
      }

      const sortQueryMap = { name: { 'email_group.name.keyword': sortDirection } };

      let sort = [];
      const sortQuery = sortQueryMap[sortField];
      if (sortQuery) sort = sortQuery;

      const params = {
        body: {
          from,
          size,
          sort,
          query: {
            bool: {
              must,
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const getResponse = await callWithRequest(req, 'alerting.getEmailGroups', params);

      const totalEmailGroups = _.get(getResponse, 'hits.total.value', 0);
      const emailGroups = _.get(getResponse, 'hits.hits', []).map((result) => {
        const {
          _id: id,
          _seq_no: ifSeqNo,
          _primary_term: ifPrimaryTerm,
          _source: emailGroup,
        } = result;
        return { id, ...emailGroup, ifSeqNo, ifPrimaryTerm };
      });
      return { ok: true, emailGroups, totalEmailGroups };
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailGroups:', err);
      return { ok: false, err: err.message };
    }
  };
}
