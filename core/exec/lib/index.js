'use strict';

const Package = require('@ak-clown/package');
const log = require('@ak-clown/log');
const path = require('path');

const SETTINGS = {
    init: '@ak-clown/init'
}

// 缓存默认目录
const CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.DEFAULT_CLI_HOME;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    // 拿到package name  --- init
    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    // 获取到对应的包名
    const packageName = SETTINGS[cmdName];
    // 默认给定一个最新的版本号
    const packageVersion = 'latest';
    // $暂定
    let storePath = '';

    if (!targetPath) {
        // $ 不存在本地, 查找缓存目录
        targetPath = path.resolve(homePath, CACHE_DIR);
        storePath = path.resolve(targetPath, 'node_modules');
        log.verbose('storePath', storePath);
        const pkg = new Package({
            targetPath,
            packageName,
            storePath,
            packageVersion
        });
        // $ 判断package是否存在
        if (await pkg.exists()) {
            // 更新package
            pkg.update();
        } else {
            // 安装package
            pkg.install();
        }
    } else {
        // $ 本地文件
        const pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        });
        const rootFile = pkg.getRootFilePath();
        // 获取到本地入口文件，将arguments传入进去
        if (rootFile) {
            require(rootFile).apply(null, arguments);
        }
    }
}

module.exports = exec;

