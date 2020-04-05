const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
//const Subscription = require('./resolvers/Subscription');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { APP_SECRET } = require('./utils');

const resolvers = {
  Query,
  Mutation,
  //Subscription,
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => {
    return {
      ...req,
      prisma,
    }
  },
});

server.express.use(cookieParser());

// decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, APP_SECRET);
    // put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next();
});

// create a middleware that populates the user on each request
server.express.use(async (req, res, next) => {
  if (!req.userId) {
    return next();
  }
  const user = await prisma.user({ id: req.userId },
    '{ id, email, verified, permissions }'
  );
  req.user = user;
  next();
});

const opts = {
  port: 4000,
  cors: {
    credentials: true,
    origin: ["http://localhost:3000"] // your frontend url.
  }
};

server.express.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

server.start(opts, () =>
  console.log(`Server is running on http://localhost:${opts.port}`)
);  