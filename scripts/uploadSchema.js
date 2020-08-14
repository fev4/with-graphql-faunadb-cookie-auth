require('dotenv').config({ path: '.env.local' });
const request = require('request');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const { ENV_NAME } = require('./config');

async function uploadSchema() {
  await new Promise((resolve, reject) => {
    console.log(
      chalk.yellow('\n⚡️ ') + chalk.cyan('Uploading Graphql Schema...\n')
    );
    fs.createReadStream(path.join(__dirname, 'faunaSchema.graphql')).pipe(
      request.post(
        {
          type: 'application/octet-stream',
          headers: {
            Authorization: `Bearer ${process.env[ENV_NAME]}`,
          },
          url: 'https://graphql.fauna.com/import',
        },
        (err, res, body) => {
          if (err) reject(err);
          resolve(body);
        }
      )
    );
  })
    .then(() => console.log(chalk.blue('✅ ') + `GraphQL schema imported`))
    .catch((error) => {
      console.log(chalk.red('⛔️ ') + ` Error during schema import`);
      console.log(error);
      process.exit(1);
    });
}

module.exports.uploadSchema = uploadSchema;
