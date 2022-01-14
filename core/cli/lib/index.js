#! /usr/bin/env node

const pkg = require('../package.json');
const log = require('@ak-clown/log');
const constant = require('./constants');
const colors = require('colors');
const semver = require('semver');
const process = require('process');
const userHome = require('userhome')();
const pathExists = require("path-exists");
const path = require('path');
const constants = require('./constants');
const commander = require('commander');
const init = require('@ak-clown/init');
const exec = require('@ak-clown/exec');

const program = new commander.Command();

async function core() {
  try {
    // $ 准备阶段执行方法
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    // checkInputArgs();
    checkEnv();
    await checkGlobalUpdate();
    // $ 命令注册执行方法
    registerCommand();
  } catch (error) {
    log.error(error.message);
  }
}
core();

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .option('-d, --debug', '是否开启调试模式')
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program
    .command('init [projectName]')
    .option('-f --force', '是否强制初始化项目')
    .action(exec)

  // $ 指定targetPath
  program.on('option:targetPath', function () {
    const options = program.opts();
    process.env.CLI_TARGET_PATH = options.targetPath;
  })

  // $ 实现debug功能
  program.on('option:debug', function () {
    const options = program.opts();
    if (options.debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose('开启debug模式')
  })

  // $ 监听未知命令
  program.on('command:*', function (obj) {
    console.error(`未知命令${obj[0]}`);
    const availableCommands = program.commands.map(cmd => cmd.name());
    if (availableCommands.length > 0) {
      console.log(`可用命令: ${availableCommands.join(',')}`);
    }
  })
  program.parse(process.argv);
  // $ 参数小于3个不解析，第一个是node 第二个是脚手架命令， 第三个才是option
  // if (process.argv.length < 3) {
  //   program.outputHelp();
  // }
  if (program.args && program.args.length < 1) {
    program.outputHelp();
  }
}


function checkPkgVersion() {
  // console.log(pkg.version);
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
  process.env.DEFAULT_CLI_HOME = config.cliHome;
  log.verbose('环境变量', config)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig.cliHome = path.join(userHome, constants.DEFAULT_CLI_HOME);
  }
  return cliConfig;
}

async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 2. 调用NPM API 获取所有版本号
  const { getNpmSemverVersion } = require('@ak-clown/get-npm-info');
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  // 3. 提取所有版本号，对比那些版本号是大于当前版本
  // 4. 获取最新的版本号，提示用户更新到该版本
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn('更新提醒', colors.yellow(`请手动更新${npmName},当前版本:${currentVersion},
    最新版本为${lastVersion}
    更新命令: npm install -g ${npmName}`))
  }
}