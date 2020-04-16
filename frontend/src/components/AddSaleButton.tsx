import React from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Modal, Form, Input, Select, Button, message, DatePicker, Divider, Spin, InputNumber, Table } from 'antd';
import { PlusOutlined, DeleteOutlined, DeleteRowOutlined } from '@ant-design/icons';
import moment from 'moment';
import * as _ from 'lodash';

import { CUSTOMERS_BY_USER_QUERY } from './Customers';

const CREATE_SALE_MUTATION = gql`
    mutation CREATE_SALE_MUTATION(
        $saleItems: [SaleItemInput!]!,
        $timestamp: Int!,
        $customerId: String,
        $discountType: SpecialSaleDeductionType,
        $discountValue: String,
        $taxType: SpecialSaleDeductionType,
        $taxValue: String,
        $shipping: String,
        $note: String
    ) {
        createSaleAndItems(
            saleItems: $saleItems,
            timestamp: $timestamp,
            customerId: $customerId,
            discountType: $discountType,
            discountValue: $discountValue,
            taxType: $taxType,
            taxValue: $taxValue,
            shipping: $shipping,
            note: $note
        ) {
            id
            customer {
                id
                name
            }        
            discountType
            discountValue
            taxType
            taxValue
            shipping
            note    
            createdAt
        }
    }
`;

const PRODUCTS_BY_USER_QUERY = gql`
    {
        productsByUser {
            id
            name
            salePrice
            costPrice
        }
    }
`;

const calculateProfitBySaleItems = (saleItems: SaleItemProps[]) => {
    let profit = 0;
    _.each(saleItems, saleItem => {
        const product = saleItem.product;
        if (product && product.salePrice) {
            const singleItemProfit = parseFloat(Number(product.salePrice - product.costPrice).toFixed(3));
            const profitWithQuantity = parseFloat(Number(singleItemProfit * saleItem.quantity).toFixed(3));
            profit += profitWithQuantity;
        }
    });
    return profit;
}

interface SaleItemProps {
    product: any; // FIXME how to use graphql types in frontend
    quantity: number;
}

