import React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, message, Tag, } from 'antd';
import { RightSquareTwoTone, DownSquareTwoTone } from '@ant-design/icons';

import { userContext } from './App';
import AddSaleButton from './AddSaleButton';
import UpdateSaleButton from './UpdateSaleButton';
import DeleteButton from './DeleteButton';
import SaleDetails from './SaleDetails';
import { calculateProfitBySaleItems, calculateSubtotalBySaleItems, calculateTotalBySale } from '../services/main';

const PRODUCTS_BY_USER_QUERY = gql`
    {
        productsByUser {
            id
            name
            salePrice
            costPrice
        }
    }
`;

const SALES_BY_USER_QUERY = gql`
    {
        salesByUser(orderBy: timestamp_DESC) {
            id
            timestamp
            customer {
                id
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
                salePrice
                costPrice
            }
            discountType
            discountValue
            taxType
            taxValue
            shipping
            note
            createdAt
        }
    }
`;

const DELETE_SALE_AND_ITEMS_MUTATION = gql`
    mutation DELETE_SALE_AND_ITEMS_MUTATION($id: ID!) {
        deleteSaleAndItems(id: $id) {
            id
            createdAt
        }
    }
`;

const Sales = () => {
    const [idForDeletion, setIdForDeletion] = React.useState<string>();

    const { data: salesData, loading } = useQuery(SALES_BY_USER_QUERY);
    let sales: any;
    if (salesData) {
        sales = _.sortBy(salesData.salesByUser, 'timestamp').reverse();
    } else {
        sales = null;
    }

    const [deleteSaleAndItems, { error }] = useMutation(DELETE_SALE_AND_ITEMS_MUTATION, {
        variables: { id: idForDeletion },
        update: (cache: any, payload: any) => {
            const data = cache.readQuery({ query: SALES_BY_USER_QUERY });
            const filteredItems = _.filter(data.salesByUser, item => item.id !== payload.data.deleteSaleAndItems.id);
            cache.writeQuery({ query: SALES_BY_USER_QUERY, data: { salesByUser: filteredItems } });
        }
    });

    const { data: productsByUserData } = useQuery(PRODUCTS_BY_USER_QUERY);
    const products = productsByUserData ? productsByUserData.productsByUser : [];
    _.each(products, product => {
        delete product.__typename;
    });

    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <>
                        <AddSaleButton products={products} />
                        <Table
                            loading={loading}
                            dataSource={sales}
                            rowKey='id'
                            rowClassName='clickable-table-row'
                            expandable={{
                                expandedRowRender: record => <SaleDetails sale={record} />,
                                expandIcon: ({ expanded, onExpand, record }) => (
                                    expanded ? <DownSquareTwoTone onClick={e => onExpand(record, e)} style={{ fontSize: '18pt'}} />
                                    : <RightSquareTwoTone onClick={e => onExpand(record, e)} style={{ fontSize: '18pt'}} />
                                )
                            }}
                            columns={[
                                {
                                    title: 'Date of Sale',
                                    dataIndex: 'timestamp',
                                    render: (value) => {
                                        return moment.unix(value).format("Do MMMM YYYY");
                                    }
                                },
                                {
                                    title: 'Products',
                                    dataIndex: 'saleItems',
                                    render: (value) => {
                                        return _.map(value, saleItem => {
                                            return <Tag key={saleItem.product.name}>{saleItem.product.name}</Tag>
                                        })
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
                                            <UpdateSaleButton sale={record} products={products} />
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
                                                    await deleteSaleAndItems();
                                                    if (error) {
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