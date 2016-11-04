require('babel-register');
const {app} = require('electron');
const {bootstrap} = require('@lxndr/di');
const {Application} = require('./application');

app.on('ready', () => {
  bootstrap(Application).init().catch(err => {
    console.error(err.stack);
  });
});
