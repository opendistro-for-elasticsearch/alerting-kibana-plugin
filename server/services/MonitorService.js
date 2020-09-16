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

export default class MonitorService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  createMonitor = async (req, h) => {
    try {
      const parameters = {
        type: 'monitor',
        name: req.payload.name,
        enabled: req.payload.enabled,
        schedule: req.payload.schedule,
        inputs: req.payload.inputs,
        triggers: req.payload.triggers,
        ui_metadata: req.payload.ui_metadata,
      };

      const credentials = req.auth.credentials.credentials.authHeaderValue;
      require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
      const https = require('https');
      var sslRootCAs = require('ssl-root-cas/latest');
      sslRootCAs.inject();

      const options = {
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kibana',
          Authorization: credentials,
        },
      };

      function createMonitor() {
        return new Promise((resolve, reject) => {
          const requestCreateMonitor = https.request(
            'https://localhost:9200/_opendistro/_alerting/monitors',
            options,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          requestCreateMonitor.write(JSON.stringify(parameters));
          requestCreateMonitor.end();
        });
      }
      const createResponse = await createMonitor().then((response) => response);

      return { ok: true, resp: createResponse };
    } catch (err) {
      console.error('Alerting - MonitorService - createMonitor:', err);
      return { ok: false, resp: err.message };
    }
  };

  deleteMonitor = async (req, h) => {
    try {
      const { id } = req.params;

      const credentials = req.auth.credentials.credentials.authHeaderValue;
      require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
      const https = require('https');
      var sslRootCAs = require('ssl-root-cas/latest');
      sslRootCAs.inject();

      const options = {
        method: 'DELETE',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kibana',
          Authorization: credentials,
        },
      };

      function deleteMonitor() {
        return new Promise((resolve, reject) => {
          const requestDeleteMonitor = https.request(
            'https://localhost:9200/_opendistro/_alerting/monitors/' + id,
            options,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          requestDeleteMonitor.end();
        });
      }
      await deleteMonitor().then((response) => response);

      return { ok: true };
    } catch (err) {
      console.error('Alerting - MonitorService - deleteMonitor:', err);
      return { ok: false, resp: err.message };
    }
  };

  getMonitor = async (req, h) => {
    try {
      const { id } = req.params;

      const credentials = req.auth.credentials.credentials.authHeaderValue;
      require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
      const https = require('https');
      var sslRootCAs = require('ssl-root-cas/latest');
      sslRootCAs.inject();

      const options = {
        method: 'GET',
        rejectUnauthorized: false,
        headers: { 'User-Agent': 'Kibana', Authorization: credentials },
      };

      function getMonitor() {
        return new Promise((resolve, reject) => {
          const requestGetMonitor = https.get(
            'https://localhost:9200/_opendistro/_alerting/monitors/' + id,
            options,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          requestGetMonitor.end();
        });
      }
      const rep = await getMonitor().then((response) => response);

      const monitor = rep.monitor;
      const version = rep.version;
      const seqNo = rep.seqNo;
      const primaryTerm = req.primaryTerm;

      if (monitor) {
        const searchParameters = {
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
        };

        const optionsSearch = {
          method: 'POST',
          rejectUnauthorized: false,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Kibana',
            Authorization: credentials,
          },
        };

        function searchMonitor() {
          return new Promise((resolve, reject) => {
            const requestSearchMonitor = https.request(
              'https://localhost:9200/_opendistro/_alerting/monitors/_search',
              optionsSearch,
              (res) => {
                let str = '';

                res.on('data', (d) => {
                  str += d;
                });

                res.on('end', (d) => {
                  try {
                    const payload = JSON.parse(str);
                    resolve(payload);
                  } catch (e) {
                    reject(e.message);
                  }
                });

                res.on('error', function (e) {
                  console.log('problem with request ' + e.message);
                });
              }
            );
            requestSearchMonitor.write(JSON.stringify(searchParameters));
            requestSearchMonitor.end();
          });
        }
        const searchResponse = await searchMonitor().then((response) => response);

        const activeCount = _.get(
          searchResponse,
          'aggregations.24_hour_count.buckets.0.doc_count',
          0
        );
        const dayCount = _.get(searchResponse, 'aggregations.24_hour_count.buckets.0.doc_count', 0);

        return { ok: true, resp: monitor, activeCount, dayCount, version, seqNo, primaryTerm };
      } else {
        return { ok: false };
      }
    } catch (err) {
      console.error('Alerting - MonitorService - getMonitor:', err);
      return { ok: false, resp: err.message };
    }
  };

  updateMonitor = async (req, h) => {
    try {
      const { id } = req.params;

      const parameters = {
        type: 'monitor',
        name: req.payload.name,
        enabled: req.payload.enabled,
        schedule: req.payload.schedule,
        inputs: req.payload.inputs,
        triggers: req.payload.triggers,
        last_update_time: req.payload.last_update_time,
        ui_metadata: req.payload.ui_metadata,
      };

      const credentials = req.auth.credentials.credentials.authHeaderValue;
      require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
      const https = require('https');
      var sslRootCAs = require('ssl-root-cas/latest');
      sslRootCAs.inject();

      const options = {
        method: 'PUT',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kibana',
          Authorization: credentials,
        },
      };

      function updateMonitor() {
        return new Promise((resolve, reject) => {
          const requestUpdateMonitor = https.request(
            'https://localhost:9200/_opendistro/_alerting/monitors/' + id,
            options,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          requestUpdateMonitor.write(JSON.stringify(parameters));
          requestUpdateMonitor.end();
        });
      }
      const updateResponse = await updateMonitor().then((response) => response);
      const { _version, _id } = updateResponse;
      return { ok: true, version: _version, id: _id };
    } catch (err) {
      console.error('Alerting - MonitorService - updateMonitor:', err);
      return { ok: false, resp: err.message };
    }
  };

  getMonitors = async (req, h) => {
    try {
      const { from, size, search, sortDirection, sortField, state } = req.query;
      const credentials = req.auth.credentials.credentials.authHeaderValue;

      require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
      const https = require('https');
      var sslRootCAs = require('ssl-root-cas/latest');
      sslRootCAs.inject();

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

      const monitorDataParameter = JSON.stringify({
        seq_no_primary_term: true,
        version: true,
        ...monitorSortPageData,
        query: {
          bool: {
            filter,
            must,
          },
        },
      });

      const options = {
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kibana',
          Authorization: credentials,
        },
      };

      function getMonitorsData() {
        return new Promise((resolve, reject) => {
          const requestMonitorsData = https.request(
            'https://localhost:9200/_opendistro/_alerting/monitors/_search',
            options,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          requestMonitorsData.write(monitorDataParameter);
          requestMonitorsData.end();
        });
      }
      const getResponse = await getMonitorsData().then((response) => response);

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

      const aggsParameters = {
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
      };

      const optionsAggs = {
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kibana',
          Authorization: credentials,
          Index: '.opendistro-alerting-alert*',
        },
      };

      function getAggsResponse() {
        return new Promise((resolve, reject) => {
          const aggsRequest = https.request(
            'https://localhost:9200/_opendistro/_alerting/monitors/_search',
            optionsAggs,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          aggsRequest.write(JSON.stringify(aggsParameters));
          aggsRequest.end();
        });
      }
      const esAggsResponse = await getAggsResponse().then((response) => response);

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

      return {
        ok: true,
        monitors: results,
        totalMonitors,
      };
    } catch (err) {
      console.error('Alerting - MonitorService - getMonitors', err);
      return { ok: false, resp: err.message };
    }
  };

  acknowledgeAlerts = async (req, h) => {
    try {
      const { id } = req.params;
      const params = {
        monitorId: id,
        body: JSON.stringify(req.payload),
      };

      const credentials = req.auth.credentials.credentials.authHeaderValue;
      require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
      const https = require('https');
      var sslRootCAs = require('ssl-root-cas/latest');
      sslRootCAs.inject();

      const options = {
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kibana',
          Authorization: credentials,
        },
      };

      function ackAlert() {
        return new Promise((resolve, reject) => {
          const requestAckAlert = https.request(
            'https://localhost:9200/_opendistro/_alerting/monitors/' + id + '/_acknowledge/alerts',
            options,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          requestAckAlert.write(JSON.stringify(req.payload));
          requestAckAlert.end();
        });
      }
      const result = await ackAlert().then((response) => response);

      return { ok: !result.failed.length, resp: result };
    } catch (err) {
      console.error('Alerting - MonitorService - acknowledgeAlerts:', err);
      return { ok: false, resp: err.message };
    }
  };

  executeMonitor = async (req, h) => {
    try {
      const credentials = req.auth.credentials.credentials.authHeaderValue;
      require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
      const https = require('https');
      var sslRootCAs = require('ssl-root-cas/latest');
      sslRootCAs.inject();

      const options = {
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kibana',
          Authorization: credentials,
        },
      };

      function executeMonitor() {
        return new Promise((resolve, reject) => {
          const requestExecuteMonitor = https.request(
            'https://localhost:9200/_opendistro/_alerting/monitors/_execute?dryrun=true',
            options,
            (res) => {
              let str = '';

              res.on('data', (d) => {
                str += d;
              });

              res.on('end', (d) => {
                try {
                  const payload = JSON.parse(str);
                  resolve(payload);
                } catch (e) {
                  reject(e.message);
                }
              });

              res.on('error', function (e) {
                console.log('problem with request ' + e.message);
              });
            }
          );
          requestExecuteMonitor.write(JSON.stringify(req.payload));
          requestExecuteMonitor.end();
        });
      }
      const executeResponse = await executeMonitor().then((response) => response);
      return { ok: true, resp: executeResponse };
    } catch (err) {
      console.error('Alerting - MonitorService - executeMonitor:', err);
      return { ok: false, resp: err.message };
    }
  };
}
