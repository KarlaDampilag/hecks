import * as _ from 'lodash';

interface SaleItemProps {
    product: any; // FIXME how to use graphql types in frontend`
    salePrice: string;
    costPrice?: string;
    quantity: number;
} // FIXME how to make universal interfaces for the whole app?

export const calculateProfitBySaleItems: (saleItems: SaleItemProps[]) => number = (saleItems: SaleItemProps[]) => {
    let profit: number = 0;
    _.each(saleItems, saleItem => {
        const salePrice = saleItem.salePrice ? parseFloat(saleItem.salePrice) : 0;
        const costPrice = saleItem.costPrice ? parseFloat(saleItem.costPrice) : 0;
        const singleItemProfit = parseFloat(Number(salePrice - costPrice).toFixed(3));
        const profitWithQuantity = parseFloat(Number(singleItemProfit * saleItem.quantity).toFixed(3));
        profit += profitWithQuantity;
    });
    return profit;
}

export const calculateSubtotalBySaleItems: (saleItems: SaleItemProps[]) => number = (saleItems: SaleItemProps[]) => {
    let total: number = 0;
    _.each(saleItems, saleItem => {
        const salePrice = saleItem.salePrice ? parseFloat(saleItem.salePrice) : 0;
        total += salePrice * saleItem.quantity;
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
        discountDeduction = subtotal * (discountNumber / 100);
    }
    total = total - discountDeduction;
    if (sale.taxType == 'FLAT') {
        taxDeduction = taxNumber;
    } else {
        taxDeduction = total * (taxNumber / 100);
    }
    total = total + taxDeduction + shippingNumber;
    return total;
}