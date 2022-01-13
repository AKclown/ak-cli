#! /usr/bin/env node

const pkg = require('../package.json');
const log = require('@ak-cli/log');
const constant = require('./constants');
const colors = require('colors');
const semver = require('semver');
const process = require('process');
const userHome = require('userhome')();
const pathExists = require("path-exists");
const path = require('path');
const constants = require('./constants');

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
  } catch (error) {
    log.error(error.message)
  }
}
core();


function checkPkgVersion() {
  console.log(pkg.version);
}

function checkNodeVersion() {
  // 拿到当前Node版本号
  const currentVersion = process.version;
  // 对比最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;

  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`ak-cli 需要安装v${lowestVersion}以上的NodeJS版本`))
  }
}

function checkRoot() {
  const rootCheck = require('root-check');
  // 尝试降级具有root权限的进程的权限，如果失败，则阻止访问权限
  rootCheck();
}

function checkUserHome() {
  if (!(userHome && pathExists(userHome))) {
    throw new Error(colors.red(`当前登陆用户主目录不存在`));
  }
}

function checkInputArgs() {
  const minimist = require('minimist');
  const args = minimist(process.argv.slice(2));
  checkArgs(args);
}

function checkArgs(args) {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
  log.verbose(colors.red(`verbose日志信息`));
}

function checkEnv() {
  // dotenv环境变量检查，如果环境变量不存在需要设置默认值
  const dotenv = require('dotenv');
  // userHome  => C:\Users\ak => C:\Users\ak\.env 根目录下的环境变量文件
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath
    })
  }
  // 设置默认值
  config = createDefaultConfig();
  log.verbose('环境变量', config)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, constants.DEFAULT_CLI_HOME);
  }
  return cliConfig;
}