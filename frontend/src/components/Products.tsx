import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Tag, Table, Button } from 'antd';

import { userContext } from './App';
import AddProductButton from './AddProductButton';
import UpdateProductButton from './UpdateProductButton';

const PRODUCTS_BY_USER_QUERY = gql`
    {
        productsByUser(orderBy: createdAt_DESC) {
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

const CREATE_CATEGORIES_MUTATION = gql`
    mutation CREATE_CATEGORIES_MUTATION($names: [String!]!) {
        createCategories(names: $names) {
            id
            name
        }
    }
`;

const CATEGORIES_BY_USER_QUERY = gql`
    {
        categoriesByUser{
            id
            name
        }
    }
`;

const Products = () => {
    const { data: productsData, loading, error } = useQuery(PRODUCTS_BY_USER_QUERY);
    const products = productsData ? productsData.productsByUser : null;

    const { data, loading: queryCategoriesLoading, error: queryCategoriesError } = useQuery(CATEGORIES_BY_USER_QUERY);
    const categoriesData = data ? data.categoriesByUser : null;

    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <>
                        <AddProductButton categories={categoriesData} />
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
                                    render: (value, record) => {
                                        return (
                                            //<a href={`updateProduct?id=${value}`}><Button>Edit</Button></a>
                                            <UpdateProductButton product={record} categories={categoriesData} />
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
export { PRODUCTS_BY_USER_QUERY, CATEGORIES_BY_USER_QUERY, CREATE_CATEGORIES_MUTATION };