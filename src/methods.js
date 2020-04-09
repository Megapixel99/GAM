// Licensed under Apache Version 2.0
// Please see the LICENSE file in the root directory of the project for more
// information

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const {
  exec,
} = require('child_process');

const emailRegex = /\S+@\S+\.\S+/g;

function getFormattedDate(date) {
  const year = date.getFullYear();

  let month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : `0${month}`;

  let day = date.getDate().toString();
  day = day.length > 1 ? day : `0${day}`;

  return `${month}-${day}-${year}`;
}

function copyFileSync(source, target) {
  let targetFile = target;

  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];

  const targetFolder = target;
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach((file) => {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory() && file.match(/backup-\d{2}-\d{2}-\d{4}/g) !== null) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

function backup(dir = path.join(require('os').homedir(), '/.ssh')) {
  const folderName = `backup-${getFormattedDate(new Date())}`;
  try {
    copyFolderRecursiveSync(dir, path.join(dir, `/${folderName}`));
    return folderName;
  } catch (e) {
    throw e;
  }
}

function chooseAlias(customStr, dir = path.join(require('os').homedir(), '/.ssh')) {
  const aliasList = [];
  fs.readdirSync(dir).forEach((file) => {
    if (file.match(/id_rsa_(.*)\.pub/g)) {
      aliasList.push(file.substring(7, file.length - 4));
    }
  });
  return new Promise((resolve, reject) => {
    inquirer.prompt({
      type: 'list',
      name: 'alias',
      message: `Choose an alias${customStr}:`,
      choices: aliasList,
    })
      .then((answer) => {
        resolve(answer.alias);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function generateKey(alias, email, passphrase, bits = 4096, dir = path.join(require('os').homedir(), '/.ssh')) {
  return new Promise(((resolve, reject) => {
    exec(`ssh-keygen -f ${path.join(dir, `id_rsa_${alias}`)} -t rsa -b ${bits} -C ${email} -N ${passphrase || "''"} -m PEM`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve();
    });
  }));
}

function getAliasEmail(alias, dir = path.join(require('os').homedir(), '/.ssh')) {
  let userEmail;
  const pathToPubKey = path.join(dir, `id_rsa_${alias}.pub`);
  if (fs.readFileSync(pathToPubKey).toString().match(emailRegex)) {
    userEmail = fs.readFileSync(pathToPubKey).toString().match(emailRegex)[0];
  } else {
    userEmail = 'None found';
  }
  return ({
    email: userEmail,
  });
}

function getCurrentEmail(dir = path.join(require('os').homedir(), '/.ssh', 'id_rsa')) {
  let userEmail;
  if (fs.readFileSync(dir).toString().match(/\[user\](.*\n\t)(.*\n)/g)) {
    const user = fs.readFileSync(dir).toString()
      .match(/\[user\](.*\n\t)(.*\n)/g)[0].replace(/\t/g, '')
      .split('\n');
    user.pop();
    userEmail = user[1].split(' = ')[1];
  } else {
    userEmail = 'None found';
  }
  return ({
    email: userEmail,
  });
}

async function changeEmail(email, dir = path.join(require('os').homedir(), '/.ssh')) {
  const curr = getCurrentEmail(dir);
  return new Promise(((resolve, reject) => {
    fs.readFile(dir, (err, res) => {
      if (err) {
        reject(err);
      }
      fs.writeFileSync(dir,
        res.toString().replace(`email = ${curr.email}`, `email = ${email}`));
      resolve();
    });
  }));
}

function changeGlobalEmail(email) {
  const dir = path.join(require('os').homedir(), '.gitconfig');
  return changeEmail(email, dir);
}

function changeLocalEmail(email) {
  const dir = path.resolve(`${process.cwd()}/.git/config`);
  if (fs.existsSync(dir)) {
    return changeEmail(email, dir);
  }
  return new Promise(((resolve) => {
    resolve({
      email: 'No email set',
    });
  }));
}

function currentAliasEmail() {
  return ({
    localEmail: getCurrentEmail(path.join(require('os').homedir(), '.gitconfig')).email,
    globalEmail: getCurrentEmail(path.resolve(`${process.cwd()}/.git/config`)).email,
  });
}

function addSshKeyAgent(alias, dir = path.join(require('os').homedir(), '/.ssh')) {
  return new Promise(((resolve, reject) => {
    exec(`ssh-add ${dir}/id_rsa_${alias}`, (error, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve();
    });
  }));
}

async function createAlias(alias, email, passphrase, bits = 4096, dir = path.join(require('os').homedir(), '/.ssh')) {
  if (fs.existsSync(path.join(dir, `id_rsa_${alias}.pub`)) || fs.existsSync(path.join(dir, `id_rsa_${alias}`))) {
    console.log(`An SSH key already exsists for the alias: ${alias}, please choose a different alias and try again`);
    alias = null;
  }
  return new Promise(async (resolve, reject) => {
    const promises = [
      await new Promise((resolve, reject) => {
        if (!alias) {
          inquirer.prompt({
            type: 'input',
            name: 'alias',
            message: 'Please enter an alias to be associated with this new git profile:',
          })
            .then(async (answer) => {
              alias = answer.alias;
              while (fs.existsSync(path.join(dir, `id_rsa_${alias}.pub`)) || fs.existsSync(path.join(dir, `id_rsa_${alias}`)) || alias === '') {
                let message;
                if (alias === '') {
                  message = `${alias} is not a valid alias name, please enter a different name:`;
                } else {
                  message = 'An SSH key already exsists for the alias, please enter different alias:';
                }
                await inquirer.prompt({
                  type: 'input',
                  name: 'alias',
                  message,
                })
                  .then((answer2) => {
                    alias = answer2.alias;
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          resolve();
        }
      }),
      await new Promise((resolve, reject) => {
        if (!email) {
          inquirer.prompt({
            type: 'input',
            name: 'email',
            message: 'Please enter an email, to be associated with this new git profile:',
          })
            .then(async (answer) => {
              email = answer.email;
              while (!email.match(emailRegex)) {
                await inquirer.prompt({
                  type: 'input',
                  name: 'email',
                  message: `${email} is not a valid email, please enter a valid email to be associated with this new git profile:`,
                })
                  .then((answer2) => {
                    email = answer2.email;
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          resolve();
        }
      }),
      await new Promise((resolve, reject) => {
        if (!passphrase) {
          inquirer.prompt({
            type: 'password',
            name: 'passphrase',
            message: 'Please enter a passphrase (leave empty for no passphrase):',
          })
            .then(async (answer1) => {
              await inquirer.prompt({
                type: 'password',
                name: 'passphrase',
                message: 'Please re-enter the passphrase (leave empty for no passphrase):',
              })
                .then(async (answer2) => {
                  if (answer1.passphrase === answer2.passphrase) {
                    passphrase = answer1.passphrase;
                    resolve();
                  } else {
                    await inquirer.prompt({
                      type: 'password',
                      name: 'passphrase',
                      message: 'Your passphrases did not match' + '\n'
                                                + 'Please re-enter the passphrase (leave empty for no passphrase):',
                    })
                      .then((answer3) => {
                        if (answer1.passphrase === answer3.passphrase) {
                          passphrase = answer1.passphrase;
                          resolve();
                        } else {
                          throw (new Error('Your passphrases did not match' + '\n'
                                                    + 'Exiting the program due to too many failed attempts'));
                          process.exit(1);
                        }
                      })
                      .catch((error) => {
                        reject(error);
                      });
                  }
                })
                .catch((error) => {
                  reject(error);
                });
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          resolve();
        }
      }),
    ];
    Promise.all(promises).then(() => {
      console.log(alias);
      resolve({
        alias,
        email,
        passphrase,
        bits,
        dir,
      });
    });
  });
}

function changeAlias(alias, dir = path.join(require('os').homedir(), '/.ssh')) {
  return new Promise((async (resolve, reject) => {
    if (fs.existsSync(path.join(dir, `id_rsa_${alias}.pub`))) {
      const pubKey = (await fs.readFileSync(path.join(dir, `id_rsa_${alias}.pub`)));
      const email = pubKey.toString().match(/\S+@\S+\.\S+/g);
      const promises = [
        fs.writeFileSync(path.join(dir, 'id_rsa.pub'), pubKey),
        fs.writeFileSync(path.join(dir, 'id_rsa'), fs.readFileSync(path.join(dir, `id_rsa_${alias}`))),
      ];
      Promise.all(promises).then(() => {
        const promises2 = [
          changeGlobalEmail(email),
          changeLocalEmail(email),
        ];
        Promise.all(promises2).then(() => {
          resolve(alias);
        }).catch((err) => {
          throw (err);
        });
      }).catch((err) => {
        throw (err);
      });
    } else {
      throw (new Error('SSH key not found'));
    }
  }));
}

function deleteAlias(alias, dir = path.join(require('os').homedir(), '/.ssh')) {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(path.join(dir, `id_rsa_${alias}.pub`)) && fs.existsSync(path.join(dir, `id_rsa_${alias}`))) {
      const promises = [
        fs.unlinkSync(path.join(dir, `id_rsa_${alias}.pub`)),
        fs.unlinkSync(path.join(dir, `id_rsa_${alias}`)),
      ];
      Promise.all(promises).then(() => {
        resolve(alias);
      }).catch((err) => {
        throw (err);
      });
    } else {
      throw (new Error('SSH key(s) not found'));
    }
  });
}

module.exports = {
  addSshKeyAgent,
  backup,
  chooseAlias,
  createAlias,
  changeAlias,
  currentAliasEmail,
  deleteAlias,
  generateKey,
  getAliasEmail,
};
