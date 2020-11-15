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
  constructor(esDriver, logger) {
    this.esDriver = esDriver;
    this.logger = logger;
  }

  search = async (context, req, res) => {
    try {
      const { query, index, size } = req.body;
      const params = { index, size, body: query };
      // const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const results = await callAsCurrentUser('search', params);
      // return { ok: true, resp: results };
      return res.ok({
        body: {
          ok: true,
          resp: results,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - search', err);
      // return { ok: false, resp: err.message };
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getIndices = async (context, req, res) => {
    try {
      const { index } = req.body;
      // const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const indices = await callAsCurrentUser('cat.indices', {
        index,
        format: 'json',
        h: 'health,index,status',
      });
      // return { ok: true, resp: indices };
      return res.ok({
        body: {
          ok: true,
          resp: indices,
        },
      });
    } catch (err) {
      // Elasticsearch throws an index_not_found_exception which we'll treat as a success
      if (err.statusCode === 404) {
        // return { ok: true, resp: [] };
        return res.ok({
          body: {
            ok: true,
            resp: [],
          },
        });
      } else {
        console.error('Alerting - ElasticsearchService - getIndices:', err);
        // return { ok: false, resp: err.message };
        return res.ok({
          body: {
            ok: false,
            resp: err.message,
          },
        });
      }
    }
  };

  getAliases = async (context, req, res) => {
    try {
      const { alias } = req.body;
      // const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(res);
      const aliases = await callWithRequest('cat.aliases', {
        alias,
        format: 'json',
        h: 'alias,index',
      });
      // return { ok: true, resp: aliases };
      return res.ok({
        body: {
          ok: true,
          resp: aliases,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getAliases:', err);
      // return { ok: false, resp: err.message };
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getMappings = async (context, req, res) => {
    try {
      const params = { body: JSON.stringify(req.body) };
      // const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(req);
      const mappings = await callWithRequest('indices.getMapping', params);
      // return { ok: true, resp: mappings };
      return res.ok({
        body: {
          ok: true,
          resp: mappings,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getMappings:', err);
      // return { ok: false, resp: err.message };
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getPlugins = async (context, req, res) => {
    try {
      // const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(req);
      const plugins = await callWithRequest('cat.plugins', {
        format: 'json',
        h: 'component',
      });
      // return { ok: true, resp: plugins };
      return res.custom({
        statusCode: 200,
        body: {
          ok: true,
          resp: plugins,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getPlugins:', err);
      // return { ok: false, resp: err.message };
      return res.custom({
        statusCode: 200,
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getSettings = async (context, req, res) => {
    try {
      // const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const { callAsCurrentUser: callWithRequest } = this.esDriver.asScoped(req);
      const settings = await callWithRequest('cluster.getSettings', {
        include_defaults: 'true',
      });
      // return { ok: true, resp: settings };
      return res.custom({
        statusCode: 200,
        body: {
          ok: true,
          resp: settings,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getSettings:', err);
      // return { ok: false, resp: err.message };
      return res.custom({
        statusCode: 200,
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };
}
