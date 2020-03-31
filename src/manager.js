// Licensed under Apache Version 2.0
// Please see the LICENSE file in the root directory of the project for more
// information

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const methods = require('./methods.js');

const args = process.argv.splice(2);

let alias = (args.includes("-a") || args.includes("-alias")) ?
    ((args[args.indexOf("-alias")] && args[args.indexOf("-alias") + 1]) || (args[args.indexOf("-a")] && args[args.indexOf("-a") + 1])) : null;
let email = (args.includes("-e") || args.includes("-email")) ?
    ((args[args.indexOf("-email")] && args[args.indexOf("-email") + 1]) || (args[args.indexOf("-e")] && args[args.indexOf("-e") + 1])) : null;
let passphrase = (args.includes("-p") || args.includes("-passphrase")) ?
    ((args[args.indexOf("-passphrase")] && args[args.indexOf("-passphrase") + 1]) || (args[args.indexOf("-p")] && args[args.indexOf("-p") + 1])) : null;
let name = (args.includes("-n") || args.includes("-name")) ?
    ((args[args.indexOf("-name")] && args[args.indexOf("-name") + 1]) || (args[args.indexOf("-n")] && args[args.indexOf("-n") + 1])) : null;
const bits = (args.includes("-b") || args.includes("-bits")) ?
    ((args[args.indexOf("-bits")] && args[args.indexOf("-bits") + 1]) || (args[args.indexOf("-b")] && args[args.indexOf("-b") + 1])) : "4096";
const dir = (args.includes("-d") || args.includes("-directory")) ?
    ((args[args.indexOf("-directory")] && args[args.indexOf("-directory") + 1]) || (args[args.indexOf("-b")] && args[args.indexOf("-b") + 1])) : path.join(require('os').homedir(), "/.ssh");

if (args[0] === "create-alias") {
    methods.createAlias(alias, email, passphrase, name, bits, dir);
} else if (args[0] === "change-alias") {
    if (!alias) {
        methods.chooseAlias(dir, "to use").then(function(alias) {
            methods.changeAlias(alias, dir);
        }).catch(function(err) {
            throw (err);
        });
    }
} else if (args[0] === "delete-alias") {
    if (!alias) {
        methods.chooseAlias(dir, "to delete").then(function(alias) {
            methods.deleteAlias(alias, dir);
        }).catch(function(err) {
            throw (error);
        });
    }
} else if (args[0] === "backup") {
    methods.backup(dir).then(function(res) {
        console.log(res);
    }).catch(function(err) {
        throw (err);
    });
} else if (args[0] === "h" || args[0] === "help" || args.length === 0) {
    console.log("Usage: gam [command] [options]" + "\n\n" +
        "Available Commands:" + "\n" +
        "  " + "create-alias:" + "  " + "Creates a public and private key for a new alias" + "\n" +
        "  " + "change-alias:" + "  " + "Changes the current public and private key to the specified alias" + "\n" +
        "  " + "delete-alias:" + "  " + "Deletes the public and private key for an alias" + "\n" +
        "  " + "h, help:     " + "  " + "Print available command line commands and options (currently set)" + "\n\n" +
        "Available Options:" + "\n" +
        "  " + "-a, -alias:     " + "  " + "specify the alias" + "\n" +
        "  " + "-e, -email:     " + "  " + "specify the email" + "\n" +
        "  " + "-p, -passphrase:" + "  " + "specify the passphrase" + "\n" +
        "  " + "-n, -name:      " + "  " + "specify the name to be assosiated with this alias" + "\n" +
        "  " + "-b, -bits:      " + "  " + "specify the number of bits to create for the new key, defaults to 4096, the minimmum is 1024" + "\n" +
        "  " + "-d, -directory: " + "  " + "specify the directory to create the new key(s) in, defaults to the .ssh folder in the home directory");
} else {
    console.log("Command: " + args[0] + " not found, please try again with a different command or execute" + "\n" +
        "$ gam help" + "\n" +
        "to see a list of commands");
}