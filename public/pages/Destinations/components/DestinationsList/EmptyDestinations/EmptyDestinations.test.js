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
import { mount, render } from 'enzyme';
import EmptyDestinations from './EmptyDestinations';

describe('<EmptyDestinations />', () => {
  test('should render empty destinations message', () => {
    const wrapper = render(
      <EmptyDestinations isFilterApplied={false} onResetFilters={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('should render no results for filter criteria', () => {
    const wrapper = render(<EmptyDestinations isFilterApplied onResetFilters={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('should call reset Filters callback on click of Reset Filters Button', () => {
    const handleResetFilter = jest.fn();
    const wrapper = mount(<EmptyDestinations isFilterApplied onResetFilters={handleResetFilter} />);
    // Simulate Reset button click Click
    wrapper.find('button').simulate('click');
    expect(handleResetFilter).toHaveBeenCalledTimes(1);
  });
});
