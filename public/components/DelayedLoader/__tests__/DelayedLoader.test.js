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
import DelayedLoader from '../DelayedLoader';

describe('<DelayedLoader/>', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('renders', () => {
    expect(
      render(
        <DelayedLoader isLoading={false}>
          {showLoader => <div style={{ opacity: showLoader ? '0.2' : '1' }} />}
        </DelayedLoader>
      )
    ).toMatchSnapshot();
  });

  test('should set Timer for 1 seconds if initial loading is true', () => {
    const wrapper = mount(
      <DelayedLoader isLoading={true}>
        {showLoader => <div style={{ opacity: showLoader ? '0.2' : '1' }} />}
      </DelayedLoader>
    );
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    expect(wrapper).toMatchSnapshot();
  });
  test('should clear Timer on componentWillUnmount if exists', () => {
    const wrapper = mount(
      <DelayedLoader isLoading={true}>
        {showLoader => <div style={{ opacity: showLoader ? '0.2' : '1' }} />}
      </DelayedLoader>
    );
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    wrapper.unmount();
    expect(clearTimeout).toHaveBeenCalledTimes(1);
  });

  test('should not show loader if data fetching is finished before threshold', () => {
    const wrapper = mount(
      <DelayedLoader isLoading={true}>
        {showLoader => <div style={{ opacity: showLoader ? '0.2' : '1' }} />}
      </DelayedLoader>
    );
    wrapper.setProps({ isLoading: false });
    expect(clearTimeout).toHaveBeenCalledTimes(1);
    expect(wrapper).toMatchSnapshot();
  });

  test('should show loader if data fetching takes more than threshold', () => {
    const wrapper = mount(
      <DelayedLoader isLoading={false}>
        {showLoader => <div style={{ opacity: showLoader ? '0.2' : '1' }} />}
      </DelayedLoader>
    );
    wrapper.setProps({ isLoading: true });
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  test('should throw an error if children is not function', () => {
    expect(() => {
      render(
        <DelayedLoader isLoading={false}>
          <div />
        </DelayedLoader>
      );
    }).toThrow('Children should be function');
  });
});
