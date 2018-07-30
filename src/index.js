import 'dotenv/config';
import path from 'path';
import express from 'express';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import models from './models';

const { PORT } = process.env;
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
const graphqlEndpoint = '/graphql';

const auth = jwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false,
});

app.use(
  graphqlEndpoint,
  bodyParser.json(),
  auth,
  graphqlExpress(req => ({
    schema,
    context: {
      models,
      user: req.user,
    },
  }))
);

app.use('/graphiql', graphiqlExpress({ endpointURL: graphqlEndpoint }));

models.sequelize.sync().then(() => {
  app.listen(PORT);
});
