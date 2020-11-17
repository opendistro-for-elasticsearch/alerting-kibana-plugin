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

import { INDEX } from '../../utils/constants';

export default class MonitorService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  createMonitor = async (context, req, res) => {
    try {
      const params = { body: JSON.stringify(req.body) };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const createResponse = await callAsCurrentUser('alerting.createMonitor', params);
      return res.ok({
        body: {
          ok: true,
          resp: createResponse,
        },
      });
    } catch (err) {
      console.error('Alerting - MonitorService - createMonitor:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  deleteMonitor = async (context, req, res) => {
    try {
      const { id } = req.params;
      const params = { monitorId: id };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const response = await callAsCurrentUser('alerting.deleteMonitor', params);
      return res.ok({
        body: {
          ok: response.result === 'deleted',
        },
      });
    } catch (err) {
      console.error('Alerting - MonitorService - deleteMonitor:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getMonitor = async (context, req, res) => {
    try {
      const { id } = req.params;
      const params = { monitorId: id };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const getResponse = await callAsCurrentUser('alerting.getMonitor', params);
      const monitor = _.get(getResponse, 'monitor', null);
      const version = _.get(getResponse, '_version', null);
      const ifSeqNo = _.get(getResponse, '_seq_no', null);
      const ifPrimaryTerm = _.get(getResponse, '_primary_term', null);
      if (monitor) {
        const { callAsCurrentUser } = this.esDriver.asScoped(req);
        const searchResponse = await callAsCurrentUser('alerting.getMonitors', {
          index: INDEX.ALL_ALERTS,
          body: {
            size: 0,
            query: {
              bool: {
                must: {
                  term: {
                    monitor_id: id,
                  },
                },
              },
            },
            aggs: {
              active_count: {
                terms: {
                  field: 'state',
                },
              },
              '24_hour_count': {
                date_range: {
                  field: 'start_time',
                  ranges: [{ from: 'now-24h/h' }],
                },
              },
            },
          },
        });
        const dayCount = _.get(searchResponse, 'aggregations.24_hour_count.buckets.0.doc_count', 0);
        const activeBuckets = _.get(searchResponse, 'aggregations.active_count.buckets', []);
        const activeCount = activeBuckets.reduce(
          (acc, curr) => (curr.key === 'ACTIVE' ? curr.doc_count : acc),
          0
        );
        return res.ok({
          body: { ok: true, resp: monitor, activeCount, dayCount, version, ifSeqNo, ifPrimaryTerm },
        });
      } else {
        return res.ok({
          body: {
            ok: false,
          },
        });
      }
    } catch (err) {
      console.error('Alerting - MonitorService - getMonitor:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  updateMonitor = async (context, req, res) => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = { monitorId: id, ifSeqNo, ifPrimaryTerm, body: JSON.stringify(req.body) };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const updateResponse = await callAsCurrentUser('alerting.updateMonitor', params);
      const { _version, _id } = updateResponse;
      return res.ok({
        body: {
          ok: true,
          version: _version,
          id: _id,
        },
      });
    } catch (err) {
      console.error('Alerting - MonitorService - updateMonitor:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  getMonitors = async (context, req, res) => {
    try {
      const { from, size, search, sortDirection, sortField, state } = req.query;

      let must = { match_all: {} };
      if (search.trim()) {
        // This is an expensive wildcard query to match monitor names such as: "This is a long monitor name"
        // search query => "long monit"
        // This is acceptable because we will never allow more than 1,000 monitors
        must = {
          query_string: {
            default_field: 'monitor.name',
            default_operator: 'AND',
            query: `*${search.trim().split(' ').join('* *')}*`,
          },
        };
      }

      const filter = [{ term: { 'monitor.type': 'monitor' } }];
      if (state !== 'all') {
        const enabled = state === 'enabled';
        filter.push({ term: { 'monitor.enabled': enabled } });
      }

      const monitorSorts = { name: 'monitor.name.keyword' };
      const monitorSortPageData = { size: 1000 };
      if (monitorSorts[sortField]) {
        monitorSortPageData.sort = [{ [monitorSorts[sortField]]: sortDirection }];
        monitorSortPageData.size = _.defaultTo(size, 1000);
        monitorSortPageData.from = _.defaultTo(from, 0);
      }

      const params = {
        body: JSON.stringify({
          seq_no_primary_term: true,
          version: true,
          ...monitorSortPageData,
          query: {
            bool: {
              filter,
              must,
            },
          },
        }),
      };

      const { callAsCurrentUser: alertingCallAsCurrentUser } = await this.esDriver.asScoped(req);
      const getResponse = await alertingCallAsCurrentUser('alerting.getMonitors', params);

      const totalMonitors = _.get(getResponse, 'hits.total.value', 0);
      const monitorKeyValueTuples = _.get(getResponse, 'hits.hits', []).map((result) => {
        const {
          _id: id,
          _version: version,
          _seq_no: ifSeqNo,
          _primary_term: ifPrimaryTerm,
          _source: monitor,
        } = result;
        const { name, enabled } = monitor;
        return [id, { id, version, ifSeqNo, ifPrimaryTerm, name, enabled, monitor }];
      }, {});
      const monitorMap = new Map(monitorKeyValueTuples);
      const monitorIds = [...monitorMap.keys()];

      const aggsOrderData = {};
      const aggsSorts = {
        active: 'active',
        acknowledged: 'acknowledged',
        errors: 'errors',
        ignored: 'ignored',
        lastNotificationTime: 'last_notification_time',
      };
      if (aggsSorts[sortField]) {
        aggsOrderData.order = { [aggsSorts[sortField]]: sortDirection };
      }
      const aggsParams = {
        index: INDEX.ALL_ALERTS,
        body: {
          size: 0,
          query: { terms: { monitor_id: monitorIds } },
          aggregations: {
            uniq_monitor_ids: {
              terms: {
                field: 'monitor_id',
                ...aggsOrderData,
                size: from + size,
              },
              aggregations: {
                active: { filter: { term: { state: 'ACTIVE' } } },
                acknowledged: { filter: { term: { state: 'ACKNOWLEDGED' } } },
                errors: { filter: { term: { state: 'ERROR' } } },
                ignored: {
                  filter: {
                    bool: {
                      filter: { term: { state: 'COMPLETED' } },
                      must_not: { exists: { field: 'acknowledged_time' } },
                    },
                  },
                },
                last_notification_time: { max: { field: 'last_notification_time' } },
                latest_alert: {
                  top_hits: {
                    size: 1,
                    sort: [{ start_time: { order: 'desc' } }],
                    _source: {
                      includes: ['last_notification_time', 'trigger_name'],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const esAggsResponse = await callAsCurrentUser('alerting.getMonitors', aggsParams);
      const buckets = _.get(esAggsResponse, 'aggregations.uniq_monitor_ids.buckets', []).map(
        (bucket) => {
          const {
            key: id,
            last_notification_time: { value: lastNotificationTime },
            ignored: { doc_count: ignored },
            acknowledged: { doc_count: acknowledged },
            active: { doc_count: active },
            errors: { doc_count: errors },
            latest_alert: {
              hits: {
                hits: [
                  {
                    _source: { trigger_name: latestAlert },
                  },
                ],
              },
            },
          } = bucket;
          const monitor = monitorMap.get(id);
          monitorMap.delete(id);
          return {
            ...monitor,
            id,
            lastNotificationTime,
            ignored,
            latestAlert,
            acknowledged,
            active,
            errors,
            currentTime: Date.now(),
          };
        }
      );

      const unusedMonitors = [...monitorMap.values()].map((monitor) => ({
        ...monitor,
        lastNotificationTime: null,
        ignored: 0,
        active: 0,
        acknowledged: 0,
        errors: 0,
        latestAlert: '--',
        currentTime: Date.now(),
      }));

      let results = _.orderBy(buckets.concat(unusedMonitors), [sortField], [sortDirection]);
      // If we sorted on monitor name then we already applied from/size to the first query to limit what we're aggregating over
      // Therefore we do not need to apply from/size to this result set
      // If we sorted on aggregations, then this is our in memory pagination
      if (!monitorSorts[sortField]) {
        results = results.slice(from, from + size);
      }

      return res.ok({
        body: {
          ok: true,
          monitors: results,
          totalMonitors,
        },
      });
    } catch (err) {
      console.error('Alerting - MonitorService - getMonitors', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  acknowledgeAlerts = async (context, req, res) => {
    try {
      const { id } = req.params;
      const params = {
        monitorId: id,
        body: JSON.stringify(req.body),
      };
      const { callAsCurrentUser } = this.esDriver.asScoped(req);
      const acknowledgeResponse = await callAsCurrentUser('alerting.acknowledgeAlerts', params);
      return res.ok({
        body: {
          ok: !acknowledgeResponse.failed.length,
          resp: acknowledgeResponse,
        },
      });
    } catch (err) {
      console.error('Alerting - MonitorService - acknowledgeAlerts:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  executeMonitor = async (context, req, res) => {
    try {
      const { dryrun = 'true' } = req.query;
      const params = {
        body: JSON.stringify(req.body),
        dryrun,
      };
      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const executeResponse = await callAsCurrentUser('alerting.executeMonitor', params);
      return res.ok({
        body: {
          ok: true,
          resp: executeResponse,
        },
      });
    } catch (err) {
      console.error('Alerting - MonitorService - executeMonitor:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };

  //TODO: This is temporarily a pass through call which needs to be deprecated
  searchMonitors = async (context, req, res) => {
    try {
      const { query, index, size } = req.body;
      const params = { index, size, body: query };

      const { callAsCurrentUser } = await this.esDriver.asScoped(req);
      const results = await callAsCurrentUser('alerting.getMonitors', params);
      return res.ok({
        body: {
          ok: true,
          resp: results,
        },
      });
    } catch (err) {
      console.error('Alerting - MonitorService - searchMonitor:', err);
      return res.ok({
        body: {
          ok: false,
          resp: err.message,
        },
      });
    }
  };
}
