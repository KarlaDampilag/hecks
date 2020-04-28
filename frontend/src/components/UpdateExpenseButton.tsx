import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { Button, Input, Form, Modal, message, InputNumber } from 'antd';

import { layout, tailLayout } from './AddProductButton';

interface PropTypes {
  expense: any; // FIXME how to use GraphQL types on frontend?
}

const UPDATE_EXPENSE_MUTATION = gql`
    mutation UPDATE_EXPENSE_MUTATION(
        $id: ID!
        $name: String
        $description: String
        $cost: String
    ) {
      updateExpense(
            id: $id
            name: $name
            description: $description
            cost: $cost
        ) {
            id
            name
            description
            cost
        }
    }
`;

const UpdateExpenseButton = (props: PropTypes) => {
  const [name, setName] = React.useState<string>();
  const [description, setDescription] = React.useState<string>();
  const [cost, setCost] = React.useState<string>();
  const [isShowingModal, setIsShowingModal] = React.useState<boolean>(false);

  const [updateExpense, { loading, error }] = useMutation(UPDATE_EXPENSE_MUTATION, {
    variables: { id: props.expense.id, name, description, cost }
  });

  return (
    <>
      <Modal title='Update Expense' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
        <Form
          {...layout}
          onFinish={async e => {
            await updateExpense();
            if (!error) {
              message.success('Expense updated');
              setIsShowingModal(false);
            }
          }}
        >
          <Form.Item
            label="Name"
            name="name"
          >
            <Input defaultValue={props.expense.name} onChange={e => setName(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input defaultValue={props.expense.description} onChange={e => setDescription(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Cost"
          >
            <InputNumber defaultValue={parseFloat(props.expense.cost)} onChange={value => value && setCost(value.toString())} />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" disabled={loading} loading={loading}>Updat{loading ? 'ing' : 'e'} Expense</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Button onClick={() => setIsShowingModal(true)}>Edit</Button>
    </>
  )
}
export default UpdateExpenseButton;