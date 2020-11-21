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

import {
  isInvalid,
  hasError,
  validateActionName,
  validateMonitorName,
  validatePositiveInteger,
  validateUnit,
  validateMonthlyDay,
  ILLEGAL_CHARACTERS,
  validateIndex,
  isIndexPatternQueryValid,
} from './validate';

const httpClient = {
  post: jest.fn(),
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('isInvalid', () => {
  test('returns true if error and touched', () => {
    const form = { touched: { test: true }, errors: { test: 'error' } };
    const name = 'test';
    expect(isInvalid(name, form)).toBe(true);
  });

  test('returns false if error and not touched', () => {
    const form = { touched: { test: false }, errors: { test: 'error' } };
    const name = 'test';
    expect(isInvalid(name, form)).toBe(false);
  });

  test('returns false if no error and touched', () => {
    const form = { touched: { test: true }, errors: {} };
    const name = 'test';
    expect(isInvalid(name, form)).toBe(false);
  });

  test('returns false if no error and not touched', () => {
    const form = { touched: {}, errors: {} };
    const name = 'test';
    expect(isInvalid(name, form)).toBe(false);
  });
});

describe('hasError', () => {
  test('returns undefined if no error', () => {
    const form = { touched: {}, errors: {} };
    const name = 'test';
    expect(hasError(name, form)).toBeUndefined();
  });

  test('returns error if exists', () => {
    const form = { touched: {}, errors: { test: 'This is error' } };
    const name = 'test';
    expect(hasError(name, form)).toBe(form.errors.test);
  });
});

describe('validateActionName', () => {
  const trigger = {
    name: 'trigger_name',
    actions: [{ name: 'foo' }, { name: 'bar' }],
  };
  test('returns undefined if no error', () => {
    expect(validateActionName(trigger)('valid action name')).toBeUndefined();
  });

  test('returns Required string if falsy value', () => {
    expect(validateActionName(trigger)()).toBe('Required');
    expect(validateActionName(trigger)('')).toBe('Required');
  });

  trigger.actions.push({ name: 'foo' });
  test('returns already used if action name is already used', () => {
    expect(validateActionName(trigger)('foo')).toBe('Action name is already used');
  });
});

describe('validateMonitorName', () => {
  httpClient.post.mockResolvedValue({ resp: { hits: { total: 0 } } });
  test('returns undefined if no error', () => {
    expect(validateMonitorName(httpClient, {})('valid monitor name')).resolves.toBeUndefined();
  });

  test('returns Required string if falsy value', () => {
    validateMonitorName(httpClient, {})().catch((err) => expect(err).toEqual('Required'));
    validateMonitorName(httpClient, {})('').catch((err) => expect(err).toEqual('Required'));
  });
});

describe('validatePositiveInteger', () => {
  test('returns undefined if no error', () => {
    expect(validatePositiveInteger(1)).toBeUndefined();
    expect(validatePositiveInteger(100)).toBeUndefined();
  });

  test('returns error string if invalid value', () => {
    const invalidText = 'Must be a positive integer';
    expect(validatePositiveInteger(-5)).toBe(invalidText);
    expect(validatePositiveInteger(0)).toBe(invalidText);
    expect(validatePositiveInteger(1.5)).toBe(invalidText);
    expect(validatePositiveInteger(true)).toBe(invalidText);
    expect(validatePositiveInteger(false)).toBe(invalidText);
    expect(validatePositiveInteger('5')).toBe(invalidText);
  });
});

describe('validateUnit', () => {
  test('returns undefined if no error', () => {
    expect(validateUnit('MINUTES')).toBeUndefined();
    expect(validateUnit('HOURS')).toBeUndefined();
    expect(validateUnit('DAYS')).toBeUndefined();
  });

  test('returns error string if invalid value', () => {
    const invalidText = 'Must be one of minutes, hours, days';
    expect(validateUnit(5)).toBe(invalidText);
    expect(validateUnit('RANDOM')).toBe(invalidText);
    expect(validateUnit(null)).toBe(invalidText);
    expect(validateUnit(true)).toBe(invalidText);
    expect(validateUnit(false)).toBe(invalidText);
  });
});

describe('validateMonthlyDay', () => {
  test('returns undefined if no error', () => {
    expect(validateMonthlyDay(1)).toBeUndefined();
    expect(validateMonthlyDay(17)).toBeUndefined();
    expect(validateMonthlyDay(31)).toBeUndefined();
  });

  test('returns error string if invalid value', () => {
    const invalidText = 'Must be a positive integer between 1-31';
    expect(validateMonthlyDay(-5)).toBe(invalidText);
    expect(validateMonthlyDay(0)).toBe(invalidText);
    expect(validateMonthlyDay(1.5)).toBe(invalidText);
    expect(validateMonthlyDay(32)).toBe(invalidText);
    expect(validateMonthlyDay('RANDOM')).toBe(invalidText);
    expect(validateMonthlyDay(null)).toBe(invalidText);
    expect(validateMonthlyDay(true)).toBe(invalidText);
    expect(validateMonthlyDay(false)).toBe(invalidText);
    expect(validateMonthlyDay('17')).toBe(invalidText);
  });
});

describe('isIndexPatternQueryValid', () => {
  test('returns true if valid pattern', () => {
    expect(isIndexPatternQueryValid('good', ILLEGAL_CHARACTERS)).toBe(true);
    expect(isIndexPatternQueryValid('.good', ILLEGAL_CHARACTERS)).toBe(true);
    expect(isIndexPatternQueryValid('good*', ILLEGAL_CHARACTERS)).toBe(true);
  });

  test('returns false if falsy pattern', () => {
    expect(isIndexPatternQueryValid('', ILLEGAL_CHARACTERS)).toBe(false);
    expect(isIndexPatternQueryValid(undefined, ILLEGAL_CHARACTERS)).toBe(false);
    expect(isIndexPatternQueryValid(null, ILLEGAL_CHARACTERS)).toBe(false);
    expect(isIndexPatternQueryValid(false, ILLEGAL_CHARACTERS)).toBe(false);
  });

  test('returns false if pattern is . or ..', () => {
    expect(isIndexPatternQueryValid('.', ILLEGAL_CHARACTERS)).toBe(false);
    expect(isIndexPatternQueryValid('..', ILLEGAL_CHARACTERS)).toBe(false);
  });

  test.each(ILLEGAL_CHARACTERS)('returns false if pattern contains %s', (char) => {
    expect(isIndexPatternQueryValid(`random${char}pattern`, ILLEGAL_CHARACTERS)).toBe(false);
  });
});

describe('validateIndex', () => {
  test('returns undefined if valid index options', () => {
    expect(validateIndex([{ label: 'valid-index' }, { label: 'valid*' }])).toBeUndefined();
  });

  test('returns error string if non array is passed in', () => {
    const invalidText = 'Must specify an index';
    expect(validateIndex(1)).toBe(invalidText);
    expect(validateIndex(null)).toBe(invalidText);
    expect(validateIndex('test')).toBe(invalidText);
    expect(validateIndex({})).toBe(invalidText);
  });

  test('returns error string if empty array', () => {
    const invalidText = 'Must specify an index';
    expect(validateIndex([])).toBe(invalidText);
  });

  test('returns error string if invalid index pattern', () => {
    const illegalCharacters = ILLEGAL_CHARACTERS.join(' ');
    const invalidText = `One of your inputs contains invalid characters or spaces. Please omit: ${illegalCharacters}`;
    expect(validateIndex([{ label: 'valid- index$' }])).toBe(invalidText);
  });
});
