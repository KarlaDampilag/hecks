import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Table } from 'antd';

import AddInventoryStockButton from './AddInventoryStockButton';

const INVENTORY_ITEMS_BY_USER = gql`
query INVENTORY_ITEMS_BY_USER($id: ID!) {
    inventoryItemsByUser(id: $id) {
        product {
            id
            name
        }
    }
}
`;

const INVENTORY_BY_USER = gql`
query INVENTORY_BY_USER($id: ID!) {
    inventoryByUser(id: $id) {
        id
        name
    }
}
`;

const Inventory = (props: any) => {
    const query = new URLSearchParams(props.location.search);
    const id = query.get('id');

    const { data: inventoryItemsData, loading } = useQuery(INVENTORY_ITEMS_BY_USER, {
        variables: { id }
    });
    const inventoryItems = inventoryItemsData ? inventoryItemsData.inventoryItemsByUser : null;

    const { data: inventoryData } = useQuery(INVENTORY_BY_USER, {
        variables: { id }
    });
    const inventory = inventoryData ? inventoryData.inventoryByUser : null;

    return (
        <>
            <AddInventoryStockButton inventory={inventory} />
            <Table
                loading={loading}
                dataSource={inventoryItems}
                rowKey='id'
                columns={[
                    {
                        title: 'Product',
                        dataIndex: 'product.name'
                    }
                ]}
            />
        </>
    )
}
export default Inventory;