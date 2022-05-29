const SimpleGit = require('simple-git');
const log = require('@ak-clown/log');
const path = require('path');
const userHome = require('user-home');
const fse = require('fs-extra');
const fs = require('fs');
const { readFile, writeFile } = require('"@ak-clown/utils');
const inquirer = require('inquirer');

// 主目录
const DEFAULT_CLI_HOME = 'ak-cli';
// git主目录
const GIT_ROOT_DIR = '.git';
// git server文件
const GIT_SERVER_FILE = '.git_server';

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
  constructor({ name, version, dir }, { refreshServer = false }) {
    this.name = name;
    this.version = version;
    this.dir = dir;
    this.git = SimpleGit(dir);
    this.gitServer = null;
    this.homePath = null;
    this.refreshServer = refreshServer;
  }
  // 准备工作，创建gitServer对象
  async prepare() {
    // $ 检查缓存主目录
    this.checkHomePath();
    // $ 检查用户远程仓库类型
    await this.checkGitServer();
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
