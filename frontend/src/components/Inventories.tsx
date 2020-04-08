import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, message } from 'antd';

import { userContext } from './App';
import AddInventoryButton from './AddInventoryButton';

const INVENTORIES_BY_USER_QUERY = gql`
    {
        inventoriesByUser(orderBy: createdAt_DESC) {
            id
            name
            createdAt
        }
    }
`;

const Inventories = () => {
    const { data: inventoriesData, loading: inventoriesLoading } = useQuery(INVENTORIES_BY_USER_QUERY);
    const inventories = inventoriesData ? inventoriesData.inventoriesByUser : null;

    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <>
                        <AddInventoryButton />
                        <Table
                            loading={inventoriesLoading}
                            dataSource={inventories}
                            rowKey='id'
                            columns={[
                                {
                                    title: 'Name',
                                    dataIndex: 'name'
                                }
                            ]}
                        />
                    </>
                );
            }}
        </userContext.Consumer>
    );
}
export default Inventories;
export { INVENTORIES_BY_USER_QUERY };