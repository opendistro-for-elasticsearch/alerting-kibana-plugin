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
import { Formik } from 'formik';
import { mount } from 'enzyme';

import { FORMIK_INITIAL_VALUES } from '../../CreateMonitor/utils/constants';
import AnomalyDetectors from '../AnomalyDetectors';
import { httpClientMock } from '../../../../../../test/mocks';
import { AppContext } from '../../../../../utils/AppContext';

jest.mock('ui/chrome', () => ({
  getBasePath: () => {
    return 'http://localhost/app';
  },
}));

const renderEmptyMessage = jest.fn();
function getMountWrapper() {
  return mount(
    <AppContext.Provider value={{ httpClient: httpClientMock }}>
      <Formik
        initialValues={FORMIK_INITIAL_VALUES}
        render={({ values }) => (
          <AnomalyDetectors values={values} renderEmptyMessage={renderEmptyMessage} />
        )}
      />
    </AppContext.Provider>
  );
}

describe('AnomalyDetectors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders', () => {
    httpClientMock.post.mockResolvedValue({ data: { ok: true, detectors: [] } });
    const wrapper = getMountWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  test('should be able to select the detector', (done) => {
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        ok: true,
        detectors: [{ name: 'sample-detector', id: 'sample-id', feature_attributes: [] }],
      },
    });
    //Preview mock
    httpClientMock.post.mockResolvedValueOnce({
      data: {
        ok: true,
        response: { anomalyResult: { anomalies: [], featureData: [] }, detector: {} },
      },
    });
    const wrapper = getMountWrapper();
    setTimeout(() => {
      wrapper
        .find('[data-test-subj="comboBoxSearchInput"]')
        .hostNodes()
        .simulate('change', { target: { value: 'sample-detector' } })
        .simulate('keyDown', { key: 'ArrowDown' })
        .simulate('keyDown', { key: 'Enter' });
      expect(wrapper.instance().state.values.detectorId).toEqual('sample-id');
      done();
    });
  });
});
