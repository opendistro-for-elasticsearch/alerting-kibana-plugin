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
import { CLUSTER } from './utils/constants';

export default class ElasticsearchService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  search = async (req, reply) => {
    try {
      const { query, index, size } = req.payload;
      const params = { index, size, body: query };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const results = await callWithRequest(req, 'search', params);
      reply({ ok: true, resp: results });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - search', err);
      reply({ ok: false, resp: err.message });
    }
  };

  getIndices = async (req, reply) => {
    try {
      const { index } = req.payload;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const indices = await callWithRequest(req, 'cat.indices', {
        index,
        format: 'json',
        h: 'health,index,status',
      });
      reply({ ok: true, resp: indices });
    } catch (err) {
      // Elasticsearch throws an index_not_found_exception which we'll treat as a success
      if (err.statusCode === 404) {
        reply({ ok: true, resp: [] });
      } else {
        console.error('Alerting - ElasticsearchService - getIndices:', err);
        reply({ ok: false, resp: err.message });
      }
    }
  };

  getAliases = async (req, reply) => {
    try {
      const { alias } = req.payload;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const aliases = await callWithRequest(req, 'cat.aliases', {
        alias,
        format: 'json',
        h: 'alias,index',
      });
      reply({ ok: true, resp: aliases });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getAliases:', err);
      reply({ ok: false, resp: err.message });
    }
  };

  getMappings = async (req, reply) => {
    try {
      const { index } = req.payload;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const mappings = await callWithRequest(req, 'indices.getMapping', { index });
      reply({ ok: true, resp: mappings });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getMappings:', err);
      reply({ ok: false, resp: err.message });
    }
  };
}
