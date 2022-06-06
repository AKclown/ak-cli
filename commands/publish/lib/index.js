const Command = require('@ak-clown/command');
const Git = require('@ak-clown/git');
const log = require('@ak-clown/log');
const path = require('path');
const fse = require('fs-extra');
class PublishCommand extends Command {
  // 准备阶段
  init() {
    // $ 处理参数
    log.verbose('publish', this._argv, this._cmd);
    this.options = {
      refreshServer: this._cmd.refreshServer,
      refreshToken: this._cmd.refreshToken,
      refreshOwner: this._cmd.refreshOwner,
      buildCmd: this._cmd.buildCmd,
    };
  }

  // 执行阶段
  async exec() {
    try {
      // 记录发布时间
      const startTime = new Date().getTime();
      // 1. 初始化检查
      this.prepare();
      // 2. Git Flow自动化
      const git = new Git(this.projectInfo, this.options);
      // 自动化提交准备和代码仓库初始化
      await git.prepare();
      // 代码自动化提交
      await git.commit();
      // 3. 云构建 和 云发布
      await git.publish();
      const endTime = new Date().getTime();
      log.info(
        '本次发布耗时:',
        Math.floor((endTime - startTime) / 1000) + '秒'
      );
    } catch (error) {
      log.error(error.message);
      if (process.env.LOG_LEVEL === 'verbose') {
        console.log(error);
      }
    }
  }

  // 初始化检查
  prepare() {
    // 1. 确认项目是否为npm项目 （package.json是否存在）
    const projectPath = process.cwd();
    const pkgPath = path.resolve(projectPath, 'package.json');
    if (!fse.pathExistsSync(pkgPath)) {
      throw new Error('package.json不存在');
    }
    // 2. 确认是否包含name、version属性以及build命令
    const pkg = fse.readJsonSync(pkgPath);
    const { name, version, script } = pkg;
    if (!name || !version || !script || !script.build) {
      log.verbose(
        'package.json信息不全，请检查是否存在name、version和script (需要提供build命令)'
      );
    }
    // 将项目信息保存
    this.projectInfo = { name, version, dir: projectPath };
  }
}

function publish(args) {
  console.log('args: ', args);
  // $ 这个args就是执行脚手架传入的参数
  return new PublishCommand(args);
}

module.exports = publish;
module.exports.PublishCommand = PublishCommand;
