import {
  mergeSchemas,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
} from 'apollo-server-micro';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import cookie from 'cookie';
import chalk from 'chalk';

import { remoteTypeDefs } from './remoteSchema';
import { localTypeDefs, localResolvers } from './localSchema';
import { createOverrideResolvers } from './overrideSchema';
import { SECRET_COOKIE_NAME } from '../cookieConfig';

/* We create the link from scratch because we need to use
`concat` later on */
const httpLink = new createHttpLink({
  uri: 'https://graphql.fauna.com/graphql',
  fetch,
});

/* `setContext` runs before any remote request by `delegateToSchema`,
this is due to `contextlink.concat`.
In other words, it runs before delegating to Fauna.
In general, this function is in charge of deciding which token to use
in the headers, the public one or the one from the user. For example,
during login or signup it will always default to the public token
because it will not find any token in the headers from `previousContext` */
const contextlink = setContext((_, previousContext) => {
  console.log(chalk.gray('⚙️  ') + chalk.cyan('schema -- setContext'));
  let token = process.env.FAUNADB_PUBLIC_ACCESS_KEY; // public token
  const { req } = previousContext.graphqlContext;
  if (!req.headers.cookie)
    console.log(
      '   schema -- setContext -- Setting headers with default public token.'
    );
  if (req.headers.cookie) {
    const parsedCookie = cookie.parse(req.headers.cookie);
    const customCookie = parsedCookie[SECRET_COOKIE_NAME];
    if (customCookie) {
      console.log(
        '   schema -- setContext -- Found custom cookie. Re-setting headers with it.'
      );
      token = customCookie;
    }
  }
  /* `token` is the public one always, except for when
  we find a `customCookie` */
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
});

/* Then we finally create the link to use to handle the remote schemas */
const link = contextlink.concat(httpLink);

/* We'll not be using `introspectSchema` in order to avoid 
a second trip to the Fauna server.
The remote schema was downloaded directly from Fauna 
and saved to local file (remoteTypeDefs). */
const remoteExecutableSchema = makeRemoteExecutableSchema({
  schema: remoteTypeDefs,
  link,
});

/* `localExecutableSchema` is used to implement functionality 
exclusive only to the client. */
const localExecutableSchema = makeExecutableSchema({
  typeDefs: localTypeDefs,
  resolvers: localResolvers,
});

const schema = mergeSchemas({
  schemas: [remoteExecutableSchema, localExecutableSchema],
  /* `createOverrideResolvers` helps, as it names implies,
  to override UDFs present in Fauna Graphql endpoint.
  These overrides will run before hitting Fauna's servers. 
  Refer back to setContext for the function that sets
  the headers before connecting to Fauna. */
  resolvers: createOverrideResolvers(
    remoteExecutableSchema,
    localExecutableSchema
  ),
});

export default schema;
