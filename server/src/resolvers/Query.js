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

async function inventoryByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    const items = await ctx.prisma.user({ id: ctx.request.userId }).inventories({
        where: { id: args.id }
    });
    if (!items || items.length < 1 || !items[0]) {
        throw new Error("Cannot find this inventory owned by your user id.");
    }
    return items[0];
}

async function inventoryItemsByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    return await ctx.prisma.inventory({ id: args.id }).inventoryItems();
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
            id
            name
        }
        saleItems {
            id
            quantity
            product {
                id
                name
                salePrice
                costPrice
            }
            salePrice
            costPrice
        }
        discountType
        discountValue
        taxType
        taxValue
        shipping
        note
        createdAt
    }
    `;

    return await ctx.prisma.user({ id: ctx.request.userId }).sales({ orderBy: args.orderBy }).$fragment(fragment);
}

module.exports = {
    me,
    products,
    productByUser,
    productsByUser,
    categories,
    categoriesByUser,
    inventoriesByUser,
    inventoryByUser,
    inventoryItemsByUser,
    customersByUser,
    salesByUser
}