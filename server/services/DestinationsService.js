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

export default class DestinationsService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  createDestination = async (context, req, res) => {
    try {
      const params = { body: JSON.stringify(req.body) };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const createResponse = await callAsCurrentUser('alerting.createDestination', params);
      return res.ok({
        body: {
          ok: true,
          resp: createResponse,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - createDestination:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  updateDestination = async (context, req, res) => {
    try {
      const { destinationId } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = {
        body: JSON.stringify(req.body),
        destinationId,
        ifSeqNo,
        ifPrimaryTerm,
      };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const updateResponse = await callAsCurrentUser('alerting.updateDestination', params);
      const { _version, _id } = updateResponse;
      return res.ok({
        body: {
          ok: true,
          version: _version,
          id: _id,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - updateDestination:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  deleteDestination = async (context, req, res) => {
    try {
      const { destinationId } = req.params;
      const params = { destinationId };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const response = await callAsCurrentUser('alerting.deleteDestination', params);
      return res.ok({
        body: {
          ok: response.result === 'deleted',
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - deleteDestination:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getDestination = async (context, req, res) => {
    const { destinationId } = req.params;
    const { callAsCurrentUser } = this.esDriver.asScoped(req);
    try {
      const params = {
        destinationId,
      };
      const resp = await callAsCurrentUser('alerting.getDestination', params);

      const destination = resp.destinations[0];
      const version = destination.schema_version;
      const ifSeqNo = destination.seq_no;
      const ifPrimaryTerm = destination.primary_term;

      return res.ok({
        body: {
          ok: true,
          destination,
          version,
          ifSeqNo,
          ifPrimaryTerm,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - getDestination:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getDestinations = async (context, req, res) => {
    const { callAsCurrentUser } = this.esDriver.asScoped(req);

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
    params.destinationType = type;

    try {
      const resp = await callAsCurrentUser('alerting.searchDestinations', params);

      const destinations = resp.destinations.map((hit) => {
        const destination = hit;
        const id = destination.id;
        const version = destination.schema_version;
        const ifSeqNo = destination.seq_no;
        const ifPrimaryTerm = destination.primary_term;
        return { id, ...destination, version, ifSeqNo, ifPrimaryTerm };
      });

      const totalDestinations = resp.totalDestinations;

      return res.ok({
        body: {
          ok: true,
          destinations,
          totalDestinations,
        },
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  /**
   *  -----------------------------------------------------
   *  ----------------- Email Account API -----------------
   *  -----------------------------------------------------
   */

  createEmailAccount = async (context, req, res) => {
    try {
      const params = { body: JSON.stringify(req.body) };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const createResponse = await callAsCurrentUser('alerting.createEmailAccount', params);
      return res.ok({
        body: {
          ok: true,
          resp: createResponse,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - createEmailAccount:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  updateEmailAccount = async (context, req, res) => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = {
        emailAccountId: id,
        ifSeqNo,
        ifPrimaryTerm,
        body: JSON.stringify(req.body),
      };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const updateResponse = await callAsCurrentUser('alerting.updateEmailAccount', params);
      const { _id } = updateResponse;
      return res.ok({
        body: {
          ok: true,
          id: _id,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - updateEmailAccount:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  deleteEmailAccount = async (context, req, res) => {
    try {
      const { id } = req.params;
      const params = { emailAccountId: id };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const deleteResponse = await callAsCurrentUser('alerting.deleteEmailAccount', params);
      return res.ok({
        body: {
          ok: deleteResponse.result === 'deleted',
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - deleteEmailAccount:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getEmailAccount = async (context, req, res) => {
    try {
      const { id } = req.params;
      const params = { emailAccountId: id };
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const getResponse = await callAsCurrentUser('alerting.getEmailAccount', params);
      const emailAccount = _.get(getResponse, 'email_account', null);
      const ifSeqNo = _.get(getResponse, '_seq_no', null);
      const ifPrimaryTerm = _.get(getResponse, '_primary_term', null);
      if (emailAccount) {
        return resp.ok({
          body: {
            ok: true,
            resp: emailAccount,
            ifSeqNo,
            ifPrimaryTerm,
          },
        });
      } else {
        return res.ok({
          body: {
            ok: false,
          },
        });
      }
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailAccount:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getEmailAccounts = async (context, req, res) => {
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

      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const getResponse = await callAsCurrentUser('alerting.getEmailAccounts', params);

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
      return res.ok({
        body: {
          ok: true,
          emailAccounts,
          totalEmailAccounts,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailAccounts:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  /**
   *  -----------------------------------------------------
   *  ----------------- Email Group API -------------------
   *  -----------------------------------------------------
   */

  createEmailGroup = async (context, req, res) => {
    try {
      const params = { body: JSON.stringify(req.body) };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const createResponse = await callAsCurrentUser('alerting.createEmailGroup', params);
      return res.ok({
        body: {
          ok: true,
          resp: createResponse,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - createEmailGroup:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  updateEmailGroup = async (context, req, res) => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = {
        emailGroupId: id,
        ifSeqNo,
        ifPrimaryTerm,
        body: JSON.stringify(req.body),
      };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const updateResponse = await callAsCurrentUser('alerting.updateEmailGroup', params);
      const { _id } = updateResponse;
      return res.ok({
        body: {
          ok: true,
          id: _id,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - updateEmailGroup:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  deleteEmailGroup = async (context, req, res) => {
    try {
      const { id } = req.params;
      const params = { emailGroupId: id };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const deleteResponse = await callAsCurrentUser('alerting.deleteEmailGroup', params);
      return res.ok({
        body: {
          ok: deleteResponse.result === 'deleted',
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - deleteEmailGroup:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getEmailGroup = async (context, req, res) => {
    try {
      const { id } = req.params;
      const params = { emailGroupId: id };
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const getResponse = await callAsCurrentUser('alerting.getEmailGroup', params);
      const emailGroup = _.get(getResponse, 'email_group', null);
      const ifSeqNo = _.get(getResponse, '_seq_no', null);
      const ifPrimaryTerm = _.get(getResponse, '_primary_term', null);
      if (emailGroup) {
        return resp.ok({
          body: {
            ok: true,
            resp: emailGroup,
            ifSeqNo,
            ifPrimaryTerm,
          },
        });
      } else {
        return res.ok({
          body: {
            ok: false,
          },
        });
      }
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailGroup:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getEmailGroups = async (context, req, res) => {
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

      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const getResponse = await callAsCurrentUser('alerting.getEmailGroups', params);

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
      return res.ok({
        body: {
          ok: true,
          emailGroups,
          totalEmailGroups,
        },
      });
    } catch (err) {
      console.error('Alerting - DestinationService - getEmailGroups:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };
}
