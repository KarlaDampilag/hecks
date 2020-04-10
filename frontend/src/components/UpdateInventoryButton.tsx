import * as _ from 'lodash';
import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Input, Form, Spin, Select, Modal, message } from 'antd';

import { layout, tailLayout } from './AddProductButton';

interface PropTypes {
  inventory: any; // FIXME how to use GraphQL types on frontend?
}

const UPDATE_INVENTORY_MUTATION = gql`
    mutation UPDATE_INVENTORY_MUTATION(
        $id: ID!
        $name: String
    ) {
        updateInventory(
            id: $id
            name: $name
        ) {
            id
            name
        }
    }
`;

const UpdateInventoryButton = (props: PropTypes) => {
  const [name, setName] = React.useState<string>();
  const [isShowingModal, setIsShowingModal] = React.useState<boolean>(false);

  const [updateInventory, { loading: updateInventoryLoading, error: updateInventoryError }] = useMutation(UPDATE_INVENTORY_MUTATION, {
    variables: { id: props.inventory.id, name }
  });

  return (
    <>
      <Modal title='Update Inventory' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
        <Form
          {...layout}
          onFinish={async e => {
            await updateInventory();
            if (!updateInventoryError) {
              message.success('Inventory updated');
              setIsShowingModal(false);
            }
          }}
        >
          <Form.Item
            label="Name"
            name="name"
          >
            <Input defaultValue={props.inventory.name} onChange={e => setName(e.target.value)} />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" disabled={updateInventoryLoading} loading={updateInventoryLoading}>Updat{updateInventoryLoading ? 'ing' : 'e'} Inventory</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Button onClick={() => setIsShowingModal(true)}>Edit</Button>
    </>
  )
}
export default UpdateInventoryButton;