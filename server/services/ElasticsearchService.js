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

export default class ElasticsearchService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  // TODO: This will be deprecated as we do not want to support accessing alerting indices directly
  //  and that is what this is used for
  search = async (context, req, res) => {
    try {
      const { query, index, size } = req.body;
      const params = { index, size, body: query };
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const results = await callAsCurrentUser('search', params);
      return res.ok({
        body: {
          ok: true,
          resp: results,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - search', err);
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
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const indices = await callAsCurrentUser('cat.indices', {
        index,
        format: 'json',
        h: 'health,index,status',
      });
      return res.ok({
        body: {
          ok: true,
          resp: indices,
        },
      });
    } catch (err) {
      // Elasticsearch throws an index_not_found_exception which we'll treat as a success
      if (err.statusCode === 404) {
        return res.ok({
          body: {
            ok: true,
            resp: [],
          },
        });
      } else {
        console.error('Alerting - ElasticsearchService - getIndices:', err);
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
      const { callAsCurrentUser } = this.esDriver.asScoped(res);
      const aliases = await callAsCurrentUser('cat.aliases', {
        alias,
        format: 'json',
        h: 'alias,index',
      });
      return res.ok({
        body: {
          ok: true,
          resp: aliases,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getAliases:', err);
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
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const mappings = await callAsCurrentUser('indices.getMapping', params);
      return res.ok({
        body: {
          ok: true,
          resp: mappings,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getMappings:', err);
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
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const plugins = await callAsCurrentUser('cat.plugins', {
        format: 'json',
        h: 'component',
      });
      return res.ok({
        body: {
          ok: true,
          resp: plugins,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getPlugins:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getSettings = async (context, req, res) => {
    try {
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const settings = await callAsCurrentUser('cluster.getSettings', {
        include_defaults: 'true',
      });
      return res.ok({
        body: {
          ok: true,
          resp: settings,
        },
      });
    } catch (err) {
      console.error('Alerting - ElasticsearchService - getSettings:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };
}