const AddSaleButton = () => {
    const [modalIsVisible, setModalIsVisible] = React.useState<boolean>();
    const [saleItems, setSaleItems] = React.useState<SaleItemProps[]>([{
        product: {
            id: null
        },
        quantity: 1
    }]);
    const [filteredSaleItems, setFilteredSaleItems] = React.useState<SaleItemProps[]>();
    const [customerId, setCustomerId] = React.useState<string>();
    const [timestamp, setTimestamp] = React.useState<number>(moment().unix());
    const [discountType, setDiscountType] = React.useState<string>('FLAT');
    const [discountValue, setDiscountValue] = React.useState<string | null>();
    const [taxType, setTaxType] = React.useState<string>('FLAT');
    const [taxValue, setTaxValue] = React.useState<string | null>();
    const [shipping, setShipping] = React.useState<string | null>();
    const [note, setNote] = React.useState<string>();
    const [subTotal, setSubTotal] = React.useState<number>(0);
    const [total, setTotal] = React.useState<number>();
    const [profit, setProfit] = React.useState<number>();
    const [form] = Form.useForm();

    React.useEffect(() => {
        let total = subTotal;
        let discountDeduction;
        let taxDeduction;
        const discountNumber = discountValue ? parseFloat(discountValue) : 0;
        const taxNumber = taxValue ? parseFloat(taxValue) : 0;
        const shippingNumber = shipping ? parseFloat(shipping) : 0;
        if (discountType == 'FLAT') {
            discountDeduction = discountNumber;
        } else {
            discountDeduction = subTotal * (discountNumber / 100);
        }
        if (taxType == 'FLAT') {
            taxDeduction = taxNumber;
        } else {
            taxDeduction = subTotal * (taxNumber / 100);
        }
        total = total - discountDeduction - taxDeduction - shippingNumber;
        setTotal(total);

        const profit = calculateProfitBySaleItems(saleItems);
        setProfit(profit);
    }, [saleItems, discountType, discountValue, taxType, taxValue, shipping]);

    const [createSaleAndItems, { error: createSaleError, loading: createSaleLoading }] = useMutation(CREATE_SALE_MUTATION, {
        variables: { saleItems: filteredSaleItems, customerId, timestamp, discountType, discountValue, taxType, taxValue, shipping, note },
    });

    const { data: productsByUserData } = useQuery(PRODUCTS_BY_USER_QUERY);
    const products = productsByUserData ? productsByUserData.productsByUser : [];
    _.each(products, product => {
        delete product.__typename;
    });
    const saleItemIds = _.map(saleItems, saleItem => saleItem.product.id);

    const { data: customersByUserData } = useQuery(CUSTOMERS_BY_USER_QUERY);
    const customers = customersByUserData ? customersByUserData.customersByUser : null;

    const handleProductChange = (saleItem: SaleItemProps, value: string) => {
        const updatedSaleItems = [...saleItems];
        const updatedSaleItem: SaleItemProps = { ...saleItem };
        updatedSaleItem.product = JSON.parse(value);
        const index = _.findIndex(updatedSaleItems, saleItem);
        updatedSaleItems.splice(index, 1, updatedSaleItem);
        setSaleItems(updatedSaleItems);
        updateSubTotal(updatedSaleItems);

        const filteredItems: SaleItemProps[] = _.filter(updatedSaleItems, item => item.product.id != null);
        setFilteredSaleItems(filteredItems);
    }

    const handleQuantityChange = (saleItem: SaleItemProps, value: number | undefined) => {
        const updatedSaleItems = [...saleItems];
        const updatedSaleItem: SaleItemProps = { ...saleItem };
        updatedSaleItem.quantity = value ? value : 0;
        const index = _.findIndex(updatedSaleItems, saleItem);
        updatedSaleItems.splice(index, 1, updatedSaleItem);
        setSaleItems(updatedSaleItems);
        updateSubTotal(updatedSaleItems);
    }

    const updateSubTotal = (saleItems: SaleItemProps[]) => {
        let total = 0;
        _.map(saleItems, saleItem => {
            const product = _.find(products, { id: saleItem.product.id });
            if (product) {
                const price = product.salePrice;
                total += price * saleItem.quantity;
            }
        });
        setSubTotal(total);
    }

    const layout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 }
    }

    return (
        <>
            <Modal
                title="Add a Sale Record"
                visible={modalIsVisible}
                onCancel={() => setModalIsVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    labelAlign='left'
                    onFinish={async () => {
                        if (saleItems.length > 0 && saleItems[0].product.id !== null) {
                            const createSaleResponse = await createSaleAndItems();

                            if (createSaleError) {
                                message.error('Error saving sale entry. Please contact SourceCodeXL.');
                            } else {
                                setModalIsVisible(false);
                                form.resetFields();
                                setCustomerId(undefined);
                                setSaleItems([{
                                    product: {
                                        id: null
                                    },
                                    quantity: 1
                                }]);
                                setSubTotal(0);
                                setDiscountType('FLAT');
                                setDiscountValue(undefined);
                                setTaxType('FLAT');
                                setTaxValue(undefined);
                                message.success('Sale record added');
                            }
                        } else {
                            message.error('Minimum of one product is required to record a sale');
                        }
                    }}
                >
                    <Form.Item label='Date of Sale' {...layout} rules={[{ required: true, message: 'This field is required' }]}>
                        <DatePicker
                            allowClear={false}
                            defaultValue={moment()}
                            format={'DD-MM-YYYY'}
                            value={moment.unix(timestamp)}
                            onChange={(date) => setTimestamp(moment(date as any).unix())}
                            style={{ width: '190px' }}
                        />
                    </Form.Item>
                    <Form.Item label='Customer' {...layout}>
                        <Select
                            value={customerId}
                            onChange={setCustomerId}
                            style={{ width: '190px' }}
                        >
                            {
                                _.map(customers, customer => (
                                    <Select.Option key={customer.id} value={customer.id}>{customer.name}</Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Divider />

                    <Table
                        size='small'
                        pagination={false}
                        dataSource={saleItems}
                        rowKey='id'
                        columns={[
                            {
                                width: 300,
                                title: 'Product',
                                dataIndex: 'id',
                                render: (value, record) => (
                                    <Select
                                        style={{ width: '100%' }}
                                        value={record.product.id && JSON.stringify(record.product)}
                                        onChange={(value) => handleProductChange(record, value)}
                                        placeholder='Add a product'
                                    >
                                        {
                                            _.map(products, product =>
                                                <Select.Option
                                                    value={JSON.stringify(product)}
                                                    disabled={_.includes(saleItemIds, product.id)}
                                                    key={product.id}
                                                >
                                                    {product.name}
                                                </Select.Option>
                                            )
                                        }
                                    </Select>
                                )
                            },
                            {
                                title: 'Quantity',
                                dataIndex: 'quantity',
                                render: (value, record) => (
                                    <InputNumber
                                        value={value}
                                        min={1}
                                        onChange={(value) => handleQuantityChange(record, value)}
                                    />
                                )
                            },
                            {
                                title: 'Price',
                                dataIndex: 'product',
                                render: (value) => (
                                    value.salePrice
                                )
                            },
                            {
                                title: 'Cost',
                                dataIndex: 'product',
                                render: (value) => (
                                    value.costPrice
                                )
                            },
                            {
                                title: '(Profit)',
                                dataIndex: 'product',
                                render: (value, record) => {
                                    return calculateProfitBySaleItems([record]);
                                }
                            },
                            {
                                title: 'Total',
                                dataIndex: 'product',
                                render: (value, record) => (
                                    value.salePrice && record.quantity && value.salePrice * record.quantity
                                )
                            },
                            {
                                title: 'Remove',
                                dataIndex: 'product',
                                render: (value, record) => (
                                    <span
                                        style={{ 'cursor': 'pointer' }}
                                        onClick={() => {
                                            let newSaleItems = [...saleItems];
                                            newSaleItems = _.filter(newSaleItems, newSaleItem => {
                                                return newSaleItem != record
                                            });
                                            setSaleItems(newSaleItems);
                                            updateSubTotal(newSaleItems);
                                        }}
                                    >❌</span>
                                )
                            }
                        ]}
                    />

                    <Form.Item>
                        <Button
                            style={{ 'marginTop': '15px' }}
                            onClick={() => {
                                const newSaleItems = [...saleItems];
                                newSaleItems.push({
                                    product: {
                                        id: null
                                    },
                                    quantity: 1
                                });
                                setSaleItems(newSaleItems);
                            }}
                        >➕ Add Product</Button>
                    </Form.Item>

                    <Divider />

                    <span>Discount:</span>
                    <div className='deduction-form-row'>
                        <div className='deduction-type-col'>
                            <Form.Item>
                                <Select
                                    defaultValue='FLAT'
                                    style={{ width: '100%' }}
                                    value={discountType}
                                    onChange={(value) => setDiscountType(value)}
                                >
                                    <Select.Option value={'FLAT'} key={'FLAT'}>{'FLAT'}</Select.Option>
                                    <Select.Option value={'PERCENTAGE'} key={'%'}>{'%'}</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <div className='deduction-value-col'>
                            <Form.Item>
                                <InputNumber
                                    value={discountValue ? parseFloat(discountValue) : 0}
                                    onChange={(value) => {
                                        let valueToSet = null;
                                        if (value) {
                                            valueToSet = value.toString();
                                        }
                                        setDiscountValue(valueToSet)
                                    }}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <span>Tax:</span>
                    <div className='deduction-form-row'>
                        <div className='deduction-type-col'>
                            <Form.Item>
                                <Select
                                    defaultValue='FLAT'
                                    style={{ width: '100%' }}
                                    value={taxType}
                                    onChange={(value) => setTaxType(value)}
                                >
                                    <Select.Option value={'FLAT'} key={'FLAT'}>{'FLAT'}</Select.Option>
                                    <Select.Option value={'PERCENTAGE'} key={'%'}>{'%'}</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <div className='deduction-value-col'>
                            <Form.Item>
                                <InputNumber
                                    value={taxValue ? parseFloat(taxValue) : 0}
                                    onChange={(value) => {
                                        let valueToSet = null;
                                        if (value) {
                                            valueToSet = value.toString();
                                        }
                                        setTaxValue(valueToSet)
                                    }}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <Form.Item
                        label='Shipping'
                        name='shipping'
                        {...layout}
                    >
                        <InputNumber
                            value={shipping ? parseFloat(shipping) : 0}
                            onChange={value => {
                                let valueToSet = null;
                                if (value) {
                                    valueToSet = value.toString();
                                }
                                setShipping(valueToSet);
                            }}
                        />
                    </Form.Item>

                    <Divider />

                    <div>
                        <span className='bold'>SUBTOTAL: {subTotal}</span>
                    </div>
                    <div>
                        <span className='bold'>TOTAL: {total}</span>
                    </div>
                    <div>
                        <span className='bold'>(PROFIT: {profit})</span>
                    </div>

                    <Divider />

                    <Form.Item
                        label="Notes"
                        name="notes"
                        {...layout}
                    >
                        <Input value={note} onChange={e => setNote(e.target.value)} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" disabled={createSaleLoading} loading={createSaleLoading} style={{ width: '100%' }}>
                            Add{createSaleLoading ? 'ing' : ' '} Sale Record
                                </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Button
                onClick={() => setModalIsVisible(true)}
                size='large'
                icon={<PlusOutlined />}
                className='add-button'
            >
                Add Sale Record
            </Button>
        </>
    )
}
export default AddSaleButton;