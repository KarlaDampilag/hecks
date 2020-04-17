import React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, message, Tag, Modal, Divider } from 'antd';

import { userContext } from './App';
import AddSaleButton from './AddSaleButton';
import UpdateInventoryButton from './UpdateInventoryButton';
import DeleteButton from './DeleteButton';
import SaleDetails from './SaleDetails';
import { calculateProfitBySaleItems, calculateSubtotalBySaleItems, calculateTotalBySale } from '../services/main';

const SALES_BY_USER_QUERY = gql`
    {
        salesByUser {
            id
            timestamp
            customer {
                name
            }
            saleItems {
                id
                quantity
                product {
                    id
                    name
                    salePrice
                    costPrice
                }
            }
            discountType
            discountValue
            taxType
            taxValue
            shipping
            note
        }
    }
`;

const DELETE_INVENTORY_MUTATION = gql`
    mutation DELETE_INVENTORY_MUTATION($id: ID!) {
        deleteInventory(id: $id) {
            id
            name
            createdAt
        }
    }
`;

const Sales = () => {
    const [idForDeletion, setIdForDeletion] = React.useState<string>();
    const [recordForModal, setRecordForModal] = React.useState<any>(); // FIXME how to use sale interface from graphql?
    const [showViewSale, setShowViewSale] = React.useState<boolean>(false);

    const { data: salesData, loading } = useQuery(SALES_BY_USER_QUERY);
    const sales = salesData ? salesData.salesByUser : null;
    console.log(sales)

    const [deleteInventory, { error: deleteInventoryError }] = useMutation(DELETE_INVENTORY_MUTATION, {
        variables: { id: idForDeletion },
        update: (cache: any, payload: any) => {
            const data = cache.readQuery({ query: SALES_BY_USER_QUERY });
            const filteredItems = _.filter(data.inventoriesByUser, inventory => inventory.id !== payload.data.deleteInventory.id);
            cache.writeQuery({ query: SALES_BY_USER_QUERY, data: { inventoriesByUser: filteredItems } });
        }
    });

    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <>
                        <AddSaleButton />
                        <Table
                            loading={loading}
                            dataSource={sales}
                            rowKey='id'
                            rowClassName='clickable-table-row'
                            expandable={{
                                expandedRowRender: record => <SaleDetails sale={record} />
                            }}
                            columns={[
                                {
                                    title: 'Date of Sale',
                                    dataIndex: 'timestamp',
                                    render: (value) => {
                                        return moment.unix(value).format("Do MMMM YYYY, h:mm:ss a");
                                    }
                                },
                                {
                                    title: 'Products',
                                    dataIndex: 'saleItems',
                                    render: (value) => {
                                        return _.map(value, saleItem => {
                                            return <Tag key={saleItem.id}>{saleItem.product.name}</Tag>
                                        })
                                    }
                                },
                                {
                                    title: 'No. of Items',
                                    dataIndex: 'saleItems',
                                    render: (value) => {
                                        return value.length;
                                    }
                                },
                                {
                                    title: 'Subtotal',
                                    dataIndex: 'saleItems',
                                    render: (value) => {
                                        return calculateSubtotalBySaleItems(value);
                                    }
                                },
                                {
                                    title: 'Total',
                                    dataIndex: 'id',
                                    render: (value, record) => {
                                        return calculateTotalBySale(record);
                                    }
                                },
                                {
                                    title: 'Profit',
                                    dataIndex: 'saleItems',
                                    render: (value) => {
                                        return calculateProfitBySaleItems(value);
                                    }
                                },
                                {
                                    title: 'Customer',
                                    dataIndex: 'customer',
                                    render: (value) => {
                                        if (value) {
                                            return value.name;
                                        }
                                        return null;
                                    }
                                },
                                {
                                    title: 'Edit ✏️',
                                    dataIndex: 'id',
                                    key: 'edit',
                                    render: (value, record) => {
                                        return (
                                            <UpdateInventoryButton inventory={record} />
                                        );
                                    }
                                },
                                {
                                    title: 'Delete ',
                                    dataIndex: 'id',
                                    key: 'edit',
                                    render: (value) => {
                                        return (
                                            <DeleteButton
                                                onClick={() => setIdForDeletion(value)}
                                                onDelete={async () => {
                                                    message.info('Please wait...');
                                                    await deleteInventory();
                                                    if (deleteInventoryError) {
                                                        message.error('Error: cannot delete. Please contact SourceCodeXL.');
                                                    } else {
                                                        message.success('Inventory deleted');
                                                    }
                                                }}
                                            />
                                        );
                                    }
                                }
                            ]}
                        />
                    </>
                );
            }}
        </userContext.Consumer>
    );
}
export default Sales;
export { SALES_BY_USER_QUERY };