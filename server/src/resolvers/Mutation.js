const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { APP_SECRET, getUserId } = require('../utils');

async function signup(parent, args, ctx, info) {
    // check if the passwords match
    if (args.password !== args.confirmPassword) {
        throw new Error("Passwords don't match");
    }

    // lowercase their email
    args.email = args.email.toLowerCase();

    // check if user already exists
    const existingUser = await ctx.prisma.user({ email: args.email });

    if (existingUser) {
        throw new Error('Email is already taken');
    }

    // hash their password
    const password = await bcrypt.hash(args.password, 10);

    // set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const confirmEmailToken = (await randomBytesPromiseified(20)).toString('hex');

    // const user = await ctx.prisma.createUser({ ...args, password });
    // create the user in the database
    const user = await ctx.prisma.createUser({
        email: args.email,
        password,
        role: 'owner',
        verified: false,
        confirmEmailToken
    });

    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });

    return user;
}

async function login(parent, args, ctx, info) {
    const user = await ctx.prisma.user({ email: args.email });
    if (!user) {
        throw new Error('No such email found');
    }

    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });

    return user;
}

function logout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return 'Goodbye!';
}

async function createProduct(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }

    const product = await ctx.prisma.createProduct({
        ...args,
        // create a relationship between the product and the user
        user: {
            connect: {
                id: ctx.request.userId
            }
        },
        categories: { set: args.categories }

    });

    return product;
}

async function createCategories(parent, args, ctx, info) {
    if (!ctx.request.userId) {
        throw new Error('You must be logged in to do that.');
    }

    const newCategories = await Promise.all(args.names.map(async name => {
        const newCategory = await ctx.prisma.createCategory({
            // create a relationship between the category and the user
            user: {
                connect: {
                    id: ctx.request.userId
                }
            },
            name: name
        });
        return newCategory;
    }));
    return newCategories;
}

async function updateProduct(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };

    // remove id from the updates so it won't get updated
    delete updates.id

    return await ctx.prisma.updateProduct({
      data: {
        ...updates,
        categories: { set: args.categories }
      },
      where: {
        id: args.id
      }
    });
  }

module.exports = {
    signup,
    login,
    logout,
    createProduct,
    createCategories,
    updateProduct
}