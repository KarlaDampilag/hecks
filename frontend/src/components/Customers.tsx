import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, message } from 'antd';

import { userContext } from './App';
import AddCustomerButton from './AddCustomerButton';
import DeleteButton from './DeleteButton';

const CUSTOMERS_BY_USER_QUERY = gql`
    {
        customersByUser(orderBy: createdAt_DESC) {
            id
            name
            email
            phone
            street1
            street2
            city
            state
            zipCode
            country
            createdAt
        }
    }
`;

const Customers = () => {
    const [idForDeletion, setIdForDeletion] = React.useState<string>();

    const { data: customersData, loading: customersLoading } = useQuery(CUSTOMERS_BY_USER_QUERY);
    const customers = customersData ? customersData.customersByUser : null;

    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <>
                        <AddCustomerButton />
                        <Table
                            loading={customersLoading}
                            dataSource={customers}
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
                                            //<UpdateProductButton product={record} categories={categoriesData} />
                                            <p>Not yet implemented.</p>
                                        );
                                    }
                                },
                                {
                                    title: 'Delete ',
                                    dataIndex: 'id',
                                    key: 'edit',
                                    render: (value) => {
                                        return (
                                            // <DeleteButton
                                            //     onClick={() => setIdForDeletion(value)}
                                            //     onDelete={async () => {
                                            //         await deleteInventory();
                                            //         if (deleteInventoryError) {
                                            //             message.error('Error: cannot delete. Please contact SourceCodeXL.');
                                            //         } else {
                                            //             message.success('Ivnentory is successfully deleted.');
                                            //         }
                                            //     }}
                                            // />
                                            <p>Not yet implemented</p>
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
export default Customers;
export { CUSTOMERS_BY_USER_QUERY };