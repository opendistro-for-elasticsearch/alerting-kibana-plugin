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

  createDestination = async (req, h) => {
    try {
      const params = { body: JSON.stringify(req.payload) };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const createResponse = await callWithRequest(req, 'alerting.createDestination', params);
      return { ok: true, resp: createResponse };
    } catch (err) {
      console.error('Alerting - DestinationService - createDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  updateDestination = async (req, h) => {
    try {
      const { destinationId } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      const params = {
        body: JSON.stringify(req.payload),
        destinationId,
        ifSeqNo,
        ifPrimaryTerm,
      };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const updateResponse = await callWithRequest(req, 'alerting.updateDestination', params);
      const { _version, _id } = updateResponse;
      return { ok: true, version: _version, id: _id };
    } catch (err) {
      console.error('Alerting - DestinationService - updateDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  deleteDestination = async (req, h) => {
    try {
      const { destinationId } = req.params;
      const params = { destinationId };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ALERTING);
      const response = await callWithRequest(req, 'alerting.deleteDestination', params);
      return { ok: response.result === 'deleted' };
    } catch (err) {
      console.error('Alerting - DestinationService - deleteDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  getDestination = async (req, h) => {
    const { destinationId } = req.params;
    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
    try {
      const resp = await callWithRequest(req, 'get', {
        index: INDEX.SCHEDULED_JOBS,
        id: destinationId,
      });
      const { _source, _seq_no: ifSeqNo, _primary_term: ifPrimaryTerm, _version: version } = resp;
      return { ok: true, destination: _source.destination, version, ifSeqNo, ifPrimaryTerm };
    } catch (err) {
      console.error('Alerting - DestinationService - getDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  getDestinations = async (req, h) => {
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
      type: { 'destination.type': sortDirection },
    };

    let sort = [];
    const sortQuery = sortQueryMap[sortField];
    if (sortQuery) sort = sortQuery;

    const params = {
      index: INDEX.SCHEDULED_JOBS,
      version: true,
      seq_no_primary_term: true,
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
      const totalDestinations = resp.hits.total.value;
      const destinations = resp.hits.hits.map(hit => {
        const {
          _source: destination,
          _id: id,
          _version: version,
          _seq_no: ifSeqNo,
          _primary_term: ifPrimaryTerm,
        } = hit;
        return { id, ...destination.destination, version, ifSeqNo, ifPrimaryTerm };
      });
      return { ok: true, destinations, totalDestinations };
    } catch (err) {
      return { ok: false, err: err.message };
    }
  };
}
