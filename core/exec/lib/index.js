'use strict';

const Package = require('@ak-clown/package');
const log = require('@ak-clown/log');
const path = require('path');
const { exec: spawn } = require('@ak-clown/utils');

const SETTINGS = {
  init: '@ak-clown/init',
  publish: '@ak-clown/publish',
};
// 缓存默认目录
const CACHE_DIR = 'dependencies';

// $ exec的参数不能显示指定，因为不知道具体有几个参数。参数个数由调用时确定，通过arguments来进行获取
async function exec() {
  /**
   * - 封装package类，封装 ---目的---> 复用
   * 1. targetPath  ---> modulePath
   * 2. modulePath  ---> Package (npm模块)
   * 3. Package.getRootFile (获取入口文件)
   * 4. Package.update / Package.install
   */
  // $ 指定的本地init地址
  let targetPath = process.env.CLI_TARGET_PATH;
  // userHome 用户主目录
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);

  // $ 拿到package name  --- init  (第一个是projectName 最后一个是command对象)
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  // 获取到对应的包名
  const packageName = SETTINGS[cmdName];
  // 默认给定一个最新的版本号
  const packageVersion = 'latest';
  // $ 暂定
  let storePath = '';

  if (!targetPath) {
    // $ 不存在本地, 查找缓存目录 C:\Users\ak\ak-cli\dependencies
    targetPath = path.resolve(homePath, CACHE_DIR);
    //  C:\Users\ak\ak-cli\dependencies\node_modules
    storePath = path.resolve(targetPath, 'node_modules');
    log.verbose('storePath', storePath);
    const pkg = new Package({
      targetPath,
      packageName,
      storePath,
      packageVersion,
    });
    // $ 判断package是否存在
    if (await pkg.exists()) {
      // 更新package
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    // $ 本地文件 -- 自定义本地文件路径
    const pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
    const rootFile = await pkg.getRootFilePath();
    // 获取到本地入口文件，将arguments传入进去
    if (rootFile) {
      try {
        // $ 在当前进程中调用
        // 执行方法文件，并且传递argument参数
        // require(rootFile)(Array.from(arguments));
        // $ 不知道为啥这么调用arguments参数会丢失
        // require(rootFile).apply(null, Array.from(arguments));

        // $ 在Node子进程中调用
        const args = Array.from(arguments);
        const cmd = args[args.length - 1];
        const o = Object.create(null);
        // 过滤掉集成参数和私有参数、以及parent
        Object.keys(cmd).forEach(key => {
          if (
            // eslint-disable-next-line no-prototype-builtins
            cmd.hasOwnProperty(key) &&
            !key.startsWith('_') &&
            key !== 'parent'
          ) {
            o[key] = cmd[key];
          }
        });
        args[args.length - 1] = o;
        const code = `require('${rootFile}').call(null,${JSON.stringify(
          args
        )})`;
        const child = spawn('node', ['-e', code], {
          cwd: process.cwd(),
          stdio: 'inherit',
        });
        child.on('error', e => {
          log.error(e.message);
          process.exit(1);
        });
        child.on('exit', e => {
          log.verbose('命令执行成功' + e);
        });
      } catch (error) {
        log.error(error.message);
      }
    }
  }
}

module.exports = exec;
