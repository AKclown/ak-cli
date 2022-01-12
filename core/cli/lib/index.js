#! /usr/bin/env node

const pkg = require('../package.json');
const log = require('@ak-cli/log');
const constant = require('./constants');
const colors = require('colors')
const semver = require('semver')

function core() {
  try {
    checkNodeVersion();
  } catch (error) {
    log.error(error.message)
  }
}
core();

function checkNodeVersion() {
  // 拿到当前Node版本号
  const currentVersion = process.version;
  // 对比最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;

  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`ak-cli 需要安装v${lowestVersion}以上的NodeJS版本`))
  }
}

function checkPkgVersion() {
  console.log(pkg.version);
}

// module.exports = core