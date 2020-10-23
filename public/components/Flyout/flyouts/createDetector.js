/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { Component, Fragment, useState, useEffect } from 'react';
import { Formik } from 'formik';
import { hasError, isInvalid, required, validatePositiveInteger } from '../../../utils/validate';

import {
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiButton,
  EuiPageBody,
  EuiSpacer,
  EuiBasicTable,
  EuiTitle,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiButtonEmpty,
  EuiFlyoutBody,
  EuiCallOut,
  EuiIcon,
  EuiTextColor,
  EuiPanel,
  EuiFlexGrid,
  EuiFormLabel,
  EuiLink,
  EuiPopover,
  EuiExpression,
} from '@elastic/eui';
import ContentPanel from '../../ContentPanel';
import {
  FormikFieldText,
  FormikFieldNumber,
  FormikComboBox,
  FormikSelect,
} from '../../FormControls';
import { KIBANA_AD_PLUGIN, DATA_TYPES, DETECTOR_CREATION_CALLOUTS } from '../../../utils/constants';
import { getIndexFields } from '../../../pages/CreateMonitor/components/MonitorExpressions/expressions/utils/dataTypes';
import {
  getOperators,
  isNullOperator,
  isRangeOperator,
  validateRange,
  displayText,
} from '../../../pages/CreateMonitor/components/MonitorExpressions/expressions/utils/whereHelpers';
import {
  POPOVER_STYLE,
  EXPRESSION_STYLE,
  WHERE_BOOLEAN_FILTERS,
} from '../../../pages/CreateMonitor/components/MonitorExpressions/expressions/utils/constants';
import { getPathsPerDataType } from '../../../pages/CreateMonitor/containers/DefineMonitor/utils/mappings';
import { formikToWhereClause } from '../../../pages/CreateMonitor/containers/CreateMonitor/utils/formikToMonitor';
import { MAX_INTERVAl_LENGTH_MINUTES } from '../../../pages/MonitorDetails/containers/utils/helpers';

function toString(obj) {
  if (typeof obj != 'undefined') {
    if (obj.hasOwnProperty('period')) {
      let period = obj.period;
      return period.interval;
    } else if (typeof obj == 'number') {
      // epoch
      return moment(obj).format('MM/DD/YY hh:mm A');
    }
  }
  return '-';
}

