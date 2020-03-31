# Licensed under Apache Version 2.0
# Please see the LICENSE file in the root directory of the project for more
# information

#!/usr/bin/env bash

echo "Git alias management installing..."

mkdir -p $HOME/.gitAliasManager
\cp $PWD/binarys/manager-macos $HOME/.gitAliasManager/manager
alias gam="$HOME/.gitAliasManager/manager"

echo "Installation complete."
