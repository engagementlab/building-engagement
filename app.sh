#!/usr/bin/env bash

# Warn about domain arg
if [ $# -eq 0 ]; then
    COLOR='\033[0;33m'
    NC='\033[0m'
    echo -e "${COLOR}WARN: Did not run script w/ subdomain arg, using 'main'.${NC}"
fi

export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh

cd client;
nvm use;


if [ "$1" == "city" ]; then
    sub=city npm start;
else
    sub=main npm start;
fi
