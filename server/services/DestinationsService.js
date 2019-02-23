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
import { INDEX } from '../../utils/constants';

export default class DestinationsService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  createDestination = async (req, res) => {
    try {
      const params = { body: JSON.stringify(req.payload) };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const createResponse = await callWithRequest(req, 'alerting.createDestination', params);
      res({ ok: true, resp: createResponse });
    } catch (err) {
      console.error('Alerting - DestinationService - createDestination:', err);
      res({ ok: false, resp: err.message });
    }
  };

  updateDestination = async (req, res) => {
    try {
      const { destinationId } = req.params;
      const { version } = req.query;
      const params = {
        body: JSON.stringify(req.payload),
        destinationId,
        version,
      };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const updateResponse = await callWithRequest(req, 'alerting.updateDestination', params);
      const { _version, _id } = updateResponse;
      if (_version === parseInt(version, 10) + 1) {
        res({ ok: true, version: _version, id: _id });
      } else {
        res({ ok: false, resp: updateResponse });
      }
    } catch (err) {
      console.error('Alerting - DestinationService - updateDestination:', err);
      res({ ok: false, resp: err.message });
    }
  };

  deleteDestination = async (req, res) => {
    try {
      const { destinationId } = req.params;
      const params = { destinationId };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const response = await callWithRequest(req, 'alerting.deleteDestination', params);
      res({ ok: response.result === 'deleted' });
    } catch (err) {
      console.error('Alerting - DestinationService - deleteDestination:', err);
      res({ ok: false, resp: err.message });
    }
  };

  getDestination = async (req, res) => {
    const { destinationId } = req.params;
    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
    try {
      const resp = await callWithRequest(req, 'get', {
        index: INDEX.SCHEDULED_JOBS,
        type: '_doc',
        id: destinationId,
      });
      res({ ok: true, destination: resp._source.destination, version: resp._version });
    } catch (err) {
      console.error('Alerting - DestinationService - getDestination:', err);
      res({ ok: false, resp: err.message });
    }
  };

  getDestinations = async (req, res) => {
    const {
      from = 0,
      size = 20,
      search = '',
      sortDirection = 'desc',
      sortField = 'name',
      type = 'ALL',
    } = req.query;

    const filterQueries = [];
    // Index is being used with logical doc types, filtering only destinations
    const mustQueries = [
      {
        exists: {
          field: 'destination',
        },
      },
    ];

    if (type !== 'ALL') {
      filterQueries.push({ term: { 'destination.type': type } });
    }

    if (search.trim()) {
      mustQueries.push({
        query_string: {
          fields: ['destination.name', 'destination.type'],
          default_operator: 'AND',
          query: `*${search
            .trim()
            .split(' ')
            .join('* *')}*`,
        },
      });
    }

    const sortQueryMap = {
      name: { 'destination.name.keyword': sortDirection },
      type: { 'destination.type.keyword': sortDirection },
    };

    let sort = [];
    const sortQuery = sortQueryMap[sortField];
    if (sortQuery) sort = sortQuery;

    const params = {
      index: INDEX.SCHEDULED_JOBS,
      version: true,
      body: {
        sort,
        size,
        from,
        query: {
          bool: {
            filter: filterQueries,
            must: mustQueries,
          },
        },
      },
    };

    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
    try {
      const resp = await callWithRequest(req, 'search', params);
      const totalDestinations = resp.hits.total;
      const destinations = resp.hits.hits.map(hit => {
        const { _source: destination, _id: id, _version: version } = hit;
        return { id, ...destination.destination, version };
      });
      res({ ok: true, destinations, totalDestinations });
    } catch (err) {
      res({ ok: false, err: err.message });
    }
  };
}
