/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React from 'react';
import { mount } from 'enzyme';
import { AnomalyDetectorData } from '../AnomalyDetectorData';
import { httpClientMock } from '../../../../../../test/mocks';
import { CoreContext } from '../../../../../utils/CoreContext';

httpClientMock.get.mockResolvedValue({
  ok: true,
  response: { anomalyResult: { anomalies: [], featureData: [] }, detector: {} },
});

const mockedRender = jest.fn().mockImplementation(() => null);
function getMountWrapper() {
  return mount(
    <CoreContext.Provider value={{ http: httpClientMock }}>
      <AnomalyDetectorData detectorId="randomId" render={mockedRender} />
    </CoreContext.Provider>
  );
}

describe('AnomalyDetectorData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('calls preview api call on mount', () => {
    const getPreviewData = jest.spyOn(AnomalyDetectorData.prototype, 'getPreviewData');
    getMountWrapper();
    expect(getPreviewData).toHaveBeenCalled();
    expect(getPreviewData).toHaveBeenCalledTimes(1);
  });
  test('calls render with anomalyResult', () => {
    const wrapper = getMountWrapper();
    expect(mockedRender).toHaveBeenCalled();
    expect(mockedRender).toHaveBeenCalledWith(wrapper.state());
  });
});
