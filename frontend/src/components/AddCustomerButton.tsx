import * as _ from 'lodash';
import React from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Modal, Button, Input, Form, Select, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-number-input';

import { CUSTOMERS_BY_USER_QUERY } from './Customers';
import { layout, tailLayout } from './AddProductButton';

const CREATE_CUSTOMER_MUTATION = gql`
mutation CREATE_CUSTOMER_MUTATION(
    $name: String!
    $email: String
    $phone: String
    $street1: String
    $street2: String
    $city: String
    $state: String
    $zipCode: Int
    $country: String
) {
    createCustomer(
        name: $name
        email: $email
        phone: $phone
        street1: $street1
        street2: $street2
        city: $city
        state: $state
        zipCode: $zipCode
        country: $country
    ) {
        id
        name
        email
        phone
        street1
        street2
        city
        state
        zipCode
        country
        createdAt
    }
}
`;

const AddCustomerButton = () => {
    const [name, setName] = React.useState<string>();
    const [email, setEmail] = React.useState<string>();
    const [phone, setPhone] = React.useState<string>('');
    const [street1, setStreet1] = React.useState<string>();
    const [street2, setStreet2] = React.useState<string>();
    const [city, setCity] = React.useState<string>();
    const [state, setState] = React.useState<string>();
    const [zipCode, setZipCode] = React.useState<string>();
    const [country, setCountry] = React.useState<string>();
    const [isShowingModal, setIsShowingModal] = React.useState<boolean>(false);

    const [form] = Form.useForm();

    const [createCustomer, { loading: createCustomerLoading, error: createCustomerError }] = useMutation(CREATE_CUSTOMER_MUTATION, {
        variables: { name, email, phone, street1, street2, city, state, zipCode, country },
        update: (cache, payload) => {
            const data: any = cache.readQuery({ query: CUSTOMERS_BY_USER_QUERY });

            data.customersByUser.push(payload.data.createCustomer);
            data.customersByUser = _.sortBy(data.customersByUser, 'createdAt');

            cache.writeQuery({ query: CUSTOMERS_BY_USER_QUERY, data })
        }
    });

    return (
        <>
            <Modal title='Add a Customer' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
                <Form {...layout} form={form} onFinish={async () => {
                    const response = await createCustomer();

                    if (createCustomerError) {
                        message.error(createCustomerError.message.replace('GraphQL error: ', ''));
                    } else {
                        setIsShowingModal(false);
                        form.resetFields();
                        message.success('Customer added');
                    }
                }}>
                    <Form.Item
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true, message: 'This field is required' }]}
                                >
                                    <Input value={name} onChange={e => setName(e.target.value)} />
                                </Form.Item>

                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ type: 'email' }]}
                                >
                                    <Input value={name} onChange={e => setEmail(e.target.value)} />
                                </Form.Item>

                                <Form.Item
                                    label="Phone"
                                    name="phone"
                                >
                                    <PhoneInput value={phone} onChange={setPhone} />
                                </Form.Item>

                                <Form.Item
                                    label="Street1"
                                    name="street1"
                                >
                                    <Input value={street1} onChange={e => setStreet1(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="Street2"
                                    name="street2"
                                >
                                    <Input value={street2} onChange={e => setStreet2(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="City"
                                    name="city"
                                >
                                    <Input value={city} onChange={e => setCity(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="State"
                                    name="state"
                                >
                                    <Input value={state} onChange={e => setState(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="Zip Code"
                                    name="zipCode"
                                >
                                    <Input type='number' value={zipCode} onChange={e => setZipCode(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="Country"
                                    name="country"
                                >
                                    <Input value={country} onChange={e => setCountry(e.target.value)} />
                                </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit" loading={createCustomerLoading}>Add{createCustomerLoading ? 'ing ' : ' '} Customer</Button>
                        <Button onClick={() => setIsShowingModal(false)}>Cancel</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Button
                onClick={() => setIsShowingModal(true)}
                size='large'
                icon={<PlusOutlined />}
                className='add-button'
            >
                Add Customer
            </Button>
        </>
    );
}

export default AddCustomerButton;