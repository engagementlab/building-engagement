#!/bin/bash

# Require arg
if [  $# -eq 0 ]; then
    echo "Must run script w/ one arg, either 'qa' or 'production'"
    exit 1
fi

echo "Running build"

# Source/load nvm
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh;

nvm use;

if [ "$1" == "qa" ]; then

    ng build --configuration=qa-main --prod --index=src/index.qa.html
    ng build --configuration=qa-city --prod --index=src/index.qa.html

    mv dist/main/index.qa.html dist/main/index.html
    mv dist/city/index.qa.html dist/city/index.html

elif [ "$1" == "production" ] || [ "$1" == "prod" ]; then

    ng build --configuration=production-main --prod --index=src/index.prod.html
    ng build --configuration=production-city --prod --index=src/index.prod.html

    mv dist/main/index.prod.html dist/main/index.html
    mv dist/city/index.prod.html dist/city/index.html

else

    echo "Expected 'qa' or 'production' but got $1"
    exit 1

fi
