# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Set up your environment
##### Prerequisites:
- NodeJS
- NPM (typically bundled with NodeJS)

##### Install Dependencies:
Please run the following commands in the root directory of the project:
```bash
$ npm i
```
and
```bash
$ npm install -g pkg
```
##### Building:
Before pushing any changes, please build the project using:
```bash
$ pkg --out-path $PATH_TO_PROJECT/GAM/binarys PATH_TO_PROJECT/GAM/src/manager.js
```
`pkg` may not work with some later versions of NodeJS, if this is the case for your current version of NodeJS, please upgrade/downgrade your NodeJS version using a version manager such as [n](https://www.npmjs.com/package/n) or [nvm](https://github.com/nvm-sh/nvm)

##### To Do:
- Modify build script for Windows and Linux
- Add CLI option to view current alias
- Add CLI option to create backups of SSH keys
