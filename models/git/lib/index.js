const SimpleGit = require('simple-git');
const log = require('@ak-clown/log');
const path = require('path');
const userHome = require('user-home');
const fse = require('fs-extra');
const fs = require('fs');
const { spinnerStart, readFile, writeFile } = require('"@ak-clown/utils');
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
// 缓存git仓库类型
const GIT_OWN_FILE = '.git_own';
// 缓存登录名称 (个人名称/组织名称)
const GIT_LOGIN_FILE = '.git_login';
// .ignore文件
const GIT_IGNORE_FILE = '.gitignore';

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

// 仓库类型
const REPO_OWNER_USER = 'user';
const REPO_OWNER_ORG = 'org';

const GIt_OWNER_TYPE = [
  {
    name: '个人',
    value: REPO_OWNER_USER,
  },
  {
    name: '组织',
    value: REPO_OWNER_ORG,
  },
];

const GIt_OWNER_TYPE_ONLY = [
  {
    name: '个人',
    value: REPO_OWNER_USER,
  },
];

class Git {
  constructor(
    { name, version, dir },
    { refreshServer = false, refreshToken = false, refreshOwner = false }
  ) {
    // ! 这边null为什么要定义出来，好处是提醒自己和给其他人员能够清楚的知道这个类有哪些属性。很多知名的库，都会把类的属性写在构造函数里
    this.name = name; // 项目名称
    this.version = version; // 项目版本
    this.dir = dir; // 项目目录
    this.git = SimpleGit(dir); // SimpleGit实例
    this.gitServer = null; // GitServer实例
    this.homePath = null; // 本地缓存目录
    this.token = null; // git token
    this.user = null; // 用户信息
    this.orgs = null; // 用户所属组织列表
    this.owner = null; // 远程仓库类型
    this.login = null; // 远程仓库登录名
    this.remote = null; // 远程仓库
    this.refreshServer = refreshServer; // 是否强制刷新托管的git平台
    this.refreshToken = refreshToken; // 是否强制刷新远程仓库token
    this.refreshOwner = refreshOwner; // 是否强制刷新远程仓库类型
  }
  // 准备工作，创建gitServer对象
  async prepare() {
    // $ 检查缓存主目录
    this.checkHomePath();
    // $ 检查用户远程仓库类型
    await this.checkGitServer();
    // $ 检查并且拿到token
    await this.checkGitToken();
    // $ 获取远程仓库用户和组织信息
    await this.getUserAndOrgs();
    // $ 确认远程仓库类型
    await this.checkGitOwner();
    // $ 检查并创建远程仓库
    await this.checkRepo();
    // $ 检查并创建.gitignore文件
    this.checkGitIgnore();

    // $实现本地仓库初始化
    await this.init();
  }

  // 实现本地仓库初始化
  async init() {
    // 以及初始化过仓库就不存在重新初始化，如果存在commit重新初始化 会丢失commit
    if (this.getRemote()) {
      return;
    }
    await this.initAndAddRemote();
  }

  // 获取到远程
  getRemote() {
    const gitPath = path.resolve(this.dir, GIT_ROOT_DIR);
    this.remote = this.gitServer.getRemote(this.login, this.name);
    if (fs.existsSync(gitPath)) {
      log.success('git已完成初始化');
      return true;
    }
  }

  // 初始化和关联远程仓库
  async initAndAddRemote() {
    log.info('执行git初始化');
    await this.git.init(this.dir);
    log.info('添加git remote');
    const remotes = await this.git.getRemotes();
    log.verbose('git remotes', remotes);
    // ??? 有一点疑惑，如果当前的origin不是当前仓库的呢？ 而是别的仓库的
    if (!remotes.find(item => item.name === 'origin')) {
      await this.git.addRemote('origin', this.remote);
    }
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

  // 获取远程仓库用户和组织信息
  async getUserAndOrgs() {
    this.user = await this.gitServer.getUser();
    if (!this.user) {
      throw new Error('用户信息获取失败！');
    }
    this.orgs = await this.gitServer.getOrgs(this.user.login);
    if (!this.orgs) {
      // this.orgs可以使空数组，但不能为null
      throw new Error('组织信息获取失败！');
    }
    log.success(this.gitServer.type + '用户和组织信息获取成功');
  }

  // 确认远程仓库类型
  async checkGitOwner() {
    // 获取/创建缓存文件路径
    const ownerPath = this.createPath(GIT_OWN_FILE);
    const loginPath = this.createPath(GIT_LOGIN_FILE);
    let owner = readFile(ownerPath);
    let login = readFile(loginPath);
    if (!owner || !login || this.refreshOwner) {
      owner = (
        await inquirer.prompt([
          {
            type: 'list',
            name: 'owner',
            message: '请选择远程仓库类型',
            default: REPO_OWNER_USER,
            choices:
              this.orgs.length > 0 ? GIt_OWNER_TYPE : GIt_OWNER_TYPE_ONLY,
          },
        ])
      ).owner;
      if (owner === REPO_OWNER_USER) {
        login = this.user.login;
      } else {
        // 提供选择框给用户选择组织名称
        login = (
          await inquirer.prompt([
            {
              type: 'list',
              name: 'login',
              message: '请选择组织名称',
              choices: this.orgs.map(item => ({
                name: item.login,
                value: item.login,
              })),
            },
          ])
        ).login;
      }
      // 写入到缓存中
      writeFile(ownerPath, owner);
      writeFile(loginPath, login);
      log.success('owner写入成功', `${owner} --> ${ownerPath}`);
      log.success('login写入成功', `${login} --> ${loginPath}`);
    } else {
      log.success('owner读取成功');
      log.success('login读取成功');
    }
    // 讲数据存储到类实例中
    this.owner = owner; // 远程仓库类型
    this.login = login; // 远程仓库登录名
  }

  // 检查并创建远程仓库
  async checkRepo() {
    let repo = this.gitServer.getRepo(this.login, this.name);
    if (!repo) {
      let spinner = spinnerStart('开始创建远程仓库...');
      try {
        if (this.owner === REPO_OWNER_USER) {
          repo = this.gitServer.createRepo(this.name);
        } else {
          repo = this.gitServer.createOrgRepo(this.name, this.login);
        }
      } catch (error) {
        log.error(error);
      } finally {
        spinner.stop(true);
      }
      if (repo) {
        log.success('远程仓库创建成功');
      } else {
        throw new Error('远程仓库创建失败');
      }
    } else {
      log.success('远程仓库信息获取成功');
    }
    this.repo = repo;
  }

  // 检查并创建.gitignore文件
  checkGitIgnore() {
    const gitIgnorePath = path.resolve(this.dir, GIT_IGNORE_FILE);
    if (!fs.existsSync(gitIgnorePath)) {
      writeFile(
        gitIgnorePath,
        `.idea/
      .DS_Store
      node_modules/
      package-lock.json
      yarn.lock
      .vscode/
      .history/
      logs/
      target/
      pid`
      );

      log.success(`自动写入${GIT_IGNORE_FILE}文件成功`);
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
}

module.exports = Git;
