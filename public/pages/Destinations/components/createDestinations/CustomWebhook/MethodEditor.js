import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import SubHeader from '../../../../../components/SubHeader';
import { FormikSelect } from '../../../../../components/FormControls';


const methodOptions = [{ value: 'POST', text: 'POST' }, { value: 'PUT', text: 'PUT' }, { value: 'PATCH', text: 'PATCH' }, { value: 'GET', text: 'GET' }, { value: 'DELETE', text: 'DELETE' }];



const propTypes = {
    type: PropTypes.string.isRequired,
};
const MethodEditor = ({ type }) => (
<Fragment>
    <SubHeader title={<h6>Method Selection</h6>} description={''} />
    <FormikSelect
        name={`${type}.method`}
        formRow
        rowProps={{
            label: 'Method',
            style: { paddingLeft: '10px' },
        }}
        inputProps={{
            disabled: false,
            options: methodOptions,
        }}
    />
</Fragment>
);
      
export default MethodEditor;