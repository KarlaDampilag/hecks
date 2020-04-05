import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Tag, Table, Button } from 'antd';

import { userContext } from './App';
import AddProductButton from './AddProductButton';

const ALL_PRODUCTS_QUERY = gql`
    {
        products(orderBy: createdAt_DESC) {
            id
            name
            salePrice
            costPrice
            unit
            categories
            notes
            image
            createdAt
        }
    }
`;

const Products = () => {
    const { data, loading, error } = useQuery(ALL_PRODUCTS_QUERY);
    const products = data ? data.products : null;

    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <>
                        <AddProductButton />
                        <Table
                            loading={loading}
                            dataSource={products}
                            columns={[
                                {
                                    dataIndex: 'image',
                                    render: (value, record) => {
                                        if (value) {
                                            return <img src={value} alt={record.name} width='150px' />
                                        }
                                        return null;
                                    }
                                },
                                {
                                    title: 'Name',
                                    dataIndex: 'name'
                                },
                                {
                                    title: 'Sale Price',
                                    dataIndex: 'salePrice'
                                },
                                {
                                    title: 'Cost Price',
                                    dataIndex: 'costPrice'
                                },
                                {
                                    title: 'Categories',
                                    dataIndex: 'categories',
                                    render: (value) => {
                                        return _.map(value, category => {
                                            return <Tag key={category}>{category}</Tag>
                                        })
                                    }
                                },
                                {
                                    title: 'Edit ✏️',
                                    dataIndex: 'id',
                                    key: 'edit',
                                    render: (value) => {
                                        return (
                                            <a href={`updateProduct?id${value}`}><Button>Edit</Button></a>
                                        );
                                    }
                                },
                                {
                                    title: 'Delete ',
                                    dataIndex: 'id',
                                    key: 'edit',
                                    render: (value) => {
                                        return (
                                            <Button>Delete</Button>
                                        );
                                    }
                                }
                            ]}
                        />
                    </>
                );
            }}
        </userContext.Consumer>
    )
}
export default Products;
export { ALL_PRODUCTS_QUERY };