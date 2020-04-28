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

  search = async (req, h) => {
    try {
      const { query, index, size } = req.payload;
      const params = { index, size, body: query };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const results = await callWithRequest(req, 'search', params);
      return { ok: true, resp: results };
    } catch (err) {
      console.error('Alerting - ElasticsearchService - search', err);
      return { ok: false, resp: err.message };
    }
  };

  getIndices = async (req, h) => {
    try {
      const { index } = req.payload;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const indices = await callWithRequest(req, 'cat.indices', {
        index,
        format: 'json',
        h: 'health,index,status',
      });
      return { ok: true, resp: indices };
    } catch (err) {
      // Elasticsearch throws an index_not_found_exception which we'll treat as a success
      if (err.statusCode === 404) {
        return { ok: true, resp: [] };
      } else {
        console.error('Alerting - ElasticsearchService - getIndices:', err);
        return { ok: false, resp: err.message };
      }
    }
  };

  getAliases = async (req, h) => {
    try {
      const { alias } = req.payload;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const aliases = await callWithRequest(req, 'cat.aliases', {
        alias,
        format: 'json',
        h: 'alias,index',
      });
      return { ok: true, resp: aliases };
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getAliases:', err);
      return { ok: false, resp: err.message };
    }
  };

  getMappings = async (req, h) => {
    try {
      const { index } = req.payload;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const mappings = await callWithRequest(req, 'indices.getMapping', { index });
      return { ok: true, resp: mappings };
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getMappings:', err);
      return { ok: false, resp: err.message };
    }
  };
  getPlugins = async (req, h) => {
    try {
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const plugins = await callWithRequest(req, 'cat.plugins', {
        format: 'json',
        h: 'component',
      });
      return { ok: true, resp: plugins };
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getPlugins:', err);
      return { ok: false, resp: err.message };
    }
  };
}
