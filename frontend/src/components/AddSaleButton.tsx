import React from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Modal, Form, Input, Select, Button, message, DatePicker, Divider, Spin, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import * as _ from 'lodash';

// import { PRODUCTS_BY_USER_QUERY } from './Products';
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
        }
    }
`;

interface SaleItemProps {
    product: any; // FIXME how to use graphql types in frontend
    quantity: number;
}

const AddSaleButton = () => {
    const [modalIsVisible, setModalIsVisible] = React.useState<boolean>();
    const [saleId, setSaleId] = React.useState<string>();
    const [saleItems, setSaleItems] = React.useState<SaleItemProps[]>([{
        product: {
            id: null
        },
        quantity: 1
    }]);
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
        total = total - discountDeduction -  taxDeduction - shippingNumber;
        setTotal(total);
    }, [saleItems, discountType, discountValue, taxType, taxValue, shipping]);

    const [createSaleAndItems, { error: createSaleError, loading: createSaleLoading }] = useMutation(CREATE_SALE_MUTATION, {
        variables: { saleItems, customerId, timestamp, discountType, discountValue, taxType, taxValue, shipping, note },
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
            const price = product.salePrice;
            total += price * saleItem.quantity;
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
                            console.log(createSaleResponse);

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

                    {
                        _.map(saleItems, (saleItem, key) => {
                            return (
                                <div className='sale-item-form-row' key={key}>
                                    <label className='first-label'>
                                        <span>Product:</span>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={saleItem.product.id && JSON.stringify(saleItem.product)}
                                            onChange={(value) => handleProductChange(saleItem, value)}
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
                                    </label>

                                    <label>
                                        <span>Quantity:</span>
                                        <InputNumber
                                            value={saleItem.quantity}
                                            min={1}
                                            onChange={(value) => handleQuantityChange(saleItem, value)}
                                        />
                                    </label>

                                    <label>
                                        <span>Price:</span>
                                        <div style={{ 'padding': '5px 0 0 5px' }}>{saleItem.product.salePrice}</div>
                                    </label>

                                    <label>
                                        <span>Total:</span>
                                        <div style={{ 'padding': '5px 0 0 5px' }}>
                                            {saleItem.product.salePrice && saleItem.quantity && saleItem.product.salePrice * saleItem.quantity}
                                        </div>
                                    </label>

                                    <div className='x-container'>
                                        <span
                                            style={{ 'cursor': 'pointer', 'fontSize': '13pt' }}
                                            onClick={() => {
                                                let newSaleItems = [...saleItems];
                                                newSaleItems = _.filter(newSaleItems, newSaleItem => {
                                                    return newSaleItem != saleItem
                                                });
                                                setSaleItems(newSaleItems);
                                                updateSubTotal(newSaleItems);
                                            }}
                                        >❌</span>
                                    </div>
                                </div>
                            );
                        })
                    }
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

                    <div>
                        <span className='bold'>SUBTOTAL: {subTotal}</span>
                    </div>

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
                        <span className='bold'>TOTAL: {total}</span>
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