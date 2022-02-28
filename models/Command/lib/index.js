'use strict';
const colors = require('colors');
const semver = require('semver');

const LOWEST_NODE_VERSION = '12.0.0';

// 所有命令的基类，参考lerna源码
class Command {
    constructor(argv) {
        if (!argv) {
            throw new Error('参数不能为空！');
        }
        if (!Array.isArray(argv)) {
            throw new Error('参数必须为数组！')
        }
        this._argv = argv;
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then(() => { this.checkNodeVersion() });
            chain = chain.then(() => this.initArgs());
            // 
            chain = chain.then(() => this.init());
            // 
            chain = chain.then(() => this.exec());
            chain.catch(err => { console.log(err.message) })
        })
    }

    initArgs() {
        this._cmd = this._argv[this._argv.length - 1];
        this._argv = this._argv.slice(0, this._argv.length - 1);
    }

    checkNodeVersion() {
        // 拿到当前Node版本号
        const currentVersion = process.version;
        // 对比最低版本号
        const lowestVersion = LOWEST_NODE_VERSION;

        if (!semver.gte(currentVersion, lowestVersion)) {
            throw new Error(colors.red(`ak-cli 需要安装v${lowestVersion}以上的NodeJS版本`))
        }
    }

    // 准备阶段
    init() {
        throw new Error('准备阶段');
    }
    // 执行阶段
    exec() {
        throw new Error('执行阶段');
    }
}


module.exports = Command;