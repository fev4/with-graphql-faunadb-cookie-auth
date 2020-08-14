const { uploadSchema } = require('./uploadSchema');
const { fnList } = require('./updateFunctions');
const { roleFnList } = require('./createRoles');
const { manageKeys } = require('./manageKeys');
const { createUser } = require('./createDoc');

const fullFnList = [
  uploadSchema,
  ...roleFnList,
  ...fnList,
  createUser,
  manageKeys,
];

// Inspired by the script on ptpaterson's example
// https://github.com/ptpaterson/netlify-faunadb-graphql-auth/tree/master/scripts

module.exports.full = async function full() {
  for (const fn of fullFnList) {
    await fn();
  }
};

module.exports.updateFunctions = async function updateFunctions() {
  for (const fn of fnList) {
    await fn();
  }
};

module.exports.createRoles = async function createRoles() {
  for (const fn of roleFnList) {
    await fn();
  }
};

module.exports.manageKeys = manageKeys;

module.exports.uploadSchema = uploadSchema;

module.exports.createUser = createUser;

// Run:
// node - e 'require("./scripts/setup.js").full()'
// to run the full setup script
// Alternatevely you can run each function by it self
// Similar to:
// node - e 'require("./scripts/setup.js").updateFunctions()'
// or
// node - e 'require("./scripts/setup.js").uploadSchema()'
