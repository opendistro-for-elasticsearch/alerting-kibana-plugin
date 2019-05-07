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
import { shallow } from 'enzyme';
import { EuiButton } from '@elastic/eui';

import TriggerQuery, { getExecuteMessage } from './TriggerQuery';
import { FORMIK_INITIAL_VALUES } from '../../containers/CreateTrigger/utils/constants';
import { formikToTrigger } from '../../containers/CreateTrigger/utils/formikToTrigger';

const props = {
  context: {},
  executeResponse: null,
  onRun: jest.fn(),
  response: null,
  triggerValues: FORMIK_INITIAL_VALUES,
  setFlyout: jest.fn(),
};

describe('TriggerQuery', () => {
  test('renders', () => {
    const wrapper = shallow(<TriggerQuery {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('calls onRun when clicking Run', () => {
    const wrapper = shallow(<TriggerQuery {...props} />);
    const button = wrapper.find(EuiButton);
    button.simulate('click');
    expect(props.onRun).toHaveBeenCalled();
    expect(props.onRun).toHaveBeenCalledWith([
      { ...formikToTrigger(props.triggerValues), actions: [] },
    ]);
  });
});

describe('getExecuteMessage', () => {
  test('returns No Response for falsy response values', () => {
    const noReponse = 'No response';
    expect(getExecuteMessage(null)).toBe(noReponse);
    expect(getExecuteMessage('')).toBe(noReponse);
  });

  test('returns No trigger results for falsy trigger results values', () => {
    const noTriggerResults = 'No trigger results';
    expect(getExecuteMessage({})).toBe(noTriggerResults);
    expect(getExecuteMessage({ trigger_results: null })).toBe(noTriggerResults);
  });

  test('returns No trigger results for trigger_results with no trigger ids', () => {
    const noTriggerResults = 'No trigger results';
    expect(getExecuteMessage({ trigger_results: {} })).toBe(noTriggerResults);
  });

  test('returns No execute results for fasly trigger value on trigger_results', () => {
    const noTriggerResults = 'No execute results';
    expect(getExecuteMessage({ trigger_results: { trig_id: null } })).toBe(noTriggerResults);
  });

  test('returns triggered value', () => {
    expect(
      getExecuteMessage({ trigger_results: { trig_id: { triggered: true, error: null } } })
    ).toBe('true');
    expect(
      getExecuteMessage({ trigger_results: { trig_id: { triggered: false, error: null } } })
    ).toBe('false');
  });

  test('returns error message', () => {
    expect(
      getExecuteMessage({
        trigger_results: { trig_id: { triggered: true, error: 'RANDOM ERROR' } },
      })
    ).toBe('ERROR: RANDOM ERROR');
  });
});
