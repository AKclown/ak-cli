#! /usr/bin/env node

const npminstall = require('npminstall');
const path = require('path');
const userHome = require('userhome')(); // C:\Users\ak

npminstall({
  root: path.resolve(userHome, '.ak-cli'),
  storeDir: path.resolve(userHome, '.ak-cli', 'node_modules'),
  registry: 'https://registry.npmjs.org',
  pkgs: [{ name: 'foo', version: '~1.0.0' }],
});
