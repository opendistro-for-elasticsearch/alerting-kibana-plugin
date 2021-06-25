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
import PropTypes from 'prop-types';
import { connect } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiButtonEmpty,
  EuiText,
  EuiSpacer,
  EuiBadge,
} from '@elastic/eui';
import _ from 'lodash';
import {
  Expressions,
  POPOVER_STYLE,
  EXPRESSION_STYLE,
  WHERE_BOOLEAN_FILTERS,
} from './utils/constants';
import {
  getOperators,
  displayText,
  validateRange,
  isNullOperator,
  isRangeOperator,
} from './utils/whereHelpers';
import { isInvalid, required } from '../../../../../utils/validate';
import {
  FormikComboBox,
  FormikSelect,
  FormikFieldNumber,
  FormikFieldText,
} from '../../../../../components/FormControls';
import { getFilteredIndexFields, getIndexFields } from './utils/dataTypes';
import { FORMIK_INITIAL_VALUES } from '../../../containers/CreateMonitor/utils/constants';
import { DATA_TYPES } from '../../../../../utils/constants';
import {
  TRIGGER_COMPARISON_OPERATORS,
  TRIGGER_OPERATORS_MAP,
} from '../../../../CreateTrigger/containers/DefineAggregationTrigger/DefineAggregationTrigger';

const propTypes = {
  formik: PropTypes.object.isRequired,
  dataTypes: PropTypes.object.isRequired,
  onMadeChanges: PropTypes.func.isRequired,
  openedStates: PropTypes.object.isRequired,
  openExpression: PropTypes.func.isRequired,
};

const ALLOWED_TYPES = ['number', 'text', 'keyword', 'boolean'];

class WhereExpression extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldPath: !_.isEmpty(`${props.fieldPath}`) ? `${props.fieldPath}.` : '',
    };
  }

  handleFieldChange = (option, field, form) => {
    this.props.onMadeChanges();
    this.resetValues();
    form.setFieldValue(field.name, option);
    // User can remove where condition
    if (option.length === 0) {
      this.resetValues();
      form.setFieldError('where', undefined);
    }
  };

  handleOperatorChange = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  handleChangeWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  handleClosePopOver = async () => {
    const {
      formik: { values },
      closeExpression,
    } = this.props;
    // Explicitly invoking validation, this component unmount after it closes.
    const fieldName = _.get(values, `${this.state.fieldPath}where.fieldName`, '');
    if (fieldName > 0) {
      await this.props.formik.validateForm();
    }
    closeExpression(Expressions.WHERE);
  };

  resetValues = () => {
    const { formik } = this.props;
    formik.setValues({
      ...formik.values,
      where: { ...FORMIK_INITIAL_VALUES.where },
    });
  };

  renderBetweenAnd = () => {
    const {
      formik: { values },
    } = this.props;
    return (
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <FormikFieldNumber
            name={`${this.state.fieldPath}where.fieldRangeStart`}
            fieldProps={{
              validate: (value) =>
                validateRange(value, _.get(values, `${this.state.fieldPath}where`)),
            }}
            inputProps={{ onChange: this.handleChangeWrapper, isInvalid }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText textAlign="center">TO</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikFieldNumber
            name={`${this.state.fieldPath}where.fieldRangeEnd`}
            fieldProps={{
              validate: (value) =>
                validateRange(value, _.get(values, `${this.state.fieldPath}where`)),
            }}
            inputProps={{ onChange: this.handleChangeWrapper, isInvalid }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  renderValueField = (fieldType, fieldOperator) => {
    if (fieldType == DATA_TYPES.NUMBER) {
      return isRangeOperator(fieldOperator) ? (
        this.renderBetweenAnd()
      ) : (
        <FormikFieldNumber
          name={`${this.state.fieldPath}where.fieldValue`}
          fieldProps={{ validate: required }}
          inputProps={{ onChange: this.handleChangeWrapper, isInvalid }}
        />
      );
    } else if (fieldType == DATA_TYPES.BOOLEAN) {
      return (
        <FormikSelect
          name={`${this.state.fieldPath}where.fieldValue`}
          fieldProps={{ validate: required }}
          inputProps={{
            onChange: this.handleChangeWrapper,
            options: WHERE_BOOLEAN_FILTERS,
            isInvalid,
          }}
        />
      );
    } else {
      return (
        <FormikFieldText
          name={`${this.state.fieldPath}where.fieldValue`}
          fieldProps={{ validate: required }}
          inputProps={{ onChange: this.handleChangeWrapper, isInvalid }}
        />
      );
    }
  };

  render() {
    const {
      formik: { values },
      openedStates,
      openExpression,
      dataTypes,
      indexFieldFilters,
      useTriggerFieldOperators,
    } = this.props;
    const { fieldPath } = this.state;
    const indexFields =
      indexFieldFilters !== undefined
        ? getFilteredIndexFields(dataTypes, ALLOWED_TYPES, indexFieldFilters)
        : getIndexFields(dataTypes, ALLOWED_TYPES);
    const fieldType = _.get(values, `${fieldPath}where.fieldName[0].type`, 'number');
    let fieldOperator = _.get(values, `${fieldPath}where.operator`, 'is');
    if (useTriggerFieldOperators && !_.includes(_.values(TRIGGER_OPERATORS_MAP), fieldOperator)) {
      fieldOperator = TRIGGER_OPERATORS_MAP.INCLUDE;
      _.set(values, `${fieldPath}where.operator`, fieldOperator);
    }

    const fieldOperators = useTriggerFieldOperators
      ? TRIGGER_COMPARISON_OPERATORS
      : getOperators(fieldType);

    return (
      <div>
        <EuiText size="xs">
          <h4>Where</h4>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiBadge
          iconSide="right"
          iconType="cross"
          iconOnClick={() => this.resetValues()}
          iconOnClickAriaLabel="Remove where filter"
          onClick={() => {
            openExpression(Expressions.WHERE);
          }}
          onClickAriaLabel="Edit where filter"
        >
          {displayText(_.get(values, `${fieldPath}where`))}
        </EuiBadge>
        <EuiPopover
          id="where-popover"
          button={
            <EuiButtonEmpty
              size="xs"
              data-test-subj="addFilterButton"
              onClick={() => openExpression(Expressions.WHERE)}
            >
              Edit where filter
            </EuiButtonEmpty>
          }
          isOpen={openedStates.WHERE}
          closePopover={this.handleClosePopOver}
          panelPaddingSize="none"
          ownFocus
          withTitle
          anchorPosition="downLeft"
        >
          <div style={POPOVER_STYLE}>
            <EuiFlexGroup style={{ ...EXPRESSION_STYLE }}>
              <EuiFlexItem grow={false} style={{ width: 200 }}>
                <FormikComboBox
                  name={`${fieldPath}where.fieldName`}
                  inputProps={{
                    placeholder: 'Select a field',
                    options: indexFields,
                    onChange: this.handleFieldChange,
                    isClearable: false,
                    singleSelection: { asPlainText: true },
                  }}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <FormikSelect
                  name={`${fieldPath}where.operator`}
                  inputProps={{
                    onChange: this.handleOperatorChange,
                    options: fieldOperators,
                  }}
                />
              </EuiFlexItem>
              {!isNullOperator(fieldOperator) && (
                <EuiFlexItem>{this.renderValueField(fieldType, fieldOperator)}</EuiFlexItem>
              )}
            </EuiFlexGroup>
          </div>
        </EuiPopover>
      </div>
    );
  }
}

WhereExpression.propTypes = propTypes;

export default connect(WhereExpression);
