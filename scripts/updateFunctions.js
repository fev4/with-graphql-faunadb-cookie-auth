const { query: q } = require('faunadb');
const chalk = require('chalk');

const { faunaClient, updateThen, updateCatch } = require('./config');

const upFn0 = () => {
  return console.log(
    chalk.yellow('\n⚡️ ') + chalk.cyan('Updating functions\n')
  );
};

const upFn1 = async () => {
  return faunaClient
    .query(
      q.Update(q.Function('create_user'), {
        role: q.Role('fnc_role_create_user'),
        body: q.Query(
          q.Lambda(
            ['input'],
            q.Create(q.Collection('User'), {
              data: {
                email: q.Select('email', q.Var('input')),
                role: q.Select('role', q.Var('input')),
              },
              credentials: { password: q.Select('password', q.Var('input')) },
            })
          )
        ),
      })
    )
    .then(updateThen('Function "create_user"'))
    .catch(updateCatch);
};

const upFn2 = async () => {
  return faunaClient
    .query(
      q.Update(q.Function('login_user'), {
        role: q.Role('fnc_role_login_user'),
        body: q.Query(
          q.Lambda(['input'], {
            userToken: q.Select(
              ['secret'],
              q.Login(
                q.Select(
                  ['ref'],
                  q.Get(
                    q.Match(
                      q.Index('unique_User_email'),
                      q.Select('email', q.Var('input'))
                    )
                  )
                ),
                {
                  password: q.Select('password', q.Var('input')),
                  ttl: q.TimeAdd(q.Now(), 14, 'days'),
                }
              )
            ),
            userId: q.Select(
              ['ref', 'id'],
              q.Get(
                q.Match(
                  q.Index('unique_User_email'),
                  q.Select('email', q.Var('input'))
                )
              )
            ),
          })
        ),
      })
    )
    .then(updateThen('Function "login_user"'))
    .catch(updateCatch);
};

const upFn3 = async () => {
  return faunaClient
    .query(
      q.Update(q.Function('logout_user'), {
        role: q.Role('fnc_role_logout_user'),
        body: q.Query(q.Lambda('_', q.Logout(true))),
      })
    )
    .then(updateThen('Function "logout_user"'))
    .catch(updateCatch);
};

const upFn4 = async () => {
  return faunaClient
    .query(
      q.Update(q.Function('signup_user'), {
        role: q.Role('fnc_role_signup_user'),
        body: q.Query(
          q.Lambda(
            ['input'],
            q.Do(
              q.Call(q.Function('create_user'), q.Var('input')),
              q.Call(q.Function('login_user'), q.Var('input'))
            )
          )
        ),
      })
    )
    .then(updateThen('Function "signup_user"'))
    .catch(updateCatch);
};

const upFn5 = async () => {
  return faunaClient
    .query(
      q.Update(q.Function('validate_token'), {
        role: q.Role('fnc_role_validate_token'),
        body: q.Query(
          q.Lambda(['token'], q.Not(q.IsNull(q.KeyFromSecret(q.Var('token')))))
        ),
      })
    )
    .then(updateThen('Function "validate_token"'))
    .catch(updateCatch);
};

const fnList = [upFn0, upFn1, upFn2, upFn3, upFn4, upFn5];

module.exports.fnList = fnList;
