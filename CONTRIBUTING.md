# Contributing
Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

Please only bump the version in the develop branch, and do all work in other branches
which branch off of develop.

### Set up your environment
##### Prerequisites:
- NodeJS
- NPM (typically bundled with NodeJS)

##### Install Dependencies:
Please run the following commands in the root directory of the project:
```bash
$ npm i
```

##### Building/Releasing:
Before releasing any new versions, please build the project executables using:
```bash
$ ./build.sh
```
`pkg`, which is installed in `build.sh`, and required to build the project executables,
may not work with some versions of NodeJS, if this is the case for your current
version of NodeJS, please upgrade/downgrade your NodeJS version using a version
manager such as [n](https://www.npmjs.com/package/n) or [nvm](https://github.com/nvm-sh/nvm)

##### To Do:
- Modify build script for Windows and Linux
- Fix issue in the use of `sudo` in the build script with zshell.
