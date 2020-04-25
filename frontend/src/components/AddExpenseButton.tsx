import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { Modal, Button, Input, Form, message, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { EXPENSES_BY_USER_QUERY } from './Expenses';
import { layout, tailLayout } from './AddProductButton';

const CREATE_EXPENSE_MUTATION = gql`
mutation CREATE_EXPENSE_MUTATION(
    $name: String!
    $description: String
    $cost: String!
) {
    createExpense(
        name: $name
        description: $description
        cost: $cost
    ) {
        id
        name
        description
        cost
        createdAt
    }
}
`;

const AddInventoryButton = () => {
    const [name, setName] = React.useState<string>();
    const [description, setDescription] = React.useState<string>();
    const [cost, setCost] = React.useState<string>();
    const [isShowingModal, setIsShowingModal] = React.useState<boolean>(false);

    const [form] = Form.useForm();

    const [createExpense, { loading, error }] = useMutation(CREATE_EXPENSE_MUTATION, {
        variables: { name, description, cost },
        update: (store, response) => {
            let newData = response.data.createExpense;
            let localStoreData: any = store.readQuery({ query: EXPENSES_BY_USER_QUERY });
            localStoreData = { createExpensesByUser: [...localStoreData.createExpensesByUser, newData] };
            store.writeQuery({ query: EXPENSES_BY_USER_QUERY, data: localStoreData });
        }
    });

    return (
        <>
            <Modal title='Add an Expense' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
                <Form {...layout} form={form} onFinish={async () => {
                    await createExpense();
                    if (error) {
                        message.error('Unable to create an expense. Please contact SourceCodeXL.');
                    } else {
                        setIsShowingModal(false);
                        form.resetFields();
                        message.success('Expense added');
                    }
                }}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} />
                    </Form.Item>

                    <Form.Item
                        label="Cost"
                        name="cost"
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber
                            value={cost ? parseFloat(cost) : 0}
                            onChange={(value) => {
                                if (value) {
                                    setCost(value.toString())
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit" loading={loading}>Add{loading ? 'ing ' : ' '} Expense</Button>
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
                Add Expense
            </Button>
        </>
    );
}

export default AddInventoryButton;