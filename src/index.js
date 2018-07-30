import 'dotenv/config';
import path from 'path';
import express from 'express';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlExpress } from 'apollo-server-express';
import expressPlayground from 'graphql-playground-middleware-express';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import models from './models';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const graphqlEndpoint = '/graphql';
const { PORT } = process.env;

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

app.use('/playground', expressPlayground({ endpointUrl: graphqlEndpoint }));

models.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () =>
    console.log(`The server is running on http://localhost:${PORT}/playground`)
  );
});
