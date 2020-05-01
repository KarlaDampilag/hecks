import * as React from 'react';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Modal, Table, Divider } from 'antd';

import { calculateProfitBySaleItems, calculateSubtotalBySaleItems, calculateTotalBySale } from '../services/main';

interface PropTypes {
    sale: any; // FIXME use sale interface from graphql
}

const SaleDetails = (props: PropTypes) => {
    const renderDiscount = () => {
        if (props.sale.discountType && props.sale.discountValue) {
            if (props.sale.discountType == 'FLAT') {
                return props.sale.discountValue;
            }
            return `${props.sale.discountValue} %`
        }
        return null;
    }

    const renderTax = () => {
        if (props.sale.taxType && props.sale.taxValue) {
            if (props.sale.taxType == 'FLAT') {
                return props.sale.taxValue;
            }
            return `${props.sale.taxValue} %`;
        }
        return null;
    }

    return (
        <>
            <div className='bold'><p>SALE DETAILS:</p></div>
            {
                props.sale && (<>
                    <Table
                        size='small'
                        pagination={false}
                        dataSource={props.sale.saleItems}
                        rowKey='id'
                        columns={[
                            {
                                title: 'Product',
                                dataIndex: 'id',
                                render: (value, record) => (
                                    record.product.name
                                )
                            },
                            {
                                title: 'Quantity',
                                dataIndex: 'quantity'
                            },
                            {
                                title: 'Price',
                                dataIndex: 'salePrice',
                                render: (value) => (
                                    value
                                )
                            },
                            {
                                title: 'Cost',
                                dataIndex: 'costPrice',
                                render: (value) => (
                                    value
                                )
                            },
                            {
                                title: 'Subtotal',
                                dataIndex: 'id',
                                render: (value, record) => {
                                    return calculateSubtotalBySaleItems([record]);
                                }
                            },
                            {
                                title: 'Profit',
                                dataIndex: 'product',
                                render: (value, record) => {
                                    return calculateProfitBySaleItems([record]);
                                }
                            }
                        ]}
                        summary={(pageData) => {
                            const totalProfit = calculateProfitBySaleItems(pageData);
                            const totalSubtotal = calculateSubtotalBySaleItems(pageData);
                            let totalQuantity: number = 0;
                            _.each(pageData, saleItem => {
                                totalQuantity += saleItem.quantity;
                            });

                            return (
                                <>
                                    <tr>
                                        <th style={{ padding: '8px' }}>Total</th>
                                        <th style={{ padding: '8px' }}>{totalQuantity}</th>
                                        <th style={{ padding: '8px' }}></th>
                                        <th style={{ padding: '8px' }}></th>
                                        <th style={{ padding: '8px' }}>{totalSubtotal}</th>
                                        <th style={{ padding: '8px' }}>{totalProfit}</th>
                                    </tr>
                                </>
                            )
                        }}
                    />

                    <div>NOTE: {props.sale.note}</div>

                    <Divider />

                    <div>
                        <div className='summary-row'>
                            <span>DISCOUNT:</span> <span>{renderDiscount()}</span>
                        </div>
                        <div className='summary-row'>
                            <span>TAX:</span> <span>{renderTax()}</span>
                        </div>
                        <div className='summary-row'>
                            <span>SHIPPING:</span> <span>{props.sale.shipping}</span>
                        </div>
                        <div className='summary-row bold' style={{ marginTop: '.5em' }}>
                            <span>TOTAL:</span> <span>{calculateTotalBySale(props.sale)}</span>
                        </div>
                    </div>
                </>)
            }
        </>
    )
}
export default SaleDetails;