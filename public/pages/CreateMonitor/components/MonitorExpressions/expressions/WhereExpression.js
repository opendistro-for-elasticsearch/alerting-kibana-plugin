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
import { EuiFlexGroup, EuiFlexItem, EuiPopover, EuiExpression, EuiText } from '@elastic/eui';
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
import { getIndexFields } from './utils/dataTypes';
import { FORMIK_INITIAL_VALUES } from '../../../containers/CreateMonitor/utils/constants';
import { DATA_TYPES } from '../../../../../utils/constants';

const propTypes = {
  formik: PropTypes.object.isRequired,
  dataTypes: PropTypes.object.isRequired,
  onMadeChanges: PropTypes.func.isRequired,
  openedStates: PropTypes.object.isRequired,
  openExpression: PropTypes.func.isRequired,
};

class WhereExpression extends Component {
  constructor(props) {
    super(props);
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
    if (values.where.fieldName.length > 0) {
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
            name="where.fieldRangeStart"
            fieldProps={{
              validate: value => validateRange(value, values.where),
            }}
            inputProps={{ onChange: this.handleChangeWrapper, isInvalid }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText textAlign="center">TO</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikFieldNumber
            name="where.fieldRangeEnd"
            fieldProps={{
              validate: value => validateRange(value, values.where),
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
          name="where.fieldValue"
          fieldProps={{ validate: required }}
          inputProps={{ onChange: this.handleChangeWrapper, isInvalid }}
        />
      );
    } else if (fieldType == DATA_TYPES.BOOLEAN) {
      return (
        <FormikSelect
          name="where.fieldValue"
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
          name="where.fieldValue"
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
    } = this.props;
    const indexFields = getIndexFields(dataTypes, ['number', 'text', 'keyword', 'boolean']);
    const fieldType = _.get(values, 'where.fieldName[0].type', 'number');
    const fieldOperator = _.get(values, 'where.operator', 'is');

    return (
      <EuiPopover
        id="where-popover"
        button={
          <EuiExpression
            description="where"
            value={displayText(values.where)}
            isActive={openedStates.WHERE}
            onClick={() => openExpression(Expressions.WHERE)}
          />
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
                name="where.fieldName"
                inputProps={{
                  placeholder: 'all fields are included',
                  options: indexFields,
                  onChange: this.handleFieldChange,
                  isClearable: false,
                  singleSelection: { asPlainText: true },
                }}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <FormikSelect
                name="where.operator"
                inputProps={{
                  onChange: this.handleOperatorChange,
                  options: getOperators(fieldType),
                }}
              />
            </EuiFlexItem>
            {!isNullOperator(fieldOperator) && (
              <EuiFlexItem>{this.renderValueField(fieldType, fieldOperator)}</EuiFlexItem>
            )}
          </EuiFlexGroup>
        </div>
      </EuiPopover>
    );
  }
}

WhereExpression.propTypes = propTypes;

export default connect(WhereExpression);
