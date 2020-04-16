import * as _ from 'lodash';

interface SaleItemProps {
    product: any; // FIXME how to use graphql types in frontend
    quantity: number;
} // FIXME how to make universal interfaces for the whole app?

export const calculateProfitBySaleItems = (saleItems: SaleItemProps[]) => {
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

export const calculateSubtotalBySaleItems = (saleItems: SaleItemProps[]) => {
    let total = 0;
    _.map(saleItems, saleItem => {
        const product = saleItem.product;
        if (product) {
            const price = product.salePrice;
            total += price * saleItem.quantity;
        }
    });
    return total;
}