async function me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
        return null;
    }
    return await ctx.prisma.user({ id: ctx.request.userId });
}

function products(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    return ctx.prisma.products({});
}

async function productsByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }

    return await ctx.prisma.user({ id: ctx.request.userId }).products();
}

async function productByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }

    const products = await ctx.prisma.user({ id: ctx.request.userId }).products({
        where: { id: args.id }
    });
    if (!products || products.length < 1 || !products[0]) {
        throw new Error("Cannot find this product owned by your user id.");
    }
    return products[0];
}

function categories(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    return ctx.prisma.categories({});
}

async function categoriesByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    return await ctx.prisma.categories({
        where: {
            user: { id: ctx.request.userId }
        }
    });
}

async function inventoriesByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    return await ctx.prisma.user({ id: ctx.request.userId }).inventories();
}

async function inventoryItemsByProduct(parent, args, ctx, info) {
    // const products = await ctx.prisma.user({ id: screenTop.request.userId }).products({
    //     where: { id: args.id }
    // });
    // if (!products || products.length < 1 || !products[0]) {
    //     throw new Error("Cannot find this product owned by your user id.");
    // }
    // const product = products[0];
    // console.log(product);
    return await ctx.prisma.user({ id: "ck8j4gzqo9bxe0981lgqtvjzl" }).inventoryItems({
        where: { product: { id: args.id } }
    });
}

async function inventoryItemCount(parent, args, ctx, info) {
    let count = 0;
    const inventoryItemsByProduct = await ctx.prisma.user({ id: ctx.request.userId }).inventoryItems({
        where: { product: { id: args.id } }
    });
    if (inventoryItemsByProduct) {
        count = inventoryItemsByProduct.length;
    }
    return count;
}

async function customersByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    return await ctx.prisma.user({ id: ctx.request.userId }).customers();
}

async function salesByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }

    const fragment = `
    fragment SalesWithOthers on User {
        id
        timestamp
        customer {
            name
        }
        saleItems {
            id
            quantity
            product {
                name
                salePrice
                costPrice
            }
        }
    }
    `;

    return await ctx.prisma.user({ id: ctx.request.userId }).sales().$fragment(fragment);
}

module.exports = {
    me,
    products,
    productByUser,
    productsByUser,
    categories,
    categoriesByUser,
    inventoriesByUser,
    inventoryItemsByProduct,
    inventoryItemCount,
    customersByUser,
    salesByUser
}