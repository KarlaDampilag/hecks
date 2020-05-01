import React from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, message } from 'antd';

import { userContext } from './App';
import AddCustomerButton from './AddCustomerButton';
import UpdateCustomerButton from './UpdateCustomerButton';
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

const DELETE_CUSTOMER_MUTATION = gql`
    mutation DELETE_CUSTOMER_MUTATION($id: ID!) {
        deleteCustomer(id: $id) {
            id
            name
            createdAt
        }
    }
`;

const Customers = () => {
    const [idForDeletion, setIdForDeletion] = React.useState<string>();

    const { data: customersData, loading: customersLoading } = useQuery(CUSTOMERS_BY_USER_QUERY);
    const customers = customersData ? customersData.customersByUser : null;

    const [deleteCustomer] = useMutation(DELETE_CUSTOMER_MUTATION, {
        variables: { id: idForDeletion },
        update: (cache: any, payload: any) => {
            const data = cache.readQuery({ query: CUSTOMERS_BY_USER_QUERY });
            const filteredItems = _.filter(data.customersByUser, item => item.id !== payload.data.deleteCustomer.id);
            cache.writeQuery({ query: CUSTOMERS_BY_USER_QUERY, data: { customersByUser: filteredItems } });
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
                                    title: 'Email',
                                    dataIndex: 'email'
                                },
                                {
                                    title: 'Phone',
                                    dataIndex: 'phone'
                                },
                                {
                                    title: 'Address',
                                    dataIndex: 'id',
                                    key: 'address',
                                    render: (value, record) => {
                                        const allowed = ['street1', 'street2', 'city', 'state', 'zipCode', 'country'];
                                        const filteredObj = _.pick(record, allowed)
                                        return (
                                            _.filter(Object.values(filteredObj), value => value).join(', ')
                                        )
                                    }
                                },
                                {
                                    title: 'Edit ✏️',
                                    dataIndex: 'id',
                                    key: 'edit',
                                    render: (value, record) => {
                                        return (
                                            <UpdateCustomerButton customer={record} />
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
                                                    await deleteCustomer()
                                                        .then(() => {
                                                            message.success('Customer deleted');
                                                        })
                                                        .catch(res => {
                                                            _.forEach(res.graphQLErrors, error => message.error(error.message));
                                                            message.error('Error: cannot delete. Please contact SourceCodeXL.');
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
    );
}
export default Customers;
export { CUSTOMERS_BY_USER_QUERY };