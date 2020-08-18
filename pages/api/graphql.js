import { ApolloServer } from 'apollo-server-micro';
import cookie from 'cookie';
import faunadb from 'faunadb';
import chalk from 'chalk';

import cookieSetter from '../../lib/cookieHelper';
import { SECRET_COOKIE_NAME, unsetCookieConfig } from '../../lib/cookieConfig';
import { faunaClient } from '../../lib/graphqlHelper';
import schema from '../../lib/graphql/schema';

const q = faunadb.query;

const tokenValidation = async ({ req, res }) => {
  /* Since we need to constantly validate the user token
  then it makes sense to do it before every resolver, and
  save either an empty string or a valid token in the context.
  `tokenValidation` only unsets the cookie in case it's not valid. */
  console.log(chalk.gray('\n⚙️  ') + chalk.cyan('context -- tokenValidation'));
  const { setCookie } = res;
  let isTokenValid, token;
  if (req.headers.cookie) {
    const parsedCookies = cookie.parse(req.headers.cookie);
    const customCookie = parsedCookies[SECRET_COOKIE_NAME];
    if (customCookie) {
      try {
        isTokenValid = await faunaClient(customCookie).query(
          q.Call(q.Function('validate_token'), customCookie)
        );
        if (isTokenValid === true) {
          token = customCookie;
          console.log(
            '   context -- tokenValidation --',
            chalk.green('token is valid!')
          );
          /* Don't reset the cookie with `setCookie`, as it would restart its maxAge time.
          Setting up the cookie should only be done on login or signup. */
        } else {
          token = '';
          setCookie(SECRET_COOKIE_NAME, '', unsetCookieConfig);
        }
      } catch (err) {
        console.log(
          chalk.red('   context -- tokenValidation failed, clearing cookie'),
          err.message
        );
        token = '';
        setCookie(SECRET_COOKIE_NAME, '', unsetCookieConfig);
      }
    }
    if (!customCookie) {
      console.log(chalk.red('   context -- tokenValidation, no cookie found'));
      token = '';
    }
  }
  return token;
};

const apolloServer = new ApolloServer({
  schema,
  /* The context is recalculated every time a resolver is ran,
  it runs even before `setContext` */
  context: async (ctx) => ({
    token: await tokenValidation(ctx),
    ...ctx,
  }),
  introspection: !(process.env.NODE_ENV === 'production'),
  playground: !(process.env.NODE_ENV === 'production'),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = apolloServer.createHandler({ path: '/api/graphql' });

export default cookieSetter(handler);
