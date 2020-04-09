#!/usr/bin/env node

// Licensed under Apache Version 2.0
// Please see the LICENSE file in the root directory of the project for more
// information

const path = require('path');
const fs = require('fs');
const methods = require('./methods.js');

const args = process.argv.splice(2);

const alias = (args.includes('a') || args.includes('alias'))
  ? ((args[args.indexOf('alias')] && args[args.indexOf('alias') + 1]) || (args[args.indexOf('a')] && args[args.indexOf('a') + 1])) : null;
const email = (args.includes('e') || args.includes('email'))
  ? ((args[args.indexOf('email')] && args[args.indexOf('email') + 1]) || (args[args.indexOf('e')] && args[args.indexOf('e') + 1])) : null;
const passphrase = (args.includes('p') || args.includes('passphrase'))
  ? ((args[args.indexOf('passphrase')] && args[args.indexOf('passphrase') + 1]) || (args[args.indexOf('p')] && args[args.indexOf('p') + 1])) : null;
const bits = (args.includes('b') || args.includes('bits'))
  ? ((args[args.indexOf('bits')] && args[args.indexOf('bits') + 1]) || (args[args.indexOf('b')] && args[args.indexOf('b') + 1])) : 4096;
const dir = (args.includes('d') || args.includes('directory'))
  ? ((args[args.indexOf('directory')] && args[args.indexOf('directory') + 1]) || (args[args.indexOf('b')] && args[args.indexOf('b') + 1])) : path.join(require('os').homedir(), '/.ssh');

if (!fs.existsSync(path.join(require('os').homedir(), '.gitconfig'))) {
  console.log('Could not find a git configuration for the current user, please dowload git and try again');
  console.log('exiting program');
  process.exit(0);
}

if (args[0] === 'create-alias') {
  methods.createAlias(alias, email, passphrase, bits, dir).then(async (newAlias) => {
    console.log('\n' + 'Generating SSH Keys...');
    await methods.generateKey(newAlias.alias, newAlias.email, newAlias.passphrase, newAlias.bits, newAlias.dir).then(async () => {
      console.log('\n' + 'Adding SSH Keys to the SSH authentication agent...');
      await methods.addSshKeyAgent(newAlias.alias, newAlias.dir);
      console.log(`${'Successfully generated an SSH Key for the new git profile' + '\n'
          + 'Your new public and private keys can be found here: '}${newAlias.dir}, and are called id_rsa_${newAlias.alias} and id_rsa_${newAlias.alias}.pub`
          + '\n\n'
          + 'Please copy your key to your prefered git repository to begin using it.');
    });
  });
} else if (args[0] === 'change-alias') {
  if (!alias) {
    methods.chooseAlias(' to use', dir).then(async (_alias) => {
      methods.changeAlias(_alias, dir).then((newAlias) => {
        console.log(`${'Successfully changed alias' + '\n' + 'Current alias: '}${newAlias}`);
      }).catch((err) => {
        throw (err);
      });
    }).catch((err) => {
      throw (err);
    });
  } else {
    methods.changeAlias(alias, dir).then((newAlias) => {
      console.log(`${'Successfully changed alias' + '\n' + 'Current alias: '}${newAlias}`);
    }).catch((err) => {
      throw (err);
    });
  }
} else if (args[0] === 'delete-alias') {
  if (!alias) {
    methods.chooseAlias(' to delete', dir).then(async (_alias) => {
      methods.deleteAlias(_alias, dir).then((delAlias) => {
        console.log(`Successfully deleted alias: ${delAlias}` + '\n'
                  + 'You may need to change you current alias, if you were using the alias you just deleted');
      }).catch((err) => {
        throw (err);
      });
    }).catch((err) => {
      throw (err);
    });
  } else {
    methods.deleteAlias(alias, dir).then((delAlias) => {
      console.log(`Successfully deleted alias: ${delAlias}` + '\n'
                + 'You may need to change you current alias, if you were using the alias you just deleted');
    }).catch((err) => {
      throw (err);
    });
  }
} else if (args[0] === 'current-alias-email') {
  const emails = methods.currentAliasEmail();
  console.log('Current Alias Info:' + '\n'
        + '  ' + 'Global:' + '\n'
        + '    ' + 'Email:' + ` ${emails.globalEmail}\n`
        + '  ' + 'Local:' + '\n'
        + '    ' + 'Email:' + ` ${emails.localEmail}`);
} else if (args[0] === 'backup') {
  try {
    const folderName = methods.backup(dir);
    console.log(`Created Backup folder named: ${folderName}` + ' successfully.');
  } catch (e) {
    console.log('An error occured when creating the backup folder');
    throw e;
  }
} else if (args[0] === 'v' || args[0] === 'version') {
  const version = process.env.npm_package_version === null ? process.env.npm_package_version : require('../package.json').version;
  console.log(`Current version: ${version}`);
} else if (args[0] === 'h' || args[0] === 'help' || args.length === 0) {
  console.log('Usage: gam [command] [options]' + '\n\n'
        + 'Available Commands:' + '\n'
        + '  ' + 'backup:             ' + ' ' + 'Creates a backup of all of the public and private keys' + '\n'
        + '  ' + 'create-alias:       ' + ' ' + 'Creates a public and private key for a new alias' + '\n'
        + '  ' + 'change-alias:       ' + ' ' + 'Changes the current public and private key to the specified alias' + '\n'
        + '  ' + 'current-alias-email:' + ' ' + 'Retrives the email assosiated with the current alias' + '\n'
        + '  ' + 'delete-alias:       ' + ' ' + 'Deletes the public and private key for an alias' + '\n'
        + '  ' + 'h, help:            ' + ' ' + 'Print available command line commands and options (currently set)' + '\n'
        + '  ' + 'v, version:         ' + ' ' + 'Print the current version' + '\n\n'
        + 'Available Options:' + '\n'
        + '  ' + 'a, alias:     ' + ' ' + 'specify the alias' + '\n'
        + '  ' + 'b, bits:      ' + ' ' + 'specify the number of bits to create for the new key, defaults to 4096, the minimmum is 1024' + '\n'
        + '  ' + 'd, directory: ' + ' ' + 'specify the directory to create the new key(s) in, defaults to the .ssh folder in the home directory' + '\n'
        + '  ' + 'e, email:     ' + ' ' + 'specify the email' + '\n'
        + '  ' + 'p, passphrase:' + ' ' + 'specify the passphrase');
} else {
  console.log(`Command: ${args[0]} not found, please try again with a different command or execute` + '\n'
        + '$ gam help' + '\n'
        + 'to see a list of commands');
}
