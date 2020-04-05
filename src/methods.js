// Licensed under Apache Version 2.0
// Please see the LICENSE file in the root directory of the project for more
// information

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const {
    exec
} = require("child_process");

function getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '-' + day + '-' + year;
}

function chooseAlias(dir, customStr) {
    const aliasList = [];
    fs.readdirSync(dir).forEach(file => {
        if (file.match(/id_rsa_(.*)\.pub/g)) {
            aliasList.push(file.substring(7, file.length - 4));
        }
    });
    return new Promise(async function(resolve, reject) {
        await inquirer.prompt({
                type: "list",
                name: "alias",
                message: "Choose an alias " + customStr + ":",
                choices: aliasList
            })
            .then(answer => {
                resolve(answer.alias);
            })
            .catch(function(error) {
                reject(error);
            });
    });
}

async function saveName(name, alias, dir) {
    await fs.writeFileSync(path.join(dir, "name_" + alias), name);
}

function generateKey(alias, email, passphrase, bits, dir) {
    return new Promise(function(resolve, reject) {
        exec("ssh-keygen -f " + path.join(dir, "id_rsa_" + alias) + " -t rsa -b " + bits + " -C " + email + " -N " + (passphrase || "''"), (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                reject(stderr);
            }
            resolve()
        });
    });
}

function getCurrentNameAndEmail(dir) {
    return new Promise(function(resolve, reject) {
        fs.readFile(dir, function(err, res) {
            if (err) {
                reject(err);
            }
            let user = res.toString().match(/\[user\](.*\n\t)(.*\n\t)(.*\n)/g)[0]
                .replace(/\t/g, '').replace(/ = /g, '=').split("\n")
            user.pop();
            resolve({
                name: user[2].split("=")[1],
                email: user[1].split("=")[1]
            });
        });
    });
}

async function changeNameAndEmail(name, email, dir) {
    let curr = (await getCurrentNameAndEmail(dir));
    return new Promise(function(resolve, reject) {
        fs.readFile(dir, function(err, res) {
            if (err) {
                reject(err);
            }
            fs.writeFileSync(dir,
                res.toString().replace("email = " + curr.email, "email = " + email)
                .replace("name = " + curr.name, "name = " + name));
            resolve();
        });
    });
}

function changeGlobalNameAndEmail(name, email) {
    let dir = path.join(require('os').homedir(), ".gitconfig");
    return changeNameAndEmail(name, email, dir);
}

function changeLocalNameAndEmail(name, email) {
    let dir = path.resolve(process.cwd() + "/.git/config");
    if (fs.existsSync(dir)) {
        return changeNameAndEmail(name, email, dir);
    } else {
        return new Promise(function(resolve) {
            resolve()
        });
    }
}

function addSshKeyAgent(alias, dir) {
    return new Promise(function(resolve, reject) {
        exec("ssh-add " + dir + "/id_rsa_" + alias, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                reject(stderr);
            }
            resolve();
        });
    });
}

