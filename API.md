## Methods
### Backup
###### Params:
`dir` - Optional, the directory to use, defaults to the `.ssh` folder in the users home directory

###### Description:
Creates a backup of all of the files found in a directory

##### Example:
```javascript
const gam = require('git-alias-manager');
gam.backup('/.ssh');
```
Would output (assuming the date is April 8th, 2020):
```
Created Backup folder named: backup-04-08-2020 successfully
```

### chooseAlias
##### Params:
`customStr` - Custom String to display at the end of the choose alias prompt

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

##### Description:
Prompts the user to choose an alias from the list of available aliases associated with ssh keys

##### Example:
```javascript
const gam = require('git-alias-manager');
gam.chooseAlias(customStr, dir).then(function(alias){
  console.log("Alias: " + alias);
});
```
Would output (after choosing an alias):
```
? Choose an alias to use: Megapixel99
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
Prompts the user to enter the information required to create a new SSH key for a new alias, if any required information passed to this method is `null`, the user will be prompted to enter the necessary information

##### Examples:
```javascript
const gam = require('git-alias-manager');
gam.createAlias("alias", "email@domain.com",
  "passphrase", 2048, '/.ssh');
```
Would output:
```
Generating SSH Keys...

Adding SSH Keys to the SSH authentication agent...
Successfully generated an SSH Key for the new git profile
Your new public and private keys can be found here: /.ssh, and are called id_rsa_alias and id_rsa_alias.pub

Please copy your key to your prefered git repository to begin using it.
```

and

```javascript
const gam = require('git-alias-manager');
gam.createAlias();
```
Would output:
```
? Please enter an alias to be associated with this new git profile: alias
? Please enter an email, to be associated with this new git profile: email@domain.com
? Please enter a passphrase (leave empty for no passphrase): [hidden]
? Please re-enter the passphrase (leave empty for no passphrase): [hidden]

Generating SSH Keys...

Adding SSH Keys to the SSH authentication agent...
Successfully generated an SSH Key for the new git profile
Your new public and private keys can be found here: /Users/user/.ssh, and are called id_rsa_alias and id_rsa_alias.pub

Please copy your key to your prefered git repository to begin using it.
```
### changeAlias
##### Params:
`alias` - Name of the Alias

`dir` - Optional, the directory to search in, defaults to the `.ssh` folder in the users home directory

##### Description:
Prompts the user to choose an alias from the list of available aliases associated with ssh keys, then updates the current git email and SSH keys to that of the current user

Calls `chooseAlias()`

##### Example:
```javascript
const gam = require('git-alias-manager');
gam.changeAlias("alias", '/.ssh');
```
Would output (after choosing an alias):
```
? Choose an alias to use: alias
Successfully changed alias
Current alias: alias
```

### currentAliasEmail
##### Description:
Retrieves the current email for the users local and global git config

##### Example:
```javascript
const gam = require('git-alias-manager');
console.log(gam.currentAliasEmail());
```
Would output (after choosing an alias):
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
Prompts the user to choose an alias from the list of available aliases associated with ssh keys, then updates the current git email and SSH keys to that of the current user

Calls `chooseAlias()`

##### Example:
```javascript
const gam = require('git-alias-manager');
gam.deleteAlias("alias", '/.ssh');
```
Would output (after choosing an alias):
```
? Choose an alias to delete: alias
Successfully deleted alias
You may need to change you current alias, if you were using the alias you just deleted
```
