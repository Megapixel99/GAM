const path = require('path');
const fs = require('fs');
const assert = require('assert');
const methods = require('../src/methods.js');

const dir = path.join(__dirname, 'test');
const isSupported = process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color';
const checkMark = isSupported ? '✔︎' : '√';
const xMark = isSupported ? '✖' : '×';
const diamondSymbol = isSupported ? '❖' : 'i';

function testPrep(dir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, () => {
        resolve();
      });
    }
  });
}

function testCleanup(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file, index) => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

function testPromise(testobj) {
  return new Promise(function (resolve) {
    console.log('\x1b[33m%s\x1b[0m', `\t${diamondSymbol}`, 'Testing: ' + `${testobj.name}`);
    testobj.func.apply(this, testobj.params).then((res, err) => {
      if (assert.deepEqual(testobj.expected, res) === undefined) {
        console.log('\x1b[32m%s\x1b[0m', `\t${checkMark}`, `${testobj.name}`);
      }
      resolve();
    }).catch((err) => {
      console.log('\x1b[31m%s\x1b[0m', `\t${xMark}`, `${testobj.name}`);
      console.log('\t\t' + '» Error: \n');
      throw (err);
    });
  });
}

function testFunction(testobj) {
  return new Promise(function (resolve) {
    console.log('\x1b[33m%s\x1b[0m', `\t${diamondSymbol}`, 'Testing: ' + `${testobj.name}`);
    try {
      if (assert.deepEqual(testobj.expected, testobj.func.apply(this, testobj.params)) === undefined) {
        console.log('\x1b[32m%s\x1b[0m', `\t${checkMark}`, `${testobj.name}`);
      }
      resolve();
    } catch (e) {
      console.log('\x1b[31m%s\x1b[0m', `\t${xMark}`, `${testobj.name}`);
      console.log('\t\t' + '» Error: \n');
      throw (e);
    }
  });
}

function runTests() {
  return new Promise(async (resolve, reject) => {
    await testPromise({
      func: methods.createAlias,
      params: ['alias', 'email@domain.com', 'passphrase'],
      expected: {
        alias: 'alias',
        email: 'email@domain.com',
        passphrase: 'passphrase',
        bits: 4096,
        dir: path.join(require('os').homedir(), '/.ssh'),
      },
      name: 'Creating an alias with default bits and directory',
    });
    await testPromise({
      func: methods.generateKey,
      params: ['alias', 'email@domain.com', 'passphrase', 4096, dir],
      name: 'Generating keys for an alias',
    });
    await testPromise({
      func: methods.generateKey,
      params: ['alias2', 'email2@domain.com', 'passphrase', 4096, dir],
      name: 'Generating keys for another alias',
    });
    await testFunction({
      func: methods.getAliasEmail,
      params: ['alias', dir],
      expected: {
        email: 'email@domain.com',
      },
      name: 'Getting alias email',
    });
    await testFunction({
      func: methods.backup,
      params: [dir],
      expected: `backup-${methods.getFormattedDate(new Date())}`,
      name: 'Creating a backup folder',
    });
    await testPromise({
      func: methods.deleteAlias,
      params: ['alias2', dir],
      expected: 'alias2',
      name: 'Deleting an alias',
    });
    await testPromise({
      func: methods.deleteAlias,
      params: ['alias', dir],
      expected: 'alias',
      name: 'Deleting another alias',
    });
    resolve();
  });
}

async function run() {
  console.log('Creating testing environment...');
  testPrep(dir);
  console.log('Running Tests:');
  await runTests();
  console.log('Cleaning up testing environment...');
  testCleanup(path.join(dir, `backup-${methods.getFormattedDate(new Date())}`));
  testCleanup(dir);
  console.log('All tests passed!');
}

// test();

module.exports = { run };
