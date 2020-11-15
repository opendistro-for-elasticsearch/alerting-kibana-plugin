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
import PropTypes from 'prop-types';
import _ from 'lodash';
import { EuiHealth, EuiHighlight } from '@elastic/eui';

import { FormikComboBox } from '../../../../components/FormControls';
import { validateIndex, hasError, isInvalid } from '../../../../utils/validate';
import { canAppendWildcard, createReasonableWait, getMatchedOptions } from './utils/helpers';

const CustomOption = ({ option, searchValue, contentClassName }) => {
  const { health, label, index } = option;
  const isAlias = !!index;
  const healthToColor = {
    green: 'success',
    yellow: 'warning',
    red: 'danger',
    undefined: 'subdued',
  };
  const color = healthToColor[health];
  return (
    <EuiHealth color={color}>
      <span className={contentClassName}>
        <EuiHighlight search={searchValue}>{label}</EuiHighlight>
        {isAlias && <span>&nbsp;({index})</span>}
      </span>
    </EuiHealth>
  );
};

const propTypes = {
  httpClient: PropTypes.object.isRequired,
};

class MonitorIndex extends React.Component {
  constructor(props) {
    super(props);

    this.lastQuery = null;
    this.state = {
      isLoading: false,
      appendedWildcard: false,
      showingIndexPatternQueryErrors: false,
      options: [],
      allIndices: [],
      partialMatchedIndices: [],
      exactMatchedIndices: [],
      allAliases: [],
      partialMatchedAliases: [],
      exactMatchedAliases: [],
    };

    this.onCreateOption = this.onCreateOption.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.handleQueryIndices = this.handleQueryIndices.bind(this);
    this.handleQueryAliases = this.handleQueryAliases.bind(this);
    this.onFetch = this.onFetch.bind(this);
  }

  componentDidMount() {
    // Simulate initial load.
    this.onSearchChange('');
  }

  onCreateOption(searchValue, selectedOptions, setFieldValue) {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) return;

    const newOption = { label: searchValue };
    setFieldValue('index', selectedOptions.concat(newOption));
  }

  async onSearchChange(searchValue) {
    const { appendedWildcard } = this.state;
    let query = searchValue;
    if (query.length === 1 && canAppendWildcard(query)) {
      query += '*';
      this.setState({ appendedWildcard: true });
    } else {
      if (query === '*' && appendedWildcard) {
        query = '';
        this.setState({ appendedWildcard: false });
      }
    }

    this.lastQuery = query;
    this.setState({ query, showingIndexPatternQueryErrors: !!query.length });

    await this.onFetch(query);
  }

  async handleQueryIndices(rawIndex) {
    const index = rawIndex.trim();

    // Searching for `*:` fails for CCS environments. The search request
    // is worthless anyways as the we should only send a request
    // for a specific query (where we do not append *) if there is at
    // least a single character being searched for.
    if (index === '*:') {
      return [];
    }

    // This should never match anything so do not bother
    if (index === '') {
      return [];
    }
    try {
      const response = await this.props.httpClient.post('../api/alerting/_indices', {
        body: JSON.stringify(index),
      });
      if (response.ok) {
        const indices = response.resp.map(({ health, index, status }) => ({
          label: index,
          health,
          status,
        }));
        return _.sortBy(indices, 'label');
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async handleQueryAliases(rawAlias) {
    const alias = rawAlias.trim();

    if (alias === '*:') {
      return [];
    }

    if (alias === '') {
      return [];
    }

    try {
      const response = await this.props.httpClient.post('../api/alerting/_aliases', {
        body: JSON.stringify(alias),
      });
      if (response.ok) {
        const indices = response.resp.map(({ alias, index }) => ({ label: alias, index }));
        return _.sortBy(indices, 'label');
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async onFetch(query) {
    this.setState({ isLoading: true, indexPatternExists: false });
    if (query.endsWith('*')) {
      const exactMatchedIndices = await this.handleQueryIndices(query);
      const exactMatchedAliases = await this.handleQueryAliases(query);
      createReasonableWait(() => {
        // If the search changed, discard this state
        if (query !== this.lastQuery) {
          return;
        }
        this.setState({ exactMatchedIndices, exactMatchedAliases, isLoading: false });
      });
    } else {
      const partialMatchedIndices = await this.handleQueryIndices(`${query}*`);
      const exactMatchedIndices = await this.handleQueryIndices(query);
      const partialMatchedAliases = await this.handleQueryAliases(`${query}*`);
      const exactMatchedAliases = await this.handleQueryAliases(query);
      createReasonableWait(() => {
        // If the search changed, discard this state
        if (query !== this.lastQuery) {
          return;
        }

        this.setState({
          partialMatchedIndices,
          exactMatchedIndices,
          partialMatchedAliases,
          exactMatchedAliases,
          isLoading: false,
        });
      });
    }
  }

  renderOption(option, searchValue, contentClassName) {
    return (
      <CustomOption option={option} searchValue={searchValue} contentClassName={contentClassName} />
    );
  }

  render() {
    const {
      isLoading,
      allIndices,
      partialMatchedIndices,
      exactMatchedIndices,
      allAliases,
      partialMatchedAliases,
      exactMatchedAliases,
    } = this.state;

    const { visibleOptions } = getMatchedOptions(
      allIndices, //all indices
      partialMatchedIndices,
      exactMatchedIndices,
      allAliases,
      partialMatchedAliases,
      exactMatchedAliases,
      false //isIncludingSystemIndices
    );

    return (
      <FormikComboBox
        name="index"
        formRow
        fieldProps={{ validate: validateIndex }}
        rowProps={{
          label: 'Index',
          helpText: 'You can use a * as a wildcard in your index pattern',
          isInvalid,
          error: hasError,
          style: { paddingLeft: '10px' },
        }}
        inputProps={{
          placeholder: 'Select indices',
          async: true,
          isLoading,
          options: visibleOptions,
          onBlur: (e, field, form) => {
            form.setFieldTouched('index', true);
          },
          onChange: (options, field, form) => {
            form.setFieldValue('index', options);
          },
          onCreateOption: (value, field, form) => {
            this.onCreateOption(value, field.value, form.setFieldValue);
          },
          onSearchChange: this.onSearchChange,
          renderOption: this.renderOption,
          isClearable: true,
          'data-test-subj': 'indicesComboBox',
        }}
      />
    );
  }
}

MonitorIndex.propTypes = propTypes;

export default MonitorIndex;
