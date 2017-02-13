require('babel-register');
const {app} = require('electron');
const {bootstrap} = require('@lxndr/di');
const {ElectronApplication} = require('./electron.application');

app.on('ready', () => {
  bootstrap(ElectronApplication).init().catch(err => {
    console.error(err.stack);
  });
});
