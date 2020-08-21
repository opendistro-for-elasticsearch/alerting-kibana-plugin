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

export default class EmailGroupService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  createEmailGroup = async (req, h) => {
    try {
      const params = { body: JSON.stringify(req.payload) };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const createResponse = await callWithRequest(req, 'alerting.createEmailGroup', params);
      return { ok: true, resp: createResponse };
    } catch (err) {
      console.error('Alerting - EmailGroupService - createEmailGroup:', err);
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
      console.error('Alerting - EmailGroupService - updateEmailGroup:', err);
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
      console.error('Alerting - EmailGroupService - deleteEmailGroup:', err);
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
      console.error('Alerting - EmailGroupService - getEmailGroup:', err);
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
            query: `*${search
              .trim()
              .split(' ')
              .join('* *')}*`,
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
      const emailGroups = _.get(getResponse, 'hits.hits', []).map(result => {
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
      return { ok: false, err: err.message };
    }
  };
}
