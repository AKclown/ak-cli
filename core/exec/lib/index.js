'use strict';

const Package = require('@ak-clown/package');
const log = require('@ak-clown/log');

const SETTINGS = {
    init :'@ak-clown/init'
}
function exec() {
    const targetPath = process.env.CLI_TARGET_PATH;
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
    const storeDir = '';

    const pkg = new Package({
        targetPath,
        packageName,
        packageVersion
    });
}

module.exports = exec;

