const { query: q } = require('faunadb');
const chalk = require('chalk');

const { faunaClient, createThen, createCatch } = require('./config');

async function manageKeys() {
  console.log(chalk.yellow('\n⚡️ ') + chalk.cyan('Manage keys\n'));
  const publicKey = (
    await faunaClient
      .query(
        q.CreateKey({
          name: `public_key`,
          role: q.Role('public'),
        })
      )
      .then(createThen(`Key "public_key"`))
      .catch(createCatch(`Key "public_key"`))
  ).secret;
  console.log(
    chalk.yellow('\n🚀 ') +
      'Save this public client key in the .env file:\n\n' +
      '   FAUNADB_PUBLIC_ACCESS_KEY=' +
      chalk.yellow(publicKey)
  );
}

module.exports.manageKeys = manageKeys;
