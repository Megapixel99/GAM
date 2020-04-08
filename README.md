# GAM
###### (Git Alias Manager)
GAM is a CLI application written in NodeJS for managing multiple Git accounts (aliases).

## Installation
#### With NPM locally
```bash
$ npm i gam
```
#### With NPM globally
```bash
$ npm i gam -g
```
#### Without NPM
Download `install.py`, then run the following command in the directory where
`install.py` was downloaded:
```bash
$ python ./install.py
```

## CLI Usage
To create a public and private key for a new alias
```bash
$ gam create-alias
```
To change the current alias:
```bash
$ gam change-alias
```
To view the email of the current alias:
```bash
$ gam current-alias-email
```
To delete a public and private key for an alias
```bash
$ gam delete-alias
```
To view a full list of commands and options:
```bash
$ gam help
```

## API Usage
Please see [`API.md`](https://github.com/Megapixel99/GAM/blob/master/API.md)

## Contributing
Please see [`CONTRIBUTING.md`](https://github.com/Megapixel99/GAM/blob/master/CONTRIBUTING.md)

## Known Issues
If you run `build.sh` in zshell, you may receive:
```
zsh compinit: insecure directories and files, run compaudit for list.
Ignore insecure directories and files and continue [y] or abort compinit [n]?
```
If you receive this, please run `build.sh` again and the error will not appear.

## License
```
Copyright 2020 Seth Wheeler

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
