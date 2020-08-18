import faunadb from 'faunadb';

import { SECRET_COOKIE_NAME, unsetCookieConfig } from './cookieConfig';

// Used for any authed requests.
export const faunaClient = (secret) =>
  new faunadb.Client({
    secret,
  });

export const delegate = (
  args,
  context,
  info,
  schemaObj,
  operation,
  fieldName
) => {
  const { cookie: setCookie } = context.res;
  // To get the schema var name as a string to be used in the console log
  // in case of error
  const varToString = (varObj) => Object.keys(varObj)[0];
  return info.mergeInfo
    .delegateToSchema({
      schema: schemaObj[Object.keys(schemaObj)[0]],
      operation,
      fieldName,
      args,
      context,
      info,
    })
    .catch((error) => {
      if (fieldName !== 'logoutUser') {
        console.log(
          `${operation} (${fieldName}) - Delegation to ${varToString(
            schemaObj
          )} failed --`,
          error.message
        );
        return error;
      } else {
        if (error.message === 'Invalid database secret.') {
          console.log('Already logged out -- Deleting cookie');
          setCookie(SECRET_COOKIE_NAME, '', unsetCookieConfig);
          return 'already logged out';
        }
        if (
          error.message === 'Insufficient privileges to perform the action.'
        ) {
          console.log(
            'Already logged out and using public token -- Cookie is already deleted'
          );
          return 'already logged out';
        }
        console.log("Couldn't log user out --", error.message);
        return error.message;
      }
    });
};
