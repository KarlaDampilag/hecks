import * as _ from 'lodash';

interface SaleItemProps {
    product: any; // FIXME how to use graphql types in frontend
    quantity: number;
} // FIXME how to make universal interfaces for the whole app?

export const calculateProfitBySaleItems: (saleItems: SaleItemProps[]) => number = (saleItems: SaleItemProps[]) => {
    let profit: number = 0;
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

export const calculateSubtotalBySaleItems: (saleItems: SaleItemProps[]) => number = (saleItems: SaleItemProps[]) => {
    let total: number = 0;
    _.map(saleItems, saleItem => {
        const product = saleItem.product;
        if (product && product.id) {
            const price = product.salePrice;
            total += price * saleItem.quantity;
        }
    });
    return total;
}

// FIXME use proper type not any
export const calculateTotalBySale: (sale: any) => number = (sale: any) => {
    const subtotal = calculateSubtotalBySaleItems(sale.saleItems);
    let total: number = subtotal;
    let discountDeduction;
    let taxDeduction;
    const discountNumber = sale.discountValue ? parseFloat(sale.discountValue) : 0;
    const taxNumber = sale.taxValue ? parseFloat(sale.taxValue) : 0;
    const shippingNumber = sale.shipping ? parseFloat(sale.shipping) : 0;
    if (sale.discountType == 'FLAT') {
        discountDeduction = discountNumber;
    } else {
        discountDeduction = sale.subTotal * (discountNumber / 100);
    }
    if (sale.taxType == 'FLAT') {
        taxDeduction = taxNumber;
    } else {
        taxDeduction = subtotal * (taxNumber / 100);
    }
    total = total - discountDeduction - taxDeduction - shippingNumber;
    return total;
}