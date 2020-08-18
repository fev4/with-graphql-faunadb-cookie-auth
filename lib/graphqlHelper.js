import faunadb from 'faunadb';

// Used for any authed requests.
export const faunaClient = (secret) =>
  new faunadb.Client({
    secret,
  });

