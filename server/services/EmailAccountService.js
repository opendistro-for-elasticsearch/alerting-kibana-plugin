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

export default class EmailAccountService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  createEmailAccount = async (req, h) => {
    try {
      const params = { body: JSON.stringify(req.payload) };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const createResponse = await callWithRequest(req, 'alerting.createEmailAccount', params);
      return { ok: true, resp: createResponse };
    } catch (err) {
      console.error('Alerting - EmailAccountService - createEmailAccount:', err);
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
      console.error('Alerting - EmailAccountService - updateEmailAccount:', err);
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
      console.error('Alerting - EmailAccountService - deleteEmailAccount:', err);
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
      console.error('Alerting - EmailAccountService - getEmailAccount:', err);
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
            query: `*${search
              .trim()
              .split(' ')
              .join('* *')}*`,
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
      const emailAccounts = _.get(getResponse, 'hits.hits', []).map(result => {
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
      return { ok: false, err: err.message };
    }
  };
}