class FeaturePreview extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const featureAttributes = this.props.featureAttributes;
    const items = [
      {
        name: featureAttributes.feature_name,
        definition: '',
        state: 'Enabled',
      },
    ];
    const columns = [
      {
        field: 'name',
        name: 'Feature name',
      },
      {
        field: 'definition',
        name: 'Feature definition',
        render: () => {
          return (
            <div>
              <p>
                {' '}
                <b>Field:</b> {featureAttributes.fieldName || ''}
              </p>
              <p>
                {' '}
                <b>Aggregation method:</b> {featureAttributes.aggregationType || ''}
              </p>
            </div>
          );
        },
      },
      {
        field: 'state',
        name: 'State',
      },
    ];
    return (
      <EuiFlexGroup direction="column" gutterSize="s" style={{ paddingTop: '20px' }}>
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Features</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel grow={false}>
            <EuiBasicTable
              items={items}
              columns={columns}
              cellProps={() => {
                return {
                  textOnly: true,
                };
              }}
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export class FilterDisplay extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let filter = this.props;
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

async function createAndStartDetector(context) {
  const configs = context.adConfigs;
  const httpClient = context.httpClient;
  try {
    const response = await httpClient.post('../api/alerting/detectors', {
      configs,
    });
    const {
      data: {
        ok,
        response: { _id },
      },
    } = response;
    const detectorId = _id;
    if (ok) {
      try {
        const response = await httpClient.post(`../api/alerting/detectors/${detectorId}/_start`);
        const {
          data: {
            ok,
            response: { _id },
          },
        } = response;
        if (ok) {
          context.setFlyout(null);
          context.renderStartedDetectorFlyout(configs, _id, context.queriesForOverview);
        }
      } catch (err) {
        if (typeof err === 'string') throw err;
        throw 'There was a problem starting detector';
      }
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    throw 'There was a problem creating detector';
  }
}

function warningCallOut(message, color, iconType) {
  return (
    <EuiCallOut color={color}>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiIcon type={iconType} />
        </EuiFlexItem>
        <EuiFlexItem>
          {' '}
          <EuiTextColor>{message}</EuiTextColor>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiCallOut>
  );
}

function triggerCorrectCallOut(context) {
  if (context.startedDetector) {
    return detectorCreatedCallOut(context);
  }
  let calloutType = 'notValid';
  if (
    Object.keys(context.failures).length == 0 &&
    Object.keys(context.suggestedChanges).length == 0
  ) {
    calloutType = 'valid';
  }
  for (let [key, value] of Object.entries(context.suggestedChanges)) {
    if (key === 'detection_interval') {
      let intervalMinutes = Math.ceil(value[0] / 60000) + 1;
      if (isNaN(intervalMinutes) || intervalMinutes > MAX_INTERVAl_LENGTH_MINUTES) {
        calloutType = 'maxInterval';
        context.adConfigs.detection_interval = {
          period: { interval: MAX_INTERVAl_LENGTH_MINUTES, unit: 'MINUTES' },
        };
      } else {
        context.adConfigs.detection_interval = {
          period: { interval: intervalMinutes, unit: 'MINUTES' },
        };
        if (
          Object.keys(context.failures).length == 0 &&
          Object.keys(context.suggestedChanges).length == 1
        ) {
          calloutType = 'valid';
        }
      }
    }
    if (
      key === 'filter_query' &&
      Object.keys(context.failures).length == 0 &&
      Object.keys(context.suggestedChanges).length == 1
    ) {
      calloutType = 'filterQueryTooSparse';
    }
  }
  return informationCallOut(calloutType);
}

function detectorCreatedCallOut(context) {
  const detectorID = context.detectorID;
  return (
    <EuiCallOut
      title={'Anomaly detector ' + context.adConfigs.name + ' has been created and started'}
      size="m"
      color="success"
    >
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiIcon type="check" />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiTextColor color="subdued">
            <span>
              Anomaly detector has been created from the monitor and can be accessed{' '}
              {
                <EuiLink
                  style={{ textDecoration: 'underline' }}
                  href={`${KIBANA_AD_PLUGIN}#/detectors/${detectorID}`}
                  target="_blank"
                >
                  {'here'} <EuiIcon size="s" type="popout" />
                </EuiLink>
              }
            </span>
          </EuiTextColor>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiCallOut>
  );
}

function informationCallOut(callOut) {
  if (callOut === 'filterQueryTooSparse') {
    return warningCallOut(DETECTOR_CREATION_CALLOUTS.FILTER_QUERY_NO_RESULTS, 'warning', 'help');
  }
  if (callOut === 'maxInterval') {
    return warningCallOut(DETECTOR_CREATION_CALLOUTS.MAX_INTERVAL, 'warning', 'help');
  }
  if (callOut === 'notValid') {
    return warningCallOut(DETECTOR_CREATION_CALLOUTS.NOT_VALID, 'warning', 'help');
  } else if (callOut === 'valid') {
    return warningCallOut(DETECTOR_CREATION_CALLOUTS.VALID, 'primary', 'check');
  }
  return null;
}

async function validateDetector(newValue, context) {
  const search = {
    searchType: 'graph',
    timeField: newValue.time_field,
    where: {
      fieldName: newValue.where.fieldName === undefined ? [] : newValue.where.fieldName,
      fieldRangeEnd: newValue.where.fieldRangeEnd === undefined ? 0 : newValue.where.fieldRangeEnd,
      fieldRangeStart:
        newValue.where.fieldRangeStart === undefined ? 0 : newValue.where.fieldRangeStart,
      fieldValue: newValue.where.fieldValue === undefined ? '' : newValue.where.fieldValue,
      operator: newValue.where.operator === undefined ? 'is' : newValue.where.operator,
    },
  };
  let filterQuery = formikToWhereClause(search);
  let adFilterQuery = '';
  if (filterQuery) {
    adFilterQuery = { bool: { filter: [filterQuery] } };
  } else {
    adFilterQuery = { match_all: { boost: 1.0 } };
  }
  context.adConfigs.filter_query = adFilterQuery;
  context.adConfigs.name = newValue.name;
  context.adConfigs.description = newValue.description;
  context.adConfigs.time_field = newValue.time_field;
  context.adConfigs.inidices = newValue.indices;
  context.adConfigs.window_delay = { period: { interval: newValue.window_delay, unit: 'MINUTES' } };
  context.adConfigs.detection_interval = {
    period: { interval: newValue.detection_interval, unit: 'MINUTES' },
  };
  context.queriesForOverview.where = search.where;
  context.queriesForOverview.filter_query = adFilterQuery;
  const configs = context.adConfigs;
  const httpClient = context.httpClient;
  try {
    const response = await httpClient.post('../api/alerting/detectors/_validate', {
      configs,
    });
    let resp = _.get(response, 'data.response');
    const {
      data: {
        ok,
        response: { _id },
      },
    } = response;
    if (ok) {
      context.setFlyout(null);
      context.renderFlyout(configs, resp, context.queriesForOverview);
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    throw 'There was a problem validating the configurations';
  }
}

const ConfigCell = (props) => {
  return (
    <FixedWidthRow label={props.title}>
      <EuiText>
        <p className="enabled">{props.description}</p>
      </EuiText>
    </FixedWidthRow>
  );
};

const validationErrorCallOut = (failures, suggestedChanges, field) => {
  let message;
  for (let [key, value] of Object.entries(failures)) {
    if (key === 'duplicates' && field === 'name') {
      message = 'Detector name is a duplicate';
    } else if (key === 'missing' && value[0] === field) {
      message = 'This field is required';
    } else if ((key === 'regex' && field === 'name') || (key === 'format' && field === 'name')) {
      message = 'Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)';
    }
  }
  for (let [key, value] of Object.entries(suggestedChanges)) {
    if (key === 'window_delay' && field === 'window_delay') {
      message = 'Window delay should be at least ' + value[0] + ' minutes';
    } else if (key === 'filter_query' && field === 'filter_query') {
      message = value[0];
    } else if (key === 'detectionIntervalMax' && field === 'detection_interval') {
      message = value;
    }
  }
  if (message) {
    return (
      <EuiCallOut
        style={{ paddingBottom: '2px' }}
        title={message}
        iconType="alert"
        size="s"
        color="danger"
      ></EuiCallOut>
    );
  }
  return null;
};

const createDetector = (context) => {
  const [isFilterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [dataTypes, setDataTypes] = useState({});

  useEffect(() => {
    onQueryMappings();
  }, []);

  const handleFieldChange = (option, field, form) => {
    form.setFieldValue(field.name, option);
    // User can remove where condition
    if (option.length === 0) {
      form.setFieldError('where', undefined);
    }
  };

  async function onQueryMappings() {
    const index = context.adConfigs.indices;
    try {
      const mappings = await queryMappings(index);
      const data = getPathsPerDataType(mappings);
      setDataTypes(data);
    } catch (err) {
      console.error('There was an error getting mappings for query', err);
    }
  }
  const handleChangeWrapper = (e, field) => {
    field.onChange(e);
  };

  const helpTextInterval = (context) => {
    if (
      Object.keys(context.failures).length != 0 &&
      toString(context.adConfigs.detection_interval) == '1'
    ) {
      return "Detector interval hasn't been validated yet, please fix other failures first";
    } else if (
      Object.keys(context.failures).length == 0 &&
      toString(context.adConfigs.detection_interval) == '1' &&
      context.suggestedChanges.hasOwnProperty('filter_query')
    ) {
      return (
        "Detector interval recommendation hasn't been made since query filter returns no hits, you can " +
        'either choose to continue creation without validation or try to fix filter_query'
      );
    } else {
      return '';
    }
  };

  const renderBetweenAnd = (valuess) => {
    const values = valuess;
    return (
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <FormikFieldNumber
            name="where.fieldRangeStart"
            fieldProps={{
              validate: (value) => validateRange(value, values.where),
            }}
            inputProps={{ onChange: handleChangeWrapper, isInvalid }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText textAlign="center">TO</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikFieldNumber
            name="where.fieldRangeEnd"
            fieldProps={{
              validate: (value) => validateRange(value, values.where),
            }}
            inputProps={{ onChange: handleChangeWrapper, isInvalid }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  const renderValueField = (fieldType, fieldOperator) => {
    if (fieldType == DATA_TYPES.NUMBER) {
      return isRangeOperator(fieldOperator) ? (
        renderBetweenAnd()
      ) : (
        <FormikFieldNumber
          name="where.fieldValue"
          fieldProps={{ validate: required }}
          inputProps={{ onChange: handleChangeWrapper, isInvalid }}
        />
      );
    } else if (fieldType == DATA_TYPES.BOOLEAN) {
      return (
        <FormikSelect
          name="where.fieldValue"
          fieldProps={{ validate: required }}
          inputProps={{ onChange: handleChangeWrapper, options: WHERE_BOOLEAN_FILTERS, isInvalid }}
        />
      );
    } else {
      return (
        <FormikFieldText
          name="where.fieldValue"
          fieldProps={{ validate: required }}
          inputProps={{ onChange: handleChangeWrapper, isInvalid }}
        />
      );
    }
  };

  async function queryMappings(index) {
    if (!index.length) {
      return {};
    }
    try {
      const response = await context.httpClient.post('../api/alerting/_mappings', { index });
      if (response.data.ok) {
        return response.data.resp;
      }
      return {};
    } catch (err) {
      throw err;
    }
  }

  const handleOperatorChange = (e, field) => {
    field.onChange(e);
  };

  const indexFields = getIndexFields(dataTypes, ['number', 'text', 'keyword', 'boolean']);
  const onAddFilterButton = () =>
    setFilterPopoverOpen((isFilterPopoverOpen) => !isFilterPopoverOpen);
  const closePopover = () => setFilterPopoverOpen(false);
  return {
    flyoutProps: {
      'aria-labelledby': 'createDetectorFlyout',
      maxWidth: 900,
      size: 'l',
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
      <EuiPageBody component="div">
        <EuiFlyoutBody style={{ padding: '-12px' }} banner={triggerCorrectCallOut(context)}>
          <EuiSpacer size="l" />
          <ContentPanel
            title="Detector Configuration Preview"
            titleSize="s"
            style={{ paddingBottom: '10px' }}
          >
            {!context.startedDetector ? (
              <Formik
                initialValues={{
                  name: context.adConfigs.name,
                  description: context.adConfigs.description,
                  time_field: context.adConfigs.time_field,
                  indices: context.adConfigs.indices,
                  detection_interval: toString(context.adConfigs.detection_interval),
                  window_delay: toString(context.adConfigs.window_delay),
                  where: context.queriesForOverview.where,
                }}
                onSubmit={(value) => validateDetector(value, context)}
                validateOnChange={false}
                render={({ handleSubmit, values }) => (
                  <Fragment>
                    <Fragment>
                      <EuiFlexGroup>
                        <EuiFlexItem>
                          <FormikFieldText
                            name="name"
                            formRow
                            rowProps={{
                              label: 'Name',
                              style: { paddingLeft: '5px' },
                            }}
                          />
                          {validationErrorCallOut(
                            context.failures,
                            context.suggestedChanges,
                            'name'
                          )}
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <FormikFieldText
                            name="description"
                            formRow
                            rowProps={{
                              label: 'Description',
                              style: { paddingLeft: '5px' },
                            }}
                          />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiFlexGroup>
                        <EuiFlexItem>
                          <FormikFieldText
                            name="indices"
                            formRow
                            inputProps={{
                              readOnly: true,
                            }}
                            rowProps={{
                              label: 'Data source index *Read Only',
                              style: { paddingLeft: '5px' },
                            }}
                          />
                          <EuiSpacer size="xs" />
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <FormikFieldNumber
                            name="window_delay"
                            formRow
                            fieldProps={{ validate: validatePositiveInteger }}
                            rowProps={{
                              label: 'Window Delay',
                              isInvalid,
                              error: hasError,
                              style: { paddingLeft: '5px' },
                            }}
                            inputProps={{
                              append: [<EuiFormLabel htmlFor="textField19a">Minutes</EuiFormLabel>],
                            }}
                          />
                          {validationErrorCallOut(
                            context.failures,
                            context.suggestedChanges,
                            'window_delay'
                          )}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiFlexGroup>
                        <EuiFlexItem>
                          <FormikFieldNumber
                            name="detection_interval"
                            formRow
                            helpText="You can use a wildcard (*) in your index pattern"
                            fieldProps={{
                              validate: validatePositiveInteger,
                            }}
                            rowProps={{
                              label: 'Detector Interval',
                              isInvalid,
                              error: hasError,
                              style: { paddingLeft: '5px' },
                              helpText: helpTextInterval(context),
                            }}
                            inputProps={{
                              append: <EuiFormLabel htmlFor="textField19a">Minutes</EuiFormLabel>,
                            }}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiFlexItem grow={false}></EuiFlexItem>
                          <EuiFormLabel>Data Filter</EuiFormLabel>
                          <EuiFlexItem
                            grow={false}
                            style={{ paddingTop: '12px', paddingLeft: '4px' }}
                          >
                            <EuiPopover
                              id="where-popover"
                              name="filter"
                              zIndex="200px"
                              button={
                                <EuiExpression
                                  color="primary"
                                  name="Expressionfilter"
                                  description="Filter"
                                  value={displayText(values.where)}
                                  isActive={isFilterPopoverOpen}
                                  onClick={() => onAddFilterButton()}
                                />
                              }
                              isOpen={isFilterPopoverOpen}
                              closePopover={closePopover}
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
                                        placeholder: 'Select a field',
                                        options: indexFields,
                                        onChange: handleFieldChange,
                                        isClearable: false,
                                        singleSelection: { asPlainText: true },
                                      }}
                                    />
                                  </EuiFlexItem>
                                  <EuiFlexItem grow={false}>
                                    <FormikSelect
                                      name="where.operator"
                                      inputProps={{
                                        onChange: handleOperatorChange,
                                        options: getOperators(
                                          _.get(values, 'where.fieldName[0].type', 'number')
                                        ),
                                      }}
                                    />
                                  </EuiFlexItem>
                                  {!isNullOperator(_.get(values, 'where.operator', 'is')) && (
                                    <EuiFlexItem>
                                      {renderValueField(
                                        _.get(values, 'where.fieldName[0].type', 'number'),
                                        _.get(values, 'where.operator', 'is')
                                      )}
                                    </EuiFlexItem>
                                  )}
                                </EuiFlexGroup>
                              </div>
                            </EuiPopover>
                          </EuiFlexItem>
                          {validationErrorCallOut(
                            context.failures,
                            context.suggestedChanges,
                            'filter_query'
                          )}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </Fragment>
                    <EuiFlexGroup
                      alignItems="center"
                      justifyContent="flexEnd"
                      style={{ paddingTop: '10px' }}
                    >
                      <EuiFlexItem grow={false}>
                        <EuiButton color="secondary" onClick={handleSubmit}>
                          Validate
                        </EuiButton>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </Fragment>
                )}
              />
            ) : (
              <EuiFlexGrid columns={2} gutterSize="l" style={{ border: 'none' }}>
                <EuiFlexItem>
                  <ConfigCell title="Name" description={context.adConfigs.name} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <ConfigCell title="Description" description={context.adConfigs.description} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <ConfigCell title="Data source index" description={context.adConfigs.indices} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <ConfigCell
                    title="Detector interval"
                    description={toString(context.adConfigs.detection_interval)}
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <ConfigCell
                    title="Window delay"
                    description={toString(context.adConfigs.window_delay)}
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <ConfigCell
                    title="Data filter"
                    description={displayText(context.queriesForOverview.where)}
                  />
                </EuiFlexItem>
              </EuiFlexGrid>
            )}
            <EuiSpacer size="s" />
          </ContentPanel>
          <EuiSpacer />
          <FeaturePreview featureAttributes={context.queriesForOverview.feature_attributes} />
          <EuiSpacer />
        </EuiFlyoutBody>
      </EuiPageBody>
    ),
    footerProps: {},
    footer: (
      <EuiFlyoutFooter>
        {context.startedDetector ? null : (
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={() => context.setFlyout(null)}>Cancel</EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                flush="right"
                disabled={Object.keys(context.failures).length != 0}
                onClick={() => createAndStartDetector(context)}
                fill
              >
                Create Detector
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiFlyoutFooter>
    ),
  };
};
export default createDetector;
