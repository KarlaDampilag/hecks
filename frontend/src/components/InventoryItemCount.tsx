import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const INVENTORY_ITEM_COUNT = gql`
    query INVENTORY_ITEM_COUNT($id: ID!) {
        inventoryItemCount(id: $id)
    }
`;

interface PropTypes {
    product: any; // FIXME how to use graphql types in typescript frontend?
}

const InventoryItemCount = (props: PropTypes) => {
    const { data: inventoryItemCountData } = useQuery(INVENTORY_ITEM_COUNT, {
        variables: { id: props.product.id }
    });
    const count = inventoryItemCountData ? inventoryItemCountData.inventoryItemCount : 0;
    return count;
}
export default InventoryItemCount;