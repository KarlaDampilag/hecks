import * as _ from 'lodash';
import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Input, Form, Spin, Select, Modal, message } from 'antd';

import { layout, tailLayout } from './AddProductButton';
import { CATEGORIES_BY_USER_QUERY, CREATE_CATEGORIES_MUTATION } from './AddProductButton';

interface PropTypes {
  product: any; // FIXME how to use GraphQL types on frontend?
  categories: any[];
}

const UPDATE_PRODUCT_MUTATION = gql`
    mutation UPDATE_PRODUCT_MUTATION(
        $id: ID!
        $name: String
        $salePrice: String
        $costPrice: String
        $unit: String
        $notes: String
        $image: String
        $largeImage: String
        $categories: [String!]
    ) {
        updateProduct(
            id: $id
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
        }
    }
`;

const UpdateProductButton = (props: PropTypes) => {
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

  let options: string[] = [];
  if (props.categories) {
    options = _.map(props.categories, category => category.name);
  }

  const [updateProduct, { loading: updateProductLoading, error: updateProductError }] = useMutation(UPDATE_PRODUCT_MUTATION, {
    variables: { id: props.product.id, name, salePrice, costPrice, unit, notes, image, largeImage, categories }
  });

  const [createCategories, { loading: createCategoriesLoading, error: createCategoriesError }] = useMutation(CREATE_CATEGORIES_MUTATION, {
    variables: { names: newCategories }
  });

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

  return (
    <>
      <Modal title='Update Product' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
        <Form
          {...layout}
          onFinish={async e => {
            await updateProduct();
            if (newCategories && newCategories.length > 0) {
              await createCategories();
            }
            if (!updateProductError) {
              message.success('Product updated');
              setIsShowingModal(false);
            }
          }}
        >
          <Form.Item
            label="Name"
            name="name"
          >
            <Input defaultValue={props.product.name} onChange={e => setName(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Sale Price"
            name="salePrice"
          >
            <Input type='number' defaultValue={props.product.salePrice} onChange={e => setSalePrice(e.target.value.toString())} />
          </Form.Item>

          <Form.Item
            label="Cost Price"
            name="costPrice"
          >
            <Input type='number' defaultValue={props.product.costPrice} onChange={e => setCostPrice(e.target.value.toString())} />
          </Form.Item>

          <Form.Item
            label="Unit"
            name="unit"
          >
            <Input defaultValue={props.product.unit} onChange={e => setUnit(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Categories"
            name="categories"
          >
            <Select defaultValue={props.product.categories} mode='tags' onChange={value => {
              setCategories(value);
              const newCategoriesToSave = _.filter(value, category => options.indexOf(category) < 0);
              setNewCategories(newCategoriesToSave);
            }}>
              {
                options.map((option, key) => (
                  <Select.Option value={option} key={key}>{option}</Select.Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <Input defaultValue={props.product.notes} onChange={e => setNotes(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Image"
            name="image"
          >
            <Input type='file' placeholder='Upload an image' onChange={uploadFile} />
            {imageIsLoading && <Spin />}
            {image ? <img src={image} width='200' alt='upload preview' />
              : props.product.image && <img src={props.product.image} width='200' alt='current image preview' />}
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" disabled={imageIsLoading} loading={updateProductLoading}>Updat{updateProductLoading ? 'ing' : 'e'} Product</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Button onClick={() => setIsShowingModal(true)}>Edit</Button>
    </>
  )
}
export default UpdateProductButton;