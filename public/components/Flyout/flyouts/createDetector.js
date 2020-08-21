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

import React, { Component, Fragment, useState } from 'react';
import { Field, Formik } from 'formik';
import {
  hasError,
  isInvalid,
  validateDetectorName,
  validatePositiveInteger,
} from '../../../utils/validate';
import { NAME_REGEX } from '../../../pages/MonitorDetails/containers/utils/helpers.js';

import {
  EuiButtonIcon,
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
} from '@elastic/eui';
import ContentPanel from '../../ContentPanel';
import { EuiFlyout } from '@elastic/eui';
import { FormikFieldText, FormikFieldNumber } from '../../FormControls';
import { Context } from 'mocha';
import FrequencyPicker from '../../../pages/CreateMonitor/components/Schedule/Frequencies/FrequencyPicker';
import Frequency from '../../../pages/CreateMonitor/components/Schedule/Frequencies/Frequency';
import { KIBANA_AD_PLUGIN } from '../../../utils/constants';

export function toString(obj) {
  // render calls this method.  During different lifecylces, obj can be undefined
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

export class FeaturePreview extends Component {
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
      <EuiFlexGroup direction="column" gutterSize="s">
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

export function extractIntervalReccomendation(context) {
  if (context.suggestedChanges) {
    if (context.suggestedChanges.detectionIntervalReccomendation) {
      let intervalMinutes =
        Math.ceil(context.suggestedChanges.detectionIntervalReccomendation / 60000) + 1;
      return intervalMinutes;
    }
  }
  return toString(context.adConfigs.detection_interval);
}

export async function createAndStartDetector(context) {
  console.log('adconfig: ' + JSON.stringify(context.adConfigs));
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
        console.log('start detector response: ' + JSON.stringify(response));
        if (ok) {
          console.log('everything okay after start');
          context.setFlyout(null);
          context.renderStartedDetectorFlyout(configs, _id, context.queriesForOverview);
        }
      } catch (err) {
        console.log('error: ' + err);
        if (typeof err === 'string') throw err;
        console.log('error from start: ' + JSON.stringify(err));
        throw 'There was a problem starting detector';
      }
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    console.log('error from create: ' + err);
    throw 'There was a problem createing detector';
  }
}

