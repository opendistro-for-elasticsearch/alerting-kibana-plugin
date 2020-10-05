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

import React from 'react';
import { render, mount } from 'enzyme';
import DestinationsControls from './DestinationsControls';
import { DESTINATION_TYPE } from '../../../utils/constants';

describe('<DestinationsControls />', () => {
  const mockedProps = {
    activePage: 0,
    pageCount: 10,
    onSearchChange: jest.fn(),
    onTypeChange: jest.fn(),
    onPageClick: jest.fn(),
    allowList: Object.values(DESTINATION_TYPE),
  };
  beforeEach(() => jest.resetAllMocks());
  test('should render DestinationsControls', () => {
    const wrapper = render(<DestinationsControls {...mockedProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('should invoke handlers with expected values', () => {
    const wrapper = mount(<DestinationsControls {...mockedProps} />);

    // Validate search field SearchText Changes
    const searchText = 'search destination';
    wrapper
      .find('input')
      .at(0)
      .simulate('change', { target: { value: searchText } });
    expect(mockedProps.onSearchChange).toHaveBeenCalledTimes(1);
    const {
      target: { value: searchValue },
    } = mockedProps.onSearchChange.mock.calls[0][0];
    expect(searchValue).toBe(searchText);

    // Validate destination Type Change
    const typeOptionValue = 'chime';
    wrapper.find('select').simulate('change', { target: { value: typeOptionValue } });
    const {
      target: { value: typeValue },
    } = mockedProps.onTypeChange.mock.calls[0][0];
    expect(typeValue).toBe(typeOptionValue);

    // Validate page navigation, Simulate page Click 3
    wrapper.find('button[data-test-subj="pagination-button-3"]').at(0).simulate('click');
    expect(mockedProps.onPageClick).toHaveBeenCalledTimes(1);
    expect(mockedProps.onPageClick.mock.calls[0][0]).toBe(3);
  });
});
