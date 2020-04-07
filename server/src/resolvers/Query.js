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

    return await ctx.prisma.products({
        where: {
            user: { id: ctx.request.userId }
        }
    });
}

async function productByUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    const products = await ctx.prisma.products({
        where: {
            id: args.id,
            user: { id: ctx.request.userId }
        }
    });
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

module.exports = {
    me,
    products,
    productByUser,
    productsByUser,
    categories,
    categoriesByUser,
}