export function isValidatedOrStartedCallOut(context) {
  const valid = context.valid;
  const startedDetector = context.startedDetector;
  const adConfigs = context.adConfigs;
  const detectorID = context.detectorID;
  console.log('starteddetector', startedDetector);
  console.log('valid', valid);

  if (valid) {
    return (
      <EuiCallOut>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiIcon type="check" />
          </EuiFlexItem>
          <EuiFlexItem>
            {' '}
            <EuiTextColor color="subdued">
              Anomaly Detector configurations has been validated, click <i>create detector</i> to
              confirm creation
            </EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiCallOut>
    );
  } else if (startedDetector) {
    return (
      <EuiCallOut
        title={'Anomaly Detector ' + adConfigs.name + 'has been created and started'}
        size="xl"
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
  } else {
    return null;
  }
}

export function renderChangedDetectorIntervalCallOut(context) {
  console.log('context: ', context);
  if (context.suggestedChanges.detectionIntervalReccomendation) {
    let intervalMinutes =
      Math.ceil(context.suggestedChanges.detectionIntervalReccomendation / 60000) + 1;
    return (
      <Fragment>
        <EuiCallOut
          title={
            <span>
              The optimal detector interval reccomended was set too
              {' ' + intervalMinutes}.
            </span>
          }
          iconType="alert"
          size="s"
        />
        <EuiSpacer size="s" />
      </Fragment>
    );
  }
  return null;
}

export function isInvalidName(name) {
  if (!NAME_REGEX.test(name)) {
    return 'Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)';
  }
}

export async function validateDetector(newValue, context) {
  console.log('new value', JSON.stringify(newValue));
  context.adConfigs.name = newValue.name;
  context.adConfigs.description = newValue.description;
  context.adConfigs.time_field = newValue.time_field;
  context.adConfigs.inidices = newValue.indices;
  // context.adConfigs.detection_interval = newValue.detection_interval;
  // context.window_delay = newValue.windowDelay
  const configs = context.adConfigs;
  const httpClient = context.httpClient;
  console.log('configs before second validate: ' + JSON.stringify(configs));
  try {
    const response = await httpClient.post('../api/alerting/detectors/_validate', {
      configs,
    });
    console.log('response inside monitordetailssadsad: ' + JSON.stringify(response));
    let resp = _.get(response, 'data.response');
    const {
      data: {
        ok,
        response: { _id },
      },
    } = response;
    console.log('validation resp: ' + JSON.stringify(resp));
    if (ok) {
      console.log('went into okay');
      context.setFlyout(null);
      context.renderFlyout(configs, resp, context.queriesForOverview);
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    console.log(err);
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

const FormCell = (props) => {
  return (
    <EuiFlexItem>
      <FormikFieldText
        name="name"
        formRow
        fieldProps={{ readOnly: true }}
        rowProps={{
          label: props.title,
          style: { paddingLeft: '5px' },
        }}
      />
      <EuiCallOut size="s" color="danger">
        {props.failures.regex}
      </EuiCallOut>
    </EuiFlexItem>
  );
};

export let isReadOnly = true;
const useRefState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [stateRef, setState];
};

// Handle Customer Selection from Modal Component
export const onSelectCustomerHandler = (data, setFieldValue) => {
  setFieldValue('customerName', data.name);
  setFieldValue('customerId', data.id);
  toggleCustomerModal();
};

export const validationParser = (failures, suggestedChanges, field) => {
  let message;
  for (let [key, value] of Object.entries(failures)) {
    console.log(value);
    if (key === 'duplicate' && value[0] === field) {
      message = 'Detector name is a duplicate';
    } else if (key === 'missing' && value[0] === field) {
      message = 'This field is required';
    } else if ((key === 'regex' && field === 'name') || key === 'format') {
      message = 'Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)';
    }
  }
  //loop for suggestedChanges later too
  if (message) {
    return <EuiCallOut title={message} iconType="alert" size="s" color="danger"></EuiCallOut>;
  }
  return null;
};
const createDetector = (context) => ({
  flyoutProps: {
    'aria-labelledby': 'createDetectorFlyout',
    maxWidth: 800,
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
      <EuiFlyoutBody banner={isValidatedOrStartedCallOut(context)}>
        <EuiSpacer size="l" />
        {/* {context.suggestedChanges ? renderChangedDetectorIntervalCallOut(context) : null} */}
        <ContentPanel title="Detector Configuration Preview" titleSize="s">
          {!context.startedDetector ? (
            <Formik
              initialValues={{
                name: context.adConfigs.name,
                description: context.adConfigs.description,
                time_field: context.adConfigs.time_field,
                indices: context.adConfigs.indices,
                detection_interval: extractIntervalReccomendation(context),
                window_delay: toString(context.adConfigs.window_delay),
              }}
              onSubmit={(value) => validateDetector(value, context)}
              validateOnChange={false}
              render={({ handleSubmit, value }) => (
                <Fragment>
                  <Fragment>
                    <EuiFlexGroup>
                      <EuiFlexItem>
                        <FormikFieldText
                          name="name"
                          formRow
                          inputProps={{
                            readOnly:
                              validationParser(
                                context.failures,
                                context.suggestedChanges,
                                'name'
                              ) == null,
                            prepend: (
                              <EuiButtonIcon
                                iconType="pencil"
                                aria-label="Edit this"
                                onClick={() => {}}
                              />
                            ),
                          }}
                          rowProps={{
                            label: 'Name',
                            style: { paddingLeft: '5px' },
                          }}
                        />
                        <EuiSpacer size="xs" />
                        {validationParser(context.failures, context.suggestedChanges, 'name')}
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <FormikFieldText
                          name="description"
                          formRow
                          rowProps={{
                            label: 'Description',
                            style: { paddingLeft: '5px' },
                          }}
                          inputProps={{
                            readOnly:
                              validationParser(
                                context.failures,
                                context.suggestedChanges,
                                'description'
                              ) == null,
                            prepend: <EuiButtonIcon iconType="pencil" aria-label="Edit this" />,
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
                            readOnly:
                              validationParser(
                                context.failures,
                                context.suggestedChanges,
                                'indices'
                              ) == null,
                            prepend: (
                              <EuiButtonIcon
                                iconType="pencil"
                                aria-label="Edit this"
                                onClick={() => {}}
                              />
                            ),
                          }}
                          rowProps={{
                            label: 'Data source index',
                            style: { paddingLeft: '5px' },
                          }}
                        />
                        <EuiSpacer size="xs" />
                      </EuiFlexItem>
                      <EuiFlexItem>
                        {/* <FormikFieldText
                          name="window_delay"
                          formRow
                          rowProps={{
                            label: "Window Delay",
                            style: { paddingLeft: '5px' },
                          }}
                          inputProps={{
                            readOnly: validationParser(context.failures, context.suggestedChanges, "window_delay") == null,
                            append: <EuiButtonEmpty iconType="pencil" aria-label="Edit this" />
                          }}
                        /> */}
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
                            prepend: <EuiButtonIcon iconType="pencil" aria-label="Edit this" />,
                            append: <EuiFormLabel htmlFor="textField19a">Minutes</EuiFormLabel>,
                            //readOnly: validationParser(context.failures, context.suggestedChanges, "window_delay") == null,
                          }}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiFlexGroup>
                      {/* <FormikFieldText
                          name="detection_interval"
                          formRow
                          fieldProps
                          inputProps={{
                            readOnly: validationParser(context.failures, context.suggestedChanges, "detection_interval") == null,
                            append: <EuiButtonIcon iconType="pencil" aria-label="Edit this" onClick={() => { }} />
                          }}
                          rowProps={{
                            label: "Detection Interval",
                            style: { paddingLeft: '5px' },
                          }}
                        /> */}

                      <EuiFlexItem>
                        <FormikFieldNumber
                          name="detection_interval"
                          formRow
                          fieldProps={{ validate: validatePositiveInteger }}
                          rowProps={{
                            label: 'Detector Interval',
                            isInvalid,
                            error: hasError,
                            style: { paddingLeft: '5px' },
                          }}
                          inputProps={{
                            prepend: <EuiButtonIcon iconType="pencil" aria-label="Edit this" />,
                            append: <EuiFormLabel htmlFor="textField19a">Minutes</EuiFormLabel>,
                          }}
                        />
                      </EuiFlexItem>
                      <EuiSpacer size="xs" />
                      <EuiFlexItem>
                        <FormikFieldText
                          name="filtetr"
                          formRow
                          rowProps={{
                            label: 'FilterQuery',
                            style: { paddingLeft: '5px' },
                          }}
                          inputProps={{
                            readOnly:
                              validationParser(
                                context.failures,
                                context.suggestedChanges,
                                'window_delay'
                              ) == null,
                            prepend: <EuiButtonIcon iconType="pencil" aria-label="Edit this" />,
                          }}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </Fragment>
                  <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                    <EuiFlexItem grow={false}>
                      <EuiButton fill color="secondary" onClick={handleSubmit}>
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
                  description={extractIntervalReccomendation(context)}
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
                  description={context.queriesForOverview.filter_query}
                />
              </EuiFlexItem>
            </EuiFlexGrid>
          )}
          <EuiSpacer />
          <FeaturePreview featureAttributes={context.queriesForOverview.feature_attributes} />
        </ContentPanel>
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
              disabled={!context.valid}
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
});

export default createDetector;
