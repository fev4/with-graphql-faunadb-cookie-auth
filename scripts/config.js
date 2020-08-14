require('dotenv').config({ path: '.env.local' });
const { Client } = require('faunadb');
const chalk = require('chalk');

const ENV_NAME = 'FAUNADB_ADMIN_SECRET';

function validateThenRun(fnc) {
  if (!process.env[ENV_NAME]) {
    console.log(
      chalk.yellow(`Required ${ENV_NAME} enviroment variable not found.`)
    );
    process.exit(1);
  }

  if (process.env[ENV_NAME]) {
    return fnc();
  }
}

function createClient() {
  const faunaClient = new Client({
    secret: process.env[ENV_NAME],
  });
  console.log(chalk.gray('\n🛠 ') + ` Fauna client created`);
  return faunaClient;
}

// Helpers
const createThen = (typeName) => (r) => {
  console.log(chalk.green('✅') + ` Created ${typeName}`);
  return r;
};

const createCatch = (typeName) => (e) => {
  try {
    // console.log(e);
    if (e.message === 'instance already exists') {
      console.log(
        chalk.yellow('⏭ ') + ` ${typeName} already exists.  Skipping...`
      );
    } else if (e.description === 'Unauthorized') {
      e.description =
        'Unauthorized: missing or invalid FAUNADB_ADMIN_SECRET, or not enough permissions';
      throw e;
    } else if (
      e.description === 'Insufficient privileges to perform the action.'
    ) {
      e.description =
        'Insufficient privileges to perform the action. Check you are using an admin key instead of a server one';
      throw e;
    } else if (e.description === 'document is not unique.') {
      e.description = `${typeName} already exists`;
      throw e;
    } else {
      throw e;
    }
  } catch (e) {
    console.log(chalk.green('⛔️ ') + (e.description || e.message));
  }
};

const updateThen = (typeName) => (r) => {
  console.log(chalk.blue('✅ ') + `Updated ${typeName}`);
  return r;
};

const updateCatch = (e) => {
  if (e) {
    if (e.message === 'unauthorized') {
      e.message =
        'unauthorized: missing or invalid fauna_server_secret, or not enough permissions';
      throw e;
    } else {
      throw e;
    }
  }
};

module.exports = {
  ENV_NAME: ENV_NAME,
  faunaClient: validateThenRun(createClient),
  createClient: createClient,
  validateThenRun: validateThenRun,
  updateCatch: updateCatch,
  updateThen: updateThen,
  createCatch: createCatch,
  createThen: createThen,
};
