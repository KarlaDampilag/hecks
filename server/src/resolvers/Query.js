async function me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
        return null;
    }
    return await ctx.prisma.user({ id: ctx.request.userId });
}

function products(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.'); // TODO only return products that belong to the user
    }
    return ctx.prisma.products({});
}

function categories(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }
    return ctx.prisma.categories({}); // TODO only return categories that belong to the user
}

module.exports = {
    me,
    products,
    categories
}