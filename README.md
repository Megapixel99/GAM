# GAM
###### (Git Alias Manager)
GAM is a CLI application written in NodeJS for managing multiple Git accounts (aliases).

## Installation
Run the following command in the root directory of the project:
```bash
$ source ./install.sh
```

## Usage
To create a public and private key for a new alias
```bash
$ gam create-alias
```
To change the current alias:
```bash
$ gam change-alias
```
To delete a public and private key for an alias
```bash
$ gam delete-alias
```
To view a full list of commands and options:
```bash
$ gam help
```

****If you have pre-exsisting SSH keys, you may have to recreate them, and copy
the old keys into the new one to use this CLI application.****

## Contributing
Please see `CONTRIBUTING.md`

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
