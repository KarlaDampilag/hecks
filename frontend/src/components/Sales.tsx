import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, message } from 'antd';

import { userContext } from './App';
import AddSaleButton from './AddSaleButton';
import UpdateInventoryButton from './UpdateInventoryButton';
import DeleteButton from './DeleteButton';

const INVENTORIES_BY_USER_QUERY = gql`
    {
        inventoriesByUser(orderBy: createdAt_DESC) {
            id
            name
            createdAt
            inventoryItems {
                id
            }
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

    const { data: inventoriesData, loading: inventoriesLoading } = useQuery(INVENTORIES_BY_USER_QUERY);
    const inventories = inventoriesData ? inventoriesData.inventoriesByUser : null;

    const [deleteInventory, { error: deleteInventoryError }] = useMutation(DELETE_INVENTORY_MUTATION, {
        variables: { id: idForDeletion },
        update: (cache: any, payload: any) => {
            const data = cache.readQuery({ query: INVENTORIES_BY_USER_QUERY });
            const filteredItems = _.filter(data.inventoriesByUser, inventory => inventory.id !== payload.data.deleteInventory.id);
            cache.writeQuery({ query: INVENTORIES_BY_USER_QUERY, data: { inventoriesByUser: filteredItems } });
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
                            loading={inventoriesLoading}
                            dataSource={inventories}
                            rowKey='id'
                            columns={[
                                {
                                    title: 'Name',
                                    dataIndex: 'name'
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
export { INVENTORIES_BY_USER_QUERY };