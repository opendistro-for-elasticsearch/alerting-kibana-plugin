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

import React, { Component } from 'react';
import { connect } from 'formik';
import { EuiPopover, EuiExpression, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

import { POPOVER_STYLE, Expressions, OVER_TYPES, EXPRESSION_STYLE } from './utils/constants';
import { FormikSelect, FormikFieldNumber } from '../../../../../components/FormControls';

class OverExpression extends Component {
  onChangeWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  renderTypeSelect = () => (
    <FormikSelect
      name="overDocuments"
      inputProps={{ onChange: this.onChangeWrapper, options: OVER_TYPES }}
    />
  );

  renderTopFieldNumber = () => (
    <FormikFieldNumber name="groupedOverTop" inputProps={{ onChange: this.onChangeWrapper }} />
  );

  renderTermField = (fields = []) => (
    <FormikSelect
      name="groupedOverFieldName"
      inputProps={{ onChange: this.onChangeWrapper, options: fields }}
    />
  );

  renderOverPopover = () => (
    <div style={{ ...POPOVER_STYLE, ...EXPRESSION_STYLE }}>{this.renderTypeSelect()}</div>
  );

  renderGroupedPopover = () => (
    <div style={POPOVER_STYLE}>
      <EuiFlexGroup
        style={{
          maxWidth: 600,
          width: Math.max(expressionWidth, 180),
          ...EXPRESSION_STYLE,
        }}
      >
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {this.renderTypeSelect()}
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {this.renderTopFieldNumber()}
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 180 }}>
          {this.renderTermField()}
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );

  render() {
    const {
      formik: { values },
      openedStates,
      closeExpression,
      openExpression,
    } = this.props;
    const isGroupedOver = values.overDocuments === 'top';
    const buttonValue = isGroupedOver
      ? `${values.overDocuments} ${values.groupedOverTop} ${values.groupedOverFieldName}`
      : values.overDocuments;
    return (
      <EuiPopover
        id="over-popover"
        button={
          <EuiExpression
            description={isGroupedOver ? 'grouped over' : 'over'}
            value={buttonValue}
            isActive={openedStates.OVER}
            onClick={() => openExpression(Expressions.OVER)}
          />
        }
        isOpen={openedStates.OVER}
        closePopover={() => closeExpression(Expressions.OVER)}
        panelPaddingSize="none"
        ownFocus
        withTitle
        anchorPosition="downLeft"
      >
        {this.renderOverPopover()}
      </EuiPopover>
    );
  }
}

export default connect(OverExpression);
