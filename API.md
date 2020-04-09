## Methods
### addSshKeyAgent
###### Params:
`alias` - The name of the Alias

`dir` - Optional, the directory to use, defaults to the `.ssh` folder in the users home directory

###### Description:
Adds an SSH key to the ssh key-agent

##### Example:
```javascript
const gam = require('git-alias-manager');
console.log('Folder: ' + gam.addSshKeyAgent('alias', '/.ssh'));
```
No output

### backup
###### Params:
`dir` - Optional, the directory to use, defaults to the `.ssh` folder in the users home directory

###### Description:
Creates a backup of all of the files found in a directory, then returns the name of the created folder

##### Example:
```javascript
const gam = require('git-alias-manager');
console.log('Folder: ' + gam.backup('/.ssh'));
```
Would output (assuming the date is April 8th, 2020):
```
Folder: backup-04-08-2020
```

### chooseAlias
##### Params:
`customStr` - Custom String to display at the end of the choose alias prompt

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

##### Description:
Prompts the user to choose an alias from the list of available aliases associated with ssh keys, then returns the alias

##### Example:
```javascript
const gam = require('git-alias-manager');
gam.chooseAlias('', dir).then(function(alias){
  console.log('Alias: ' + alias);
});
```
Would output (after choosing an alias):
```
? Choose an alias: Megapixel99
Alias: Megapixel99
```

### createAlias
##### Params:
`alias` - Optional, name of the new Alias

`email` - Optional, email associated with the new SSH Key for the new Alias

`passphrase` - Optional, the passphrase to use when using the new SSH Key

`bits` - Optional, the number of bits in the SSH key hash, defaults to 4096, the minimum in 1024

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

##### Description:
Prompts the user to enter the information required to create a new SSH key for a new alias, if any required information passed to this method is `null`, the user will be prompted to enter the necessary information, then returns the information

##### Examples:
```javascript
const gam = require('git-alias-manager');
gam.createAlias('alias', 'email@domain.com',
  'passphrase', 2048, '/.ssh').then(function (res) {
    console.log(res);
  });
```
Would output:
```json
{
  "alias": "alias",
  "email": "email@domain.com",
  "passphrase": "passphrase",
  "bits": 4096,
  "dir": "/.ssh"
}
```

and

```javascript
const gam = require('git-alias-manager');
gam.createAlias().then(function (res) {
    console.log(res);
  });
```
Would output:
```json
? Please enter an alias to be associated with this new git profile: alias
? Please enter an email, to be associated with this new git profile: email@domain.com
? Please enter a passphrase (leave empty for no passphrase): [hidden]
? Please re-enter the passphrase (leave empty for no passphrase): [hidden]

{
  "alias": "alias",
  "email": "email@domain.com",
  "passphrase": "",
  "bits": 4096,
  "dir": "/.ssh"
}
```
### changeAlias
##### Params:
`alias` - Name of the Alias

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

##### Description:
Updates the current git email and SSH keys to that of the current user, then returns the alias

##### Example:
```javascript
const gam = require('git-alias-manager');
gam.changeAlias('alias', '/.ssh').then(function (res) {
    console.log('Alias: ' + res);
  });
```
Would output:
```
Alias: alias
```

### currentAliasEmail
##### Description:
Retrieves the current email for the users local and global git config

##### Example:
```javascript
const gam = require('git-alias-manager');
console.log(gam.currentAliasEmail());
```
Would output:
```json
{
  "localEmail": "email@domain.com",
  "globalEmail": "email@domain.com"
}
```

### deleteAlias
##### Params:
`alias` - Name of the Alias

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

##### Description:
Deletes the SSH keys for an alias, then returns the alias

##### Example:
```javascript
const gam = require('git-alias-manager');
gam.deleteAlias('alias', '/.ssh').then(function (res) {
    console.log('Alias: ' + res);
  });
```
Would output:

```
Alias: alias
```

### generateKey
###### Params:
`alias` - The name of the Alias

`email` - The email associated with the new SSH Key for the Alias

`passphrase` - The passphrase to use when using the new SSH Key

`bits` - Optional, the number of bits in the SSH key hash, defaults to 4096, the minimum in 1024

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

###### Description:
Generates and SSH Key for an alias, and saves it to the directory: `dir`

##### Example:
```javascript
const gam = require('git-alias-manager');
console.log(gam.generateKey('alias', 'email',
  'passphrase', 2048, '/.ssh');
```
No output

### getAliasEmail
###### Params:
`alias` - The name of the Alias

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

###### Description:
Retrieves the email associated with an alias

##### Example:
```javascript
const gam = require('git-alias-manager');
console.log(gam.getAliasEmail('alias', '/.ssh');
```
Would output:

```json
{
  "email": "email@domian.com"
}
```
