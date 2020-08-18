const { query: q } = require('faunadb');
const chalk = require('chalk');

const { faunaClient, createThen, createCatch } = require('./config');

// This file contains the config for all the roles
// Notice we are also creating here a function (crFnc1) that uses a previously created role (crRol5)

const crRol0 = () => {
  return console.log(chalk.yellow('\n⚡️ ') + chalk.cyan('Creating roles\n'));
};

const crRol1 = async () => {
  return faunaClient
    .query(
      q.CreateRole({
        name: 'fnc_role_create_user',
        privileges: [
          {
            resource: q.Collection('User'),
            actions: {
              read: true,
              create: q.Query(
                q.Lambda(
                  'values',
                  q.Equals(
                    q.Select(['data', 'role'], q.Var('values')),
                    'FREE_USER'
                  )
                )
              ),
            },
          },
        ],
      })
    )
    .then(createThen(`Role "fnc_role_create_user"`))
    .catch(createCatch(`Role "fnc_role_create_user"`));
};

const crRol2 = async () => {
  return faunaClient
    .query(
      q.CreateRole({
        name: 'fnc_role_login_user',
        privileges: [
          {
            resource: q.Index('unique_User_email'),
            actions: {
              unrestricted_read: true,
            },
          },
          {
            resource: q.Collection('User'),
            actions: {
              read: true,
            },
          },
        ],
      })
    )
    .then(createThen(`Role "fnc_role_login_user"`))
    .catch(createCatch(`Role "fnc_role_login_user"`));
};

const crRol3 = async () => {
  return faunaClient
    .query(
      q.CreateRole({
        name: 'fnc_role_logout_user',
        privileges: [
          {
            resource: q.Ref('tokens'),
            actions: {
              create: true,
              read: true,
            },
          },
        ],
      })
    )
    .then(createThen(`Role "fnc_role_logout_user"`))
    .catch(createCatch(`Role "fnc_role_logout_user"`));
};

const crRol4 = async () => {
  return faunaClient
    .query(
      q.CreateRole({
        name: 'fnc_role_signup_user',
        privileges: [
          {
            resource: q.Function('create_user'),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function('login_user'),
            actions: {
              call: true,
            },
          },
        ],
      })
    )
    .then(createThen(`Role "fnc_role_signup_user"`))
    .catch(createCatch(`Role "fnc_role_signup_user"`));
};

const crRol5 = async () => {
  return faunaClient
    .query(
      q.CreateRole({
        name: 'fnc_role_validate_token',
        privileges: [
          {
            resource: q.Ref('tokens'),
            actions: {
              read: true,
            },
          },
        ],
      })
    )
    .then(createThen(`Role "fnc_role_validate_token"`))
    .catch(createCatch(`Role "fnc_role_validate_token"`));
};

const crFnc1 = async () => {
  return faunaClient
    .query(
      q.CreateFunction({
        name: 'validate_token',
        body: q.Query(
          q.Lambda(
            '_',
            q.Abort('Function validate_token is not implemented yet.')
          )
        ),
      })
    )
    .then(createThen(`Function "validate_token"`))
    .catch(createCatch(`Function "validate_token"`));
};

const crRol6 = async () => {
  return faunaClient
    .query(
      q.CreateRole({
        name: 'free_user',
        privileges: [
          {
            resource: q.Collection('User'),
            actions: {
              read: q.Query(
                q.Lambda('userRef', q.Equals(q.Identity(), q.Var('userRef')))
              ),
              write: q.Query(
                q.Lambda(
                  ['_', 'newData', 'userRef'],
                  q.And(
                    q.Equals(q.Identity(), q.Var('userRef')),
                    q.Equals(
                      'FREE_USER',
                      q.Select(['data', 'role'], q.Var('newData'))
                    )
                  )
                )
              ),
            },
          },
          {
            resource: q.Function('validate_token'),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function('logout_user'),
            actions: {
              call: true,
            },
          },
        ],
        membership: [
          {
            resource: q.Collection('User'),
            predicate: q.Query(
              q.Lambda(
                'userRef',
                q.Or(
                  q.Equals(
                    q.Select(['data', 'role'], q.Get(q.Var('userRef'))),
                    'FREE_USER'
                  )
                )
              )
            ),
          },
        ],
      })
    )
    .then(createThen(`Role "free_user"`))
    .catch(createCatch(`Role "free_user"`));
};

const crRol7 = async () => {
  return faunaClient
    .query(
      q.CreateRole({
        name: 'public',
        privileges: [
          {
            resource: q.Function('signup_user'),
            actions: {
              call: true,
            },
          },
          {
            resource: q.Function('login_user'),
            actions: {
              call: true,
            },
          },
        ],
      })
    )
    .then(createThen(`Role "public"`))
    .catch(createCatch(`Role "public"`));
};

const fnList = [
  crRol0,
  crRol1,
  crRol2,
  crRol3,
  crRol4,
  crRol5,
  crFnc1,
  crRol6,
  crRol7,
];

module.exports.roleFnList = fnList;
