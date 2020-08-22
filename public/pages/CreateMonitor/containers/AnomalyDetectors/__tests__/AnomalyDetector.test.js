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

import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, wait } from '@testing-library/react';
// @ts-ignore
import userEvent from '@testing-library/user-event';

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

  test('testing library', async () => {
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
    const { container, queryByTestId, getByLabelText, debug } = render(
      <Formik
        initialValues={FORMIK_INITIAL_VALUES}
        render={({ values }) => (
          <AnomalyDetectors
            httpClient={httpClientMock}
            values={values}
            renderEmptyMessage={renderEmptyMessage}
          />
        )}
      />
    );

    // <AnomalyDetectors
    //   httpClient={httpClientMock}
    //   values={{ detectorId: ''}}
    //   renderEmptyMessage={renderEmptyMessage}
    //   detectorId={undefined}
    // />
    debug();

    // const label = getByLabelText("Detector")
    // console.log(label);

    const searchInput = queryByTestId('comboBoxSearchInput');
    console.log(searchInput);

    fireEvent.change(queryByTestId('comboBoxSearchInput'), {
      target: { value: 'sample-detector' },
    });
    fireEvent.keyDown(queryByTestId('comboBoxSearchInput'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });
    fireEvent.keyDown(queryByTestId('comboBoxSearchInput'), { key: 'Enter', code: 'Enter' });

    // const detectorId = findByText(/sampe-detector/)
    // expect(detectorId).equal("sample-id")
  });
});
