import * as _ from 'lodash';
import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Input, Form, Modal, message } from 'antd';
import PhoneInput from 'react-phone-number-input';

import { layout, tailLayout } from './AddProductButton';

interface PropTypes {
  customer: any; // FIXME how to use GraphQL types on frontend?
}

const UPDATE_CUSTOMER_MUTATION = gql`
    mutation UPDATE_CUSTOMER_MUTATION(
        $id: ID!
        $name: String
        $email: String
        $phone: String
        $street1: String
        $street2: String
        $city: String
        $state: String
        $zipCode: String
        $country: String
    ) {
      updateCustomer(
            id: $id
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

const UpdateCustomerButton = (props: PropTypes) => {
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

  const [updateCustomer, { loading, error }] = useMutation(UPDATE_CUSTOMER_MUTATION, {
    variables: { id: props.customer.id, name, email, phone, street1, street2, city, state, zipCode, country }
  });

  return (
    <>
      <Modal title='Update Customer' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
        <Form
          {...layout}
          onFinish={async e => {
            await updateCustomer();
            if (!error) {
              message.success('Customer updated');
              setIsShowingModal(false);
            }
          }}
        >
          <Form.Item
            label="Name"
            name="name"
          >
            <Input defaultValue={props.customer.name} onChange={e => setName(e.target.value)} />
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
            <Input value={zipCode} onChange={e => setZipCode(e.target.value)} />
          </Form.Item>
          {/** TODO make country a dropdown */}
          <Form.Item
            label="Country"
            name="country"
          >
            <Input value={country} onChange={e => setCountry(e.target.value)} />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" disabled={loading} loading={loading}>Updat{loading ? 'ing' : 'e'} Customer</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Button onClick={() => setIsShowingModal(true)}>Edit</Button>
    </>
  )
}
export default UpdateCustomerButton;