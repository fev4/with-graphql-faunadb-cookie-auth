import { UserInputError, ApolloError } from 'apollo-server-micro';
import chalk from 'chalk';

import {
  SECRET_COOKIE_NAME,
  unsetCookieConfig,
  setCookieConfig,
} from '../cookieConfig';
import { delegate } from '../graphqlHelper';

const createOverrideResolvers = (remoteExecutableSchema) => ({
  Mutation: {
    loginUser: async (root, args, context, info) => {
      const params = [args, context, info];
      const { setCookie } = context.res;

      if (!args.data || !args.data.email || !args.data.password) {
        throw new UserInputError('Missing input data', {
          invalidArgs: Object.keys(args),
        });
      }

      const data = await delegate(
        ...params,
        { remoteExecutableSchema },
        'mutation',
        'loginUser'
      );

      if (data.userToken) {
        console.log(
          chalk.cyan('   mutation loginUser -- setting custom cookie')
        );
        setCookie(SECRET_COOKIE_NAME, data.userToken, setCookieConfig);
        return {
          userId: data.userId,
        };
      }

      throw new ApolloError('User token not found');
    },
    signupUser: async (root, args, context, info) => {
      const params = [args, context, info];
      const { setCookie } = context.res;

      if (
        !args.data ||
        !args.data.email ||
        !args.data.password ||
        !args.data.role
      ) {
        throw new UserInputError('Missing input data', {
          invalidArgs: Object.keys(args),
        });
      }

      const data = await delegate(
        ...params,
        { remoteExecutableSchema },
        'mutation',
        'signupUser'
      );

      if (data.userToken) {
        console.log(
          chalk.cyan('   mutation signupUser -- setting custom cookie')
        );
        setCookie(SECRET_COOKIE_NAME, data.userToken, setCookieConfig);
        return {
          userId: data.userId,
        };
      }

      throw new ApolloError('User token not found');
    },
    logoutUser: async (root, args, context, info) => {
      const params = [args, context, info];
      const { setCookie } = context.res;

      // Logging out in Fauna means deleting any user specific ABAC tokens
      const data = await delegate(
        ...params,
        { remoteExecutableSchema },
        'mutation',
        'logoutUser'
      );
      if (data === 'already logged out') return true;
      if (data === true) {
        console.log('   mutation logoutUser -- Successful. Deleting cookie');
        if (data) {
          setCookie(SECRET_COOKIE_NAME, '', unsetCookieConfig);
          return data;
        }
      }
      console.log('   mutation logoutUser -- Unexpected error');
      return data;
    },
  },
});

export { createOverrideResolvers };
