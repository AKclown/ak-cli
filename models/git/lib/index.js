const SimpleGit = require('simple-git');
const log = require('@ak-clown/log');
const path = require('path');
const userHome = require('user-home');
const fse = require('fs-extra');
const fs = require('fs');
const { readFile, writeFile } = require('"@ak-clown/utils');
const inquirer = require('inquirer');
const terminalLink = require('terminal-link');
const Github = require('./Github');
const Gitee = require('./Gitee');

// 主目录
const DEFAULT_CLI_HOME = 'ak-cli';
// git主目录
const GIT_ROOT_DIR = '.git';
// git server文件
const GIT_SERVER_FILE = '.git_server';
// token 存储文件
const GIT_TOKEN_FILE = '.git_token';

// Git托管平台
const GITHUB = 'github';
const GITEE = 'gitee';

// Git平台类型列表
const GIT_SERVER_TYPE = [
  {
    name: 'Github',
    value: GITHUB,
  },
  {
    name: 'Gitee',
    value: GITEE,
  },
];

class Git {
  constructor(
    { name, version, dir },
    { refreshServer = false, refreshToken = false }
  ) {
    this.name = name;
    this.version = version;
    this.dir = dir;
    this.git = SimpleGit(dir);
    this.gitServer = null;
    this.homePath = null;
    this.refreshServer = refreshServer;
    this.refreshToken = refreshToken;
    this.token = null;
  }
  // 准备工作，创建gitServer对象
  async prepare() {
    // $ 检查缓存主目录
    this.checkHomePath();
    // $ 检查用户远程仓库类型
    await this.checkGitServer();
    // $ 检查并且拿到token
    await this.checkGitToken();
  }

  // 检查缓存主目录
  checkHomePath() {
    log.verbose('env', process.env);
    if (!this.homePath) {
      if (process.env.CLI_HOME_PATH) {
        this.homePath = process.env.CLI_HOME_PATH;
      } else {
        this.homePath = path.resolve(userHome, DEFAULT_CLI_HOME);
      }
    }
    log.verbose('homePath', this.homePath);
    // 确保当前目录存在 (如果目录不存在就创建)
    fse.ensureDirSync(this.homePath);
    if (!fs.existsSync(this.homePath)) {
      throw new Error('用户主目录获取数据失败！');
    }
  }

  // 检查用户远程仓库类型
  async checkGitServer() {
    const gitServerPath = this.createPath(GIT_SERVER_FILE);
    // 读取到GIT_SERVER_FILE的文件内容
    let gitServer = readFile(gitServerPath);
    // 不存在文件内容，提供选择  给 用户选择git平台
    if (!gitServer || this.refreshServer) {
      // 选择托管的git平台
      const { gitServer } = await inquirer.prompt([
        {
          type: 'list',
          name: 'gitServer',
          message: '请选择你想要托管的Git平台',
          default: GITHUB,
          choices: GIT_SERVER_TYPE,
        },
      ]);
      writeFile(gitServerPath, gitServer);
      log.success('git server 写入成功', `${gitServer} --> ${gitServerPath}`);
    } else {
      log.success('git server 获取成功', gitServer);
    }
    this.gitServer = this.createGitServer(gitServer);
    if (!this.gitServer) {
      throw new Error('GitServer初始化失败！');
    }
  }

  // 检查并且拿到token
  async checkGitToken() {
    const gitTokenPath = this.createPath(GIT_TOKEN_FILE);
    // 读取到GIT_TOKEN_FILE的文件内容
    let token = readFile(gitTokenPath);
    if (!token) {
      // $ 除了提示token不存在外，换需要提供生成token的帮助链接 - 如果是自己的脚手架，可以引用自己的书写的文档
      log.warn(
        this.gitServer.type + 'token未生成',
        '请先生成' +
          this.gitServer.type +
          'token,' +
          terminalLink(this.gitServer.getTokenHelpUrl())
      );
      token = (
        await inquirer.prompt({
          type: 'password',
          name: 'token',
          message: '请将token复制到这里',
          default: '',
        })
      ).token;
      writeFile(gitTokenPath, token);
      log.success('token写入成功', `${token} --> ${gitTokenPath}`);
    } else {
      log.success('token获取成功');
    }
    this.token = token;
    this.gitServer.setToken(token);
  }

  //  实例化git server
  createGitServer(gitServer) {
    if (gitServer === GITHUB) {
      return new Github();
    } else if (gitServer === GITEE) {
      return new Gitee();
    }
    return null;
  }

  // 获取git server 的文件路径
  createPath(file) {
    const rootDir = path.resolve(this.homePath, GIT_ROOT_DIR);
    const filePath = path.resolve(rootDir, file);
    // 确保GIT_ROOT_DIR目录存在，不存在就创建
    fse.ensureDirSync(rootDir);
    return filePath;
  }

  // 初始化操作
  init() {}
}

module.exports = Git;
