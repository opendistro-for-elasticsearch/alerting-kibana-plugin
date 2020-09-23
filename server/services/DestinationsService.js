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
    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.ALERTING);
    try {
      const params = {
        destinationId,
      };
      const resp = await callWithRequest(req, 'alerting.getDestination', params);

      const destination = resp.destinations[0];
      const version = destination.schema_version;
      const ifSeqNo = destination.seq_no;
      const ifPrimaryTerm = destination.primary_term;

      return { ok: true, destination, version, ifSeqNo, ifPrimaryTerm };
    } catch (err) {
      console.error('Alerting - DestinationService - getDestination:', err);
      return { ok: false, resp: err.message };
    }
  };

  getDestinations = async (req, h) => {
    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.ALERTING);

    const { from = 0, size = 20, sortDirection = 'desc', sortField = 'start_time' } = req.query;

    var params;
    switch (sortField) {
      case 'name':
        params = {
          sortString: 'destination.name.keyword',
          sortOrder: sortDirection,
        };
        break;
      case 'type':
        params = {
          sortString: 'destination.type',
          sortOrder: sortDirection,
        };
        break;
    }
    params.startIndex = from;
    params.size = size;

    try {
      const resp = await callWithRequest(req, 'alerting.searchDestinations', params);

      const destinations = resp.destinations.map((hit) => {
        const destination = hit;
        const id = destination.id;
        const version = destination.schema_version;
        const ifSeqNo = destination.seq_no;
        const ifPrimaryTerm = destination.primary_term;
        return { id, ...destination, version, ifSeqNo, ifPrimaryTerm };
      });

      const totalDestinations = 7;

      return { ok: true, destinations, totalDestinations };
    } catch (err) {
      return { ok: false, err: err.message };
    }
  };
}
