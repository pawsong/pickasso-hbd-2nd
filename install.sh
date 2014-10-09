curl https://raw.githubusercontent.com/creationix/nvm/v0.17.2/install.sh | bash
source ~/.bash_profile
source ~/.bashrc
nvm install 0.11
nvm alias default 0.11
nvm use 0.11
npm install -g yo gulp
npm install
bower install
gulp watch