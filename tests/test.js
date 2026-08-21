const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const { spawnSync } = require('child_process');
const methods = require('../src/methods.js');
const packageVersion = require('../package.json').version;

const dir = path.join(__dirname, 'test');
const managerPath = path.join(__dirname, '..', 'src', 'manager.js');
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

// Runs the CLI the way a user does — as a program — with HOME pointed at an empty
// directory, so ~/.gitconfig does not exist. Requiring the module would not test this:
// manager.js reads process.argv and dispatches while it loads, so only spawning it
// exercises the path a caller hits. The exit status is returned alongside the output
// because both are part of what the CLI promises.
function runCli(args) {
  const emptyHome = fs.mkdtempSync(path.join(os.tmpdir(), 'gam-no-gitconfig-'));
  try {
    const res = spawnSync(process.execPath, [managerPath].concat(args), {
      encoding: 'utf8',
      // USERPROFILE as well as HOME: os.homedir() reads that one on Windows.
      env: { ...process.env, HOME: emptyHome, USERPROFILE: emptyHome },
    });
    return {
      status: res.status,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
    };
  } finally {
    fs.rmSync(emptyHome, { recursive: true, force: true });
  }
}

const refusedRegex = /Could not find a git configuration/;

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
    // The CLI itself, with no git configuration present. `version` and `help` need
    // none, so they must answer normally; the commands that read ~/.gitconfig must
    // refuse — and must exit NON-ZERO when they do, so a caller checking the status
    // does not read "refused to start" as success.
    await testFunction({
      func: () => {
        const res = runCli(['version']);
        return {
          status: res.status,
          reportsVersion: res.stdout.includes(`Current version: ${packageVersion}`),
          refused: refusedRegex.test(res.stdout + res.stderr),
        };
      },
      params: [],
      expected: { status: 0, reportsVersion: true, refused: false },
      name: '`version` answers without a git config, and exits 0',
    });
    await testFunction({
      func: () => {
        const res = runCli(['help']);
        return {
          status: res.status,
          printsUsage: res.stdout.includes('Usage: gam'),
          refused: refusedRegex.test(res.stdout + res.stderr),
        };
      },
      params: [],
      expected: { status: 0, printsUsage: true, refused: false },
      name: '`help` answers without a git config, and exits 0',
    });
    await testFunction({
      func: () => {
        const res = runCli(['current-alias-email']);
        const output = res.stdout + res.stderr;
        return {
          status: res.status,
          refused: refusedRegex.test(output),
          // The wording is checked too, so the 'dowload' typo cannot come back.
          saysDownload: output.includes('please download git and try again'),
        };
      },
      params: [],
      expected: { status: 1, refused: true, saysDownload: true },
      name: '`current-alias-email` refuses without a git config, and exits non-zero',
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
