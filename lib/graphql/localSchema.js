import { gql } from 'apollo-server-micro';
import cookie from 'cookie';
import chalk from 'chalk';

import { SECRET_COOKIE_NAME } from '../cookieConfig';

const localTypeDefs = gql`
  type Query {
    validCookie: Boolean!
  }
`;

const localResolvers = {
  Query: {
    validCookie: async (root, args, context) => {
      console.log(chalk.yellow('\n⚡️ ') + chalk.cyan('query -- validCookie'));
      const { token } = context;
      let customCookie;
      if (context.req.headers.cookie) {
        const parsedCookies = cookie.parse(context.req.headers.cookie);
        customCookie = parsedCookies[SECRET_COOKIE_NAME];
      }
      if (token || customCookie) {
        console.log(
          '   query -- validCookie -- found token/cookie',
          token || customCookie
        );
        return true;
      }
      console.log('   query -- validCookie -- no valid customCookie or token');
      return false;
    },
  },
};

export { localTypeDefs, localResolvers };
