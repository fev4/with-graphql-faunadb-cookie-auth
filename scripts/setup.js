const { uploadSchema } = require('./uploadSchema');
const { fnList } = require('./updateFunctions');
const { roleFnList } = require('./createRoles');
const { manageKeys } = require('./manageKeys');

const fullFnList = [uploadSchema, ...roleFnList, ...fnList, manageKeys];

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
