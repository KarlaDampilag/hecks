import * as _ from 'lodash';
import React from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Modal, Button, Input, Form, Select, Spin, message } from 'antd';

import { ALL_PRODUCTS_QUERY } from './Products';

const CREATE_PRODUCT_MUTATION = gql`
mutation CREATE_PRODUCT_MUTATION(
    $name: String!
    $salePrice: String!
    $costPrice: String
    $unit: String
    $notes: String
    $image: String
    $largeImage: String
    $categories: [String!]
) {
    createProduct(
        name: $name
        salePrice: $salePrice
        costPrice: $costPrice
        unit: $unit
        notes: $notes
        image: $image
        largeImage: $largeImage
        categories: $categories
    ) {
        id
        name
        salePrice
        costPrice
        unit
        notes
        image
        largeImage
        categories
        createdAt
    }
}
`;

const CREATE_CATEGORIES_MUTATION = gql`
    mutation CREATE_CATEGORIES_MUTATION($names: [String!]!) {
        createCategories(names: $names)
    }
`;

const ALL_CATEGORIES_QUERY = gql`
    {
        categories {
            id
            name
        }
    }
`;


const AddProductButton = () => {
    const [name, setName] = React.useState<string>();
    const [salePrice, setSalePrice] = React.useState<string>();
    const [costPrice, setCostPrice] = React.useState<string>();
    const [unit, setUnit] = React.useState<string>();
    const [notes, setNotes] = React.useState<string>();
    const [image, setImage] = React.useState<string | null>(null);
    const [largeImage, setLargeImage] = React.useState<string | null>(null);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [newCategories, setNewCategories] = React.useState<string[]>([]);
    const [isShowingModal, setIsShowingModal] = React.useState<boolean>(false);
    const [imageIsLoading, setImageIsLoading] = React.useState<boolean>(false);

    const [form] = Form.useForm();

    const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? e.target.files : [];
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'sickfits'); // needed by Cloudinary

        setImageIsLoading(true);
        const response = await fetch('https://api.cloudinary.com/v1_1/dlki0o7xf/image/upload', {
            method: 'POST',
            body: data
        });

        const file = await response.json();
        if (file && file.secure_url && file.eager) {
            setImage(file.secure_url);
            setLargeImage(file.eager[0].secure_url);
        } else {
            setImage(null);
            setLargeImage(null);
        }
        setImageIsLoading(false);
    }

    const updateProductsCache = (cache: any, payload: any) => {
        // Read cache for the products
        const data = cache.readQuery({ query: ALL_PRODUCTS_QUERY });

        // Add the new product
        data.products.push(payload.data.createProduct);
        data.products = _.sortBy(data.products, 'createdAt');

        // Put the updated products back in the cache
        cache.writeQuery({ query: ALL_PRODUCTS_QUERY, data })
    }

    const updateCategoriesCache = (cache: any, payload: any) => {
        // Read cache for the categories
        const data = cache.readQuery({ query: ALL_CATEGORIES_QUERY });

        // Add the new categories
        data.categories = [...data.categories, ...payload.data.createCategories];

        // Put the updated categories back in the cache
        cache.writeQuery({ query: ALL_CATEGORIES_QUERY, data })
    }

    const { data, loading: queryCategoriesLoading, error: queryCategoriesError } = useQuery(ALL_CATEGORIES_QUERY);
    const categoriesData = data ? data.categories : null;
    const options = _.map(categoriesData, category => category.name);

    const [createProduct, { loading: createProductLoading, error: createProductError }] = useMutation(CREATE_PRODUCT_MUTATION, {
        variables: { name, salePrice, costPrice, unit, notes, image, largeImage, categories },
        update: updateProductsCache
    });

    const [createCategories, { loading: createCategoriesLoading, error: createCategoriesError }] = useMutation(CREATE_CATEGORIES_MUTATION, {
        variables: { names: newCategories },
        update: updateCategoriesCache
    });

    return (
        <>
            <Modal title='Add a Product' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
                <Form {...layout} form={form} onFinish={async () => {
                    let response;

                    if (newCategories && newCategories.length > 0) {
                        response = await createCategories();
                        if (createCategoriesError) {
                            message.error(createCategoriesError.message.replace('GraphQL error: ', ''));
                        }
                        console.log(response)
                    }
                    response = await createProduct();

                    if (createProductError) {
                        message.error(createProductError.message.replace('GraphQL error: ', ''));
                    } else {
                        setIsShowingModal(false);
                        form.resetFields();
                        setImage(null);
                        message.success('Product added');
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
                        label="Sale Price"
                        name="salePrice"
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Input type='number' onChange={e => setSalePrice(e.target.value.toString())} />
                    </Form.Item>

                    <Form.Item
                        label="Cost Price"
                        name="costPrice"
                    >
                        <Input type='number' onChange={e => setCostPrice(e.target.value.toString())} />
                    </Form.Item>

                    <Form.Item
                        label="Unit"
                        name="unit"
                    >
                        <Input value={unit} onChange={e => setUnit(e.target.value)} />
                    </Form.Item>

                    <Form.Item
                        label="Categories"
                        name="categories"
                    >
                        <Select
                            value={categories}
                            mode='tags'
                            placeholder='Start typing to add...'
                            onChange={value => {
                                setCategories(value);
                                const newCategoriesToSave = _.filter(value, category => options.indexOf(category) < 0);
                                setNewCategories(newCategoriesToSave);
                            }}
                        >
                            {
                                _.map(options, (option, key) => (
                                    <Select.Option value={option} key={key}>{option}</Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Notes"
                        name="notes"
                    >
                        <Input value={notes} onChange={e => setNotes(e.target.value)} />
                    </Form.Item>

                    <Form.Item
                        label="Image"
                        name="image"
                    >
                        <Input type='file' placeholder='Upload an image' onChange={uploadFile} /> 
                        {imageIsLoading && <Spin />}
                        {image && <img src={image} width='200' alt='upload preview' />}
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit" disabled={createProductLoading || imageIsLoading || createCategoriesLoading}>Add{createProductLoading || imageIsLoading || createCategoriesLoading ? 'ing ' : ' '} Product</Button>
                        <Button onClick={() => setIsShowingModal(false)}>Cancel</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Button onClick={() => setIsShowingModal(true)}>Add Product</Button>
        </>
    );
}
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

export default AddProductButton;
export { layout, tailLayout, ALL_CATEGORIES_QUERY, CREATE_CATEGORIES_MUTATION };