import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Tag, Table, message } from 'antd';

import { userContext } from './App';
import AddProductButton from './AddProductButton';
import UpdateProductButton from './UpdateProductButton';
import DeleteButton from './DeleteButton';

const PRODUCTS_BY_USER_QUERY = gql`
    {
        productsByUser {
            id
            name
            salePrice
            costPrice
            unit
            sku
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

const DELETE_PRODUCT_MUTATION = gql`
    mutation DELETE_PRODUCT_MUTATION($id: ID!) {
        deleteProduct(id: $id) {
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

interface ProductWithCount {
    product: any;
    count: number;
}

const Products = () => {
    const [productIdForDeletion, setProductIdForDeletion] = React.useState<string>();

    const { data: productsData, loading } = useQuery(PRODUCTS_BY_USER_QUERY);
    const products = productsData ? productsData.productsByUser : null;

    const { data } = useQuery(CATEGORIES_BY_USER_QUERY);
    const categoriesData = data ? data.categoriesByUser : null;

    const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION, {
        variables: { id: productIdForDeletion },
        update: (cache: any, payload: any) => {
            // Read cache for the products
            const data = cache.readQuery({ query: PRODUCTS_BY_USER_QUERY });
        
            const filteredItems = _.filter(data.productsByUser, product => product.id !== payload.data.deleteProduct.id);
            cache.writeQuery({ query: PRODUCTS_BY_USER_QUERY, data: { productsByUser: filteredItems } });
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
                        <AddProductButton categories={categoriesData} />
                        <Table
                            loading={loading}
                            dataSource={products}
                            rowKey='id'
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
                                    title: 'SKU',
                                    dataIndex: 'sku'
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
                                            <DeleteButton
                                                onClick={() => setProductIdForDeletion(value)}
                                                onDelete={async () => {
                                                    message.info('Please wait...');
                                                    await deleteProduct()
                                                    .then(() => {
                                                        message.success('Product deleted');
                                                    })
                                                    .catch(res => {
                                                        _.forEach(res.graphQLErrors, error => message.error(error.message));
                                                        message.error('Error: cannot delete product. Please contact SourceCodeXL.');
                                                    });
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
    )
}
export default Products;
export { PRODUCTS_BY_USER_QUERY, CATEGORIES_BY_USER_QUERY, CREATE_CATEGORIES_MUTATION };