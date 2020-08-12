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
import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiLink,
  EuiButton,
  EuiFormRowProps,
  EuiTitle,
} from '@elastic/eui';
// import {
//     ForExpression,
//     OfExpression,
//     OverExpression,
//     WhenExpression,
//     WhereExpression,
//     } from './expressions';
import ContentPanel from '../../ContentPanel';

export function toString(obj) {
  // render calls this method.  During different lifecylces, obj can be undefined
  if (typeof obj != 'undefined') {
    if (obj.hasOwnProperty('period')) {
      let period = obj.period;
      return period.interval + ' ' + period.unit.toLowerCase();
    } else if (typeof obj == 'number') {
      // epoch
      return moment(obj).format('MM/DD/YY hh:mm A');
    }
  }
  return '-';
}

export class FilterDisplay extends React.Component {
  constructor(props) {
    super(props);
  }
  getModalVisibilityChange = () => {
    return this.state.showCodeModel;
  };
  render() {
    let filter = this.props;
    console.log('filter: ' + filter);
    if (filter === 'all fields are included') {
      return (
        <EuiText>
          <p className="enabled">-</p>
        </EuiText>
      );
    } else {
      return <EuiText>{filter}</EuiText>;
    }
  }
}

const FixedWidthRow = (props) => <EuiFormRow {...props} style={{ width: '150px' }} />;

const ConfigCell = (props) => {
  return (
    <FixedWidthRow label={props.title}>
      <EuiText>
        <p className="enabled">{props.description}</p>
      </EuiText>
    </FixedWidthRow>
  );
};

const createDetector = (context) => ({
  flyoutProps: {
    'aria-labelledby': 'createDetectorFlyout',
    maxWidth: 500,
    size: 'm',
  },
  headerProps: { hasBorder: true },
  header: (
    <EuiTitle size="m" style={{ fontSize: '25px' }}>
      <h2>
        <strong>Create Detector</strong>
      </h2>
    </EuiTitle>
  ),
  body: (
    <ContentPanel title="Detector Configuration Preview" titleSize="s">
      <EuiFlexGrid columns={2} gutterSize="l" style={{ border: 'none' }}>
        <EuiFlexItem>
          <ConfigCell title="Name" description={context.name} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="Description" description={context.description} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="Data source index" description={context.indices} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell
            title="Detector interval"
            description={toString(context.detection_interval)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="Window delay" description={toString(context.window_delay)} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="Data filter" description={context.filter_query} />
        </EuiFlexItem>
      </EuiFlexGrid>
    </ContentPanel>
  ),
});

export default createDetector;
