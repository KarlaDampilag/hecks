import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Modal, Button, Input, Form, message, Table, Select, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { layout } from './AddSaleButton';

const ADD_INVENTORY_STOCK_MUTATION = gql`
mutation ADD_INVENTORY_STOCK_MUTATION(
    $id: ID!,
    $inventoryItems: [InventoryItemInput!]!
) {
    addInventoryStock(
        id: $id,
        inventoryItems: $inventoryItems
    ) {
        id
        name
        inventoryItems {
            id
            product {
                id
                name
            }
            amount
            createdAt
        }
    }
}
`;

const PRODUCTS_BY_USER_QUERY = gql`
    {
        productsByUser {
            id
            name
            unit
        }
    }
`;

interface PropTypes {
    //products: any; // FIXME use graphql type
    inventory: any; // FIXME use graphql type
}

interface InventoryItemProps {
    product: any; // FIXME use graphql type
    quantity: number;
}

const AddInventoryStockButton = (props: PropTypes) => {
    const initialItems: InventoryItemProps[] = [{
        product: {
            id: null
        },
        quantity: 1
    }];
    const [inventoryItems, setInventoryItems] = React.useState<InventoryItemProps[]>(initialItems);
    const [filteredInventoryItems, setFilteredInventoryItems] = React.useState<InventoryItemProps[]>(initialItems);
    const [isShowingModal, setIsShowingModal] = React.useState<boolean>(false);

    const inventoryItemIds = _.map(inventoryItems, inventoryItem => inventoryItem.product.id);
    const [form] = Form.useForm();

    const { data: productsByUserData } = useQuery(PRODUCTS_BY_USER_QUERY);
    const products = productsByUserData ? productsByUserData.productsByUser : [];
    _.each(products, product => {
        delete product.__typename;
    });

    const [addInventoryStock, { loading, error }] = useMutation(ADD_INVENTORY_STOCK_MUTATION, {
        variables: { id: props.inventory && props.inventory.id, inventoryItems: filteredInventoryItems },
    });

    const handleProductChange = (inventoryItem: InventoryItemProps, value: string) => {
        const product = JSON.parse(value);
        const updatedInventoryItems = [...inventoryItems];
        const updatedInventoryItem: InventoryItemProps = { ...inventoryItem };
        updatedInventoryItem.product = product;
        const index = _.findIndex(updatedInventoryItems, inventoryItem);
        updatedInventoryItems.splice(index, 1, updatedInventoryItem);
        setInventoryItems(updatedInventoryItems);

        const filteredItems: InventoryItemProps[] = _.filter(updatedInventoryItems, item => item.product.id != null);
        setFilteredInventoryItems(filteredItems);
    }

    const handleQuantityChange = (inventoryItem: InventoryItemProps, value: number | undefined) => {
        const updatedInventoryItems = [...inventoryItems];
        const updatedInventoryItem: InventoryItemProps = { ...inventoryItem };
        updatedInventoryItem.quantity = value ? value : 1;
        const index = _.findIndex(updatedInventoryItems, inventoryItem);
        updatedInventoryItems.splice(index, 1, updatedInventoryItem);
        setInventoryItems(updatedInventoryItems);

        const filteredItems: InventoryItemProps[] = _.filter(updatedInventoryItems, item => item.product.id != null);
        setFilteredInventoryItems(filteredItems);
    }

    return (
        <>
            <Modal title={`Add Stock to ${props.inventory && props.inventory.name}`} visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
                <Form form={form} onFinish={async () => {
                    await addInventoryStock();
                    if (error) {
                        message.error('Unable to add stock. Please contact SourceCodeXL');
                    } else {
                        setIsShowingModal(false);
                        form.resetFields();
                        message.success('Stock added to inventory');
                    }
                }}>
                    <Table
                        dataSource={inventoryItems}
                        rowKey='id'
                        columns={[
                            {
                                width: 300,
                                title: 'Product',
                                dataIndex: 'product',
                                render: (value, record) => {
                                    return (
                                        <Select
                                            style={{ width: '100%' }}
                                            value={value.id && JSON.stringify(value)}
                                            onChange={(value) => handleProductChange(record, value)}
                                            placeholder='Add a product'
                                        >
                                            {
                                                _.map(products, product =>
                                                    <Select.Option
                                                        value={JSON.stringify(product)}
                                                        disabled={_.includes(inventoryItemIds, product.id)}
                                                        key={product.id}
                                                    >
                                                        {product.name}
                                                    </Select.Option>
                                                )
                                            }
                                        </Select>
                                    )
                                }
                            }, {
                                title: 'Unit',
                                dataIndex: 'product',
                                render: (value) => (
                                    value && value.unit
                                )
                            }, {
                                title: 'Quantity',
                                dataIndex: 'quantity',
                                render: (value, record) => (
                                    <InputNumber
                                        value={value}
                                        min={1}
                                        onChange={(value) => handleQuantityChange(record, value)}
                                    />
                                )
                            }
                        ]}
                    />

                    <Form.Item>
                        <Button
                            onClick={() => {
                                const newItems = [...inventoryItems];
                                newItems.push({
                                    product: {
                                        id: null
                                    },
                                    quantity: 1
                                });
                                setInventoryItems(newItems);
                            }}
                        >➕ Add Product</Button>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" disabled={loading} loading={loading} style={{ width: '100%' }}>
                            Add{loading ? 'ing' : ' '} Stock
                                </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Button
                onClick={() => setIsShowingModal(true)}
                size='large'
                icon={<PlusOutlined />}
                className='add-button'
            >
                Add Stock
            </Button>
        </>
    );
}

export default AddInventoryStockButton;