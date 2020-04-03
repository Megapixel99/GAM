# Licensed under Apache Version 2.0
# Please see the LICENSE file in the root directory of the project for more
# information

#!/usr/bin/env bash

if [ "$(whoami)" != "root" ]
then
    echo "The root user is required to install the packages required to build the application"
    echo "Please enter your password to continue"
    sudo -s
fi

if ! foobar_loc="$(type -p "npm")" || [[ -z $foobar_loc ]]; then
  echo "Could not find npm, please install npm"
  echo ""
else
  echo "Installing the projects' dependencies..."
  npm install -s
    while ! foobar_loc="$(type -p "pkg")" || [[ -z $foobar_loc ]]
      do
      read -p "Could not find pkg, which is reqiured to build GAM. Do you want to install pkg? (y/n)" choice
      case "$choice" in
        y|Y|yes|Yes ) sudo npm i -g pkg -s
        echo "Installed pkg successfully";;
        n|N|no|No ) echo "pkg is required to build, exiting program";;
        * ) echo "Invalid response, please try again";;
      esac
    done
fi

echo ""
mkdir -p executables
echo "Creating executables..."
echo ""
pkg --out-path $PWD/executables $PWD/src/manager.js
echo ""
echo "Created executables successfully"
echo ""

while true
  do
  read -p "Do you want to uninstall pkg? (y/n)" choice
  case "$choice" in
    y|Y|yes|Yes ) sudo npm i -g pkg -s
    echo "Uninstalled pkg successfully"
    break;;
    n|N|no|No ) break;;
    * ) echo "Invalid response, please try again";;
  esac
done

echo "Zipping executables folder for release"
echo ""
zip -vr executables.zip executables/ -x "*.DS_Store"
echo ""
echo "Zipped folder successfully"
