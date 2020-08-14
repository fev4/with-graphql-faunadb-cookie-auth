const { query: q } = require('faunadb');
const chalk = require('chalk');

const { faunaClient, createThen, createCatch } = require('./config');

// The following is an example of how to create the first user in the db
// directly with the javascript driver

const createUser = async () => {
  console.log(chalk.yellow('\n⚡️ ') + chalk.cyan('Creating user\n'));
  return faunaClient
    .query(
      q.Create(q.Collection('User'), {
        data: {
          email: '123@example.com',
          role: 'FREE_USER',
        },
        credentials: {
          password: '123',
        },
      })
    )
    .then(createThen('Document "User"'))
    .catch(createCatch('Document "User"'));
};

module.exports.createUser = createUser;
