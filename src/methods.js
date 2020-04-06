// Licensed under Apache Version 2.0
// Please see the LICENSE file in the root directory of the project for more
// information

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const {
  exec,
} = require('child_process');

function getFormattedDate(date) {
  const year = date.getFullYear();

  let month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : `0${month}`;

  let day = date.getDate().toString();
  day = day.length > 1 ? day : `0${day}`;

  return `${month}-${day}-${year}`;
}

function chooseAlias(dir, customStr) {
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
      message: `Choose an alias ${customStr}:`,
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

function generateKey(alias, email, passphrase, bits, dir) {
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

function getCurrentEmail(dir) {
  const user = fs.readFileSync(dir).toString()
    .match(/\[user\](.*\n\t)(.*\n)/g)[0].replace(/\t/g, '')
    .split('\n');
  user.pop();
  return ({
    email: user[1].split(' = ')[1],
  });
}

async function changeEmail(email, dir) {
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

function currentAlias() {
  return ({
    localEmail: getCurrentEmail(path.join(require('os').homedir(), '.gitconfig')).email,
    globalEmail: getCurrentEmail(path.resolve(`${process.cwd()}/.git/config`)).email,
  });
}

function addSshKeyAgent(alias, dir) {
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

async function createAlias(alias, email, passphrase, bits, dir) {
  if (fs.existsSync(path.join(dir, `id_rsa_${alias}.pub`)) || fs.existsSync(path.join(dir, `id_rsa_${alias}`))) {
    console.log(`An SSH key already exsists for the alias: ${alias}, please choose a different alias and try again`);
    alias = null;
  } else {
    if (!alias) {
      await new Promise((resolve, reject) => {
        inquirer.prompt({
          type: 'input',
          name: 'alias',
          message: 'Please enter an alias to be assosiated with this new git profile:',
        })
          .then(async (answer) => {
            alias = answer.alias;
            while (fs.existsSync(path.join(dir, `id_rsa_${alias}.pub`)) || fs.existsSync(path.join(dir, `id_rsa_${alias}`))) {
              await inquirer.prompt({
                type: 'input',
                name: 'alias',
                message: 'An SSH key already exsists for the alias, please enter different alias:',
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
      });
    }
    if (!email) {
      await new Promise((resolve, reject) => {
        inquirer.prompt({
          type: 'input',
          name: 'email',
          message: 'Please enter an email, to be assosiated with this new git profile:',
        })
          .then(async (answer) => {
            email = answer.email;
            while (!email.match(/\S+@\S+\.\S+/g)) {
              await inquirer.prompt({
                type: 'input',
                name: 'email',
                message: `${email} is not a valid email, please enter a valid email to be assosiated with this new git profile:`,
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
      });
    }
    if (!passphrase) {
      await new Promise((resolve, reject) => {
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
                        console.log('Your passphrases did not match' + '\n'
                                                    + 'Exiting the program due to too many failed attempts');
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
      });
    }
    console.log('\n' + 'Generating SSH Keys...');
    await generateKey(alias, email, passphrase, bits, dir);
    console.log('\n' + 'Adding SSH Keys to the SSH authentication agent...');
    await addSshKeyAgent(alias, dir);
    console.log(`${'Successfully generated an SSH Key for the new git profile' + '\n'
            + 'Your new public and private keys can be found here: '}${dir}, and are called id_rsa_${alias} and id_rsa_${alias}.pub`
            + '\n\n'
            + 'Please copy your key to your prefered git repository to begin using it.');
  }
}

async function changeAlias(alias, dir) {
  const pubKey = (await fs.readFileSync(path.join(dir, `id_rsa_${alias}.pub`)));
  const email = pubKey.toString().match(/\S+@\S+\.\S+/g);
  const promises = [
    fs.writeFileSync(path.join(dir, 'id_rsa.pub'), pubKey),
    fs.writeFileSync(path.join(dir, 'id_rsa'), fs.readFileSync(path.join(dir, `id_rsa_${alias}`))),
  ];
  Promise.all(promises).then(async () => {
    const promises2 = [
      changeGlobalEmail(email),
      changeLocalEmail(email),
    ];
    Promise.all(promises2).then(() => {
      console.log(`${'Successfully changed alias' + '\n'
                + 'Current alias: '}${alias}`);
    }).catch((err) => {
      throw (err);
    });
  }).catch((err) => {
    throw (err);
  });
}

function deleteAlias(alias, dir) {
  const promises = [
    fs.unlinkSync(path.join(dir, `id_rsa_${alias}.pub`)),
    fs.unlinkSync(path.join(dir, `id_rsa_${alias}`)),
  ];
  Promise.all(promises).then(async () => {
    console.log('Successfully deleted alias' + '\n'
            + 'You may need to change you current alias, if you were using the alias you just deleted');
  }).catch((err) => {
    throw (err);
  });
}

module.exports = {
  chooseAlias,
  createAlias,
  changeAlias,
  deleteAlias,
  currentAlias,
};
