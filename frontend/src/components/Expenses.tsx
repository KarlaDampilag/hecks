import React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, message, Button } from 'antd';

import { userContext } from './App';
import AddExpenseButton from './AddExpenseButton';
import UpdateExpenseButton from './UpdateExpenseButton';
import DeleteButton from './DeleteButton';

const EXPENSES_BY_USER_QUERY = gql`
    {
        expensesByUser(orderBy: createdAt_DESC) {
            id
            name
            description
            cost
            createdAt
        }
    }
`;

const DELETE_EXPENSE_MUTATION = gql`
    mutation DELETE_EXPENSE_MUTATION($id: ID!) {
        deleteExpense(id: $id) {
            id
            name
            description
            cost
            createdAt
        }
    }
`;

const Expenses = () => {
    const [idForDeletion, setIdForDeletion] = React.useState<string>();

    const { data, loading } = useQuery(EXPENSES_BY_USER_QUERY);
    const expenses = data ? data.expensesByUser : null;

    const [deleteExpense] = useMutation(DELETE_EXPENSE_MUTATION, {
        variables: { id: idForDeletion },
        update: (cache: any, payload: any) => {
            const data = cache.readQuery({ query: EXPENSES_BY_USER_QUERY });
            const filteredItems = _.filter(data.expensesByUser, expense => expense.id !== payload.data.deleteExpense.id);
            cache.writeQuery({ query: EXPENSES_BY_USER_QUERY, data: { expensesByUser: filteredItems } });
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
                        <AddExpenseButton />
                        <Table
                            loading={loading}
                            dataSource={expenses}
                            rowKey='id'
                            columns={[
                                {
                                    title: 'Date',
                                    dataIndex: 'createdAt',
                                    render: (value) => (
                                        moment(value).format("Do MMMM YYYY")
                                    )
                                },
                                {
                                    title: 'Name',
                                    dataIndex: 'name'
                                },
                                {
                                    title: 'Description',
                                    dataIndex: 'description'
                                },
                                {
                                    title: 'Cost',
                                    dataIndex: 'cost'
                                },
                                {
                                    title: 'Edit ✏️',
                                    dataIndex: 'id',
                                    key: 'edit',
                                    render: (value, record) => {
                                        return (
                                            <UpdateExpenseButton expense={record} />
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
                                                    await deleteExpense()
                                                        .then(() => {
                                                            message.success('Expense deleted');
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
                            summary={(pageData) => {
                                let totalCost = 0;
                                _.each(pageData, expense => totalCost += parseFloat(expense.cost));

                                return (
                                    <>
                                        <tr>
                                            <th style={{ padding: '8px' }}>Total</th>
                                            <th style={{ padding: '8px' }}></th>
                                            <th style={{ padding: '8px' }}></th>
                                            <th style={{ padding: '8px' }}>{totalCost}</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </>
                                )
                            }}
                        />
                    </>
                );
            }}
        </userContext.Consumer>
    );
}
export default Expenses;
export { EXPENSES_BY_USER_QUERY };