async function createAlias(alias, email, passphrase, name, bits, dir) {
    if (fs.existsSync(path.join(dir, "id_rsa_" + alias + ".pub")) || fs.existsSync(path.join(dir, "id_rsa_" + alias))) {
        console.log("An SSH key already exsists for the alias: " + alias + ", please choose a different alias and try again");
    } else {
        if (!alias) {
            await new Promise(async function(resolve, reject) {
                await inquirer.prompt({
                        type: "input",
                        name: "alias",
                        message: "Please enter an alias to be assosiated with this new git profile:"
                    })
                    .then(answer => {
                        alias = answer.alias;
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }
        if (!name) {
            await new Promise(async function(resolve, reject) {
                await inquirer.prompt({
                        type: "input",
                        name: "name",
                        message: "Please enter an name to be assosiated with this new git profile:"
                    })
                    .then(async function(answer) {
                        await saveName(answer.name, alias, dir);
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        } else {
            await saveName(name, alias, dir);
        }
        if (!email) {
            await new Promise(async function(resolve, reject) {
                await inquirer.prompt({
                        type: "input",
                        name: "email",
                        message: "Please enter an email, to be assosiated with this new git profile:"
                    })
                    .then(answer => {
                        email = answer.email;
                    })
                    .catch(error => {
                        reject(error);
                    });
                while (!email.match(/\S+@\S+\.\S+/g)) {
                    await inquirer.prompt({
                            type: "input",
                            name: "email",
                            message: email + "is not a valid email, please enter a valid email to be assosiated with this new git profile:"
                        })
                        .then(answer => {
                            email = answer.email;
                        })
                        .catch(error => {
                            reject(error);
                        });
                }
                resolve();
            });
        }
        if (!passphrase) {
            await new Promise(async function(resolve, reject) {
                await inquirer.prompt({
                        type: "password",
                        name: "passphrase",
                        message: "Please enter a passphrase (leave empty for no passphrase):"
                    })
                    .then(async answer1 => {
                        await inquirer.prompt({
                                type: "password",
                                name: "passphrase",
                                message: "Please re-enter the passphrase (leave empty for no passphrase):"
                            })
                            .then(async answer2 => {
                                if (answer1.passphrase === answer2.passphrase) {
                                    passphrase = answer1.passphrase;
                                    resolve();
                                } else {
                                    await inquirer.prompt({
                                            type: "password",
                                            name: "passphrase",
                                            message: "Your passphrases did not match" + "\n" +
                                                "Please re-enter the passphrase (leave empty for no passphrase):"
                                        })
                                        .then(answer2 => {
                                            if (answer1.passphrase === answer2.passphrase) {
                                                passphrase = answer1.passphrase;
                                                resolve();
                                            } else {
                                                console.log("Your passphrases did not match" + "\n" +
                                                    "Exiting the program due to too many failed attempts");
                                            }
                                        })
                                        .catch(error => {
                                            reject(error);
                                        });
                                }
                            })
                            .catch(error => {
                                reject(error);
                            });
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }
        console.log("\n" + "Generating SSH Keys..." + "\n");
        await generateKey(alias, email, passphrase, bits, dir)
        console.log("\n" + "Adding SSH Keys to the SSH authentication agent..." + "\n");
        await addSshKeyAgent(alias, dir);
        console.log("Successfully generated an SSH Key for the new git profile" + "\n" +
            "Your new public and private keys can be found here: " + dir + ", and are called id_rsa_" + alias + " and id_rsa_" + alias + ".pub" +
            "\n\n" +
            "Please copy your key to your prefered git repository to begin using it.");
    }
}

async function changeAlias(alias, dir) {
    let name = (await fs.readFileSync(path.join(dir, "name_" + alias))).toString();
    let pubKey = (await fs.readFileSync(path.join(dir, "id_rsa_" + alias + ".pub")));
    let email = pubKey.toString().match(/\S+@\S+\.\S+/g);
    let promises = [
        fs.writeFileSync(path.join(dir, "id_rsa.pub"), pubKey),
        fs.writeFileSync(path.join(dir, "id_rsa"), fs.readFileSync(path.join(dir, "id_rsa_" + alias)))
    ]
    Promise.all(promises).then(async function() {
        let promises2 = [
            changeGlobalNameAndEmail(name, email),
            changeLocalNameAndEmail(name, email)
        ]
        Promise.all(promises2).then(function() {
            console.log("Successfully changed alias" + "\n" +
                "Current alias: " + alias);
        }).catch(function(err) {
            throw (err);
        });
    }).catch(function(err) {
        throw (err);
    });
}

function deleteAlias(alias, dir) {
    let promises = [
        fs.unlinkSync(path.join(dir, "id_rsa_" + alias + ".pub")),
        fs.unlinkSync(path.join(dir, "id_rsa_" + alias))
    ]
    Promise.all(promises).then(async function() {
        console.log("Successfully deleted alias" + "\n" +
            "You may need to change you current alias, if you were using the alias you just deleted");
    }).catch(function(err) {
        throw (err);
    });
}

module.exports = {
    chooseAlias,
    createAlias,
    changeAlias,
    deleteAlias
}