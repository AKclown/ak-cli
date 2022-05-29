const SimpleGit = require('simple-git');
const log = require('@ak-clown/log');
const path = require('path');
const userHome = require('user-home');
const fse = require('fs-extra');
const fs = require('fs');

const DEFAULT_CLI_HOME = 'ak-cli';
class Git {
    constructor({ name, version, dir }) {
        this.name = name;
        this.version = version;
        this.dir = dir;
        this.git = SimpleGit(dir);
        this.gitServer = null;
        this.homePath = null;
    }
    // 准备工作，创建gitServer对象
    async prepare() {
        // $ 检查缓存主目录
        this.checkHomePath()
    }

    // 检查缓存主目录
    checkHomePath() {
        log.verbose('env', process.env)
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
            throw new Error('用户主目录获取数据失败！')
        }
    }

    // 初始化操作
    init() { }
}

module.exports = Git;