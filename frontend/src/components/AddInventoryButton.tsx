import * as _ from 'lodash';
import React from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Modal, Button, Input, Form, Select, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { INVENTORIES_BY_USER_QUERY } from './Inventories';
import { layout, tailLayout } from './AddProductButton';

const CREATE_INVENTORY_MUTATION = gql`
mutation CREATE_INVENTORY_MUTATION(
    $name: String!
) {
    createInventory(
        name: $name
    ) {
        id
        name
        createdAt
        inventoryItems {
            id
        }
    }
}
`;

const AddInventoryButton = () => {
    const [name, setName] = React.useState<string>();
    const [isShowingModal, setIsShowingModal] = React.useState<boolean>(false);

    const [form] = Form.useForm();

    const [createInventory, { loading: createIventoryLoading, error: createInventoryError }] = useMutation(CREATE_INVENTORY_MUTATION, {
        variables: { name },
        update: (store, response) => {
            let newData = response.data.createInventory;
            let localStoreData: any = store.readQuery({ query: INVENTORIES_BY_USER_QUERY });
            localStoreData = { inventoriesByUser: [...localStoreData.inventoriesByUser, newData] };
            store.writeQuery({ query: INVENTORIES_BY_USER_QUERY, data: localStoreData });
        }
    });

    return (
        <>
            <Modal title='Add an Inventory' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
                <Form {...layout} form={form} onFinish={async () => {
                    const response = await createInventory();
                    if (createInventoryError) {
                        message.error(createInventoryError.message.replace('GraphQL error: ', ''));
                    } else {
                        setIsShowingModal(false);
                        form.resetFields();
                        message.success('Inventory added');
                    }
                }}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit" loading={createIventoryLoading}>Add{createIventoryLoading ? 'ing ' : ' '} Inventory</Button>
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
                Add Inventory
            </Button>
        </>
    );
}

export default AddInventoryButton;