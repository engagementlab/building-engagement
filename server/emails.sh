# Source/load nvm
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh;

# Load node version
nvm use;

# Run email reminder script
$(which node) ./emails.js