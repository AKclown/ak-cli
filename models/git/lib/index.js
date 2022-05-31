const SimpleGit = require('simple-git');
const log = require('@ak-clown/log');
const path = require('path');
const userHome = require('user-home');
const fse = require('fs-extra');
const fs = require('fs');
const { spinnerStart, readFile, writeFile } = require('@ak-clown/utils');
const inquirer = require('inquirer');
const terminalLink = require('terminal-link');
const semver = require('semver');
const Github = require('./Github');
const Gitee = require('./Gitee');

// 主目录
const DEFAULT_CLI_HOME = '.ak-cli';
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

// 版本类型
const VERSION_RELEASE = 'release';
const VERSION_DEVELOP = 'dev';

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
    this.branch = null; // 本地的开发分支
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

  // 代码自动化提交
  async commit() {
    // 1. 生成开发分支
    await this.getCorrectVersion();
    // 2. 检查stash区域
    await this.checkStash();

    // 3. 检查代码冲突

    // 4. 推送远程分支
  }

  // 检查stash区域
  async checkStash() {
    log.info('检查stash记录');
    const stashList = await this.git.stashList();
    // 查看是否存在stash数据
    if (stashList.all.length > 0) {
      await this.git.stash(['pop']);
      log.success('stash pop成功');
    }
  }

  // 生成开发分支
  async getCorrectVersion() {
    // 1.生成远程发布分支
    // 版本号规范: release/x.y.z  dev/x.y.z
    // 版本号递增规范: major/ minor / patch
    log.info('代码分支的获取');
    const remoteBranchList = await this.getRemoteBranchList(VERSION_RELEASE);
    let releaseVersion = null;
    if (remoteBranchList && remoteBranchList.length > 0) {
      releaseVersion = remoteBranchList[0];
    }
    log.verbose('线上最新版本', releaseVersion);
    const devVersion = this.version;
    if (!releaseVersion) {
      // 最新远程发布版本号不存在， 采用package.json的version作为分支的版本号
      this.branch = `${VERSION_DEVELOP}/${devVersion}`;
    } else if (semver.gt(devVersion, releaseVersion)) {
      log.info(
        '当前版本大于最新线上版本',
        `${devVersion} => ${releaseVersion}`
      );
      this.branch = `${VERSION_DEVELOP}/${devVersion}`;
    } else {
      log.info(
        '当前线上版本大于本地版本',
        `${releaseVersion} => ${devVersion}`
      );
      // 遵循版本控制规则，major/minor/patch
      const incType = (
        await inquirer.prompt([
          {
            type: 'list',
            name: 'incType',
            message: '自动升级版本，请选择升级版本类型',
            default: 'patch',
            choices: [
              {
                name: `小版本 (${releaseVersion} -> ${semver.inc(
                  releaseVersion,
                  'patch'
                )})`,
                value: 'patch',
              },
              {
                name: `中版本 (${releaseVersion} -> ${semver.inc(
                  releaseVersion,
                  'minor'
                )})`,
                value: 'minor',
              },
              {
                name: `大版本 (${releaseVersion} -> ${semver.inc(
                  releaseVersion,
                  'major'
                )})`,
                value: 'major',
              },
            ],
          },
        ])
      ).incType;
      // 获取到封信的版本
      const incVersion = semver.inc(releaseVersion, incType);
      this.branch = `${VERSION_DEVELOP}/${incVersion}`;
      this.version = incVersion;
    }
    log.verbose('本地开发分支', this.branch);
    // 同步版本到package.json当中
    this.syncVersionToPackageJson();
  }

  // 同步版本到package.json当中
  syncVersionToPackageJson() {
    const pkg = fse.readJsonSync(`${this.dir}/package.json`);
    if (pkg && pkg.version) {
      pkg.version = this.version;
      fse.writeJSONSync(`${this.dir}/package.json`, pkg, { spaces: 2 });
    }
  }

  // 获取到远程的分支列表
  async getRemoteBranchList(type) {
    // 通过git ls-remote来列出所有的远程分支
    const remoteList = await this.git.listRemote(['--refs']);
    // 定义一个正则拿到开发或者发布分支
    let req;
    if (type === VERSION_RELEASE) {
      // refs/tags/release/1.0.0
      req = /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/g;
    } else if (type === VERSION_DEVELOP) {
      //
    }
    // 获取到版本号数组
    remoteList
      .split('\n')
      .map(remote => {
        const match = req.exec(remote);
        // 必须重置正则起始位置
        req.lastIndex = 0;
        if (match && semver.valid(match[1])) {
          return match[1];
        }
      })
      .filter(_ => _)
      .sort((a, b) => {
        if (semver.lt(b, a)) {
          if (a === b) {
            return 0;
          }
          return -1;
        }
        return 1;
      });
  }

  // 实现本地仓库初始化
  async init() {
    // 以及初始化过仓库就不存在重新初始化，如果存在commit重新初始化 会丢失commit
    if (this.getRemote()) {
      return;
    }
    // 初始化git仓库和add remote关联远程仓库
    await this.initAndAddRemote();
    // 初始化提交
    await this.initCommit();
  }

  // 初始化提交
  async initCommit() {
    /**
     * 1.检查代码冲突
     * 2.检查是否有未提交的数据
     * 3.检查是否存在master分支
     */
    await this.checkConflicted();
    await this.checkNotCommit();

    if (await this.checkRemoteMaster()) {
      await this.pullRemoteRepo('master', {
        // 该仓储解决两个没有关系的代码分支进行合并
        '--allow-unrelated-histories': null,
      });
    } else {
      await this.pushRemoteRepo('master');
    }
  }

  // 检查代码冲突
  async checkConflicted() {
    log.info('代码冲突检查');
    const status = await this.git.status();
    if (status.conflicted.length > 0) {
      throw new Error('当前代码存在冲突,请手动处理合并后再试！');
    }
    log.success('代码冲突检查通过');
  }

  // 检查是否有未提交的数据
  async checkNotCommit() {
    const status = await this.git.status();
    // 所有可能导致未提交的状态都需要加上
    if (
      status.no_added.length > 0 ||
      status.created.length > 0 ||
      status.deleted.length > 0 ||
      status.modified.length > 0 ||
      status.renamed.length > 0
    ) {
      log.verbose('status', status);
      // 添加到本地暂存区域
      await this.git.add(status.no_added);
      await this.git.add(status.created);
      await this.git.add(status.deleted);
      await this.git.add(status.modified);
      await this.git.add(status.renamed);
      // 定义提交信息
      let message;
      while (!message) {
        message = (
          await inquirer.prompt({
            type: 'text',
            name: 'message',
            message: '请输入commit信息',
          })
        ).message;
      }
      // commit数据
      await this.git.commit(message);
      log.success('本次commit提交成功');
    }
  }

  // 检查master分支是否存在
  async checkRemoteMaster() {
    // git ls-remote 在远程仓库中列出所有的引用，master分支存在势必会有  refs/heads/master
    return (
      (await this.git.listRemote('--refs')).indexOf('refs/heads/master') >= 0
    );
  }

  // 推送远程仓库
  async pushRemoteRepo(branchName) {
    log.info(`推送代码至${branchName}分支`);
    await this.git.push('origin', branchName);
    log.success('代码推送成功');
  }

  // 拉取远程仓库
  async pullRemoteRepo(branchName, option) {
    log.info(`同步远程${branchName}分支代码`);
    await this.git.pull('origin', branchName, option);
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
      gitServer = (
        await inquirer.prompt([
          {
            type: 'list',
            name: 'gitServer',
            message: '请选择你想要托管的Git平台',
            default: GITHUB,
            choices: GIT_SERVER_TYPE,
          },
        ])
      ).gitServer;
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
          terminalLink('的token,参考文献:', this.gitServer.getTokenHelpUrl())
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
