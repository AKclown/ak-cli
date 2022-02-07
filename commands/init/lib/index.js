const Command = require('@ak-clown/command');
const log = require('@ak-clown/log');
const path = require('path');
const fs = require('fs');

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName', this.projectName);
        log.verbose('force', this.force);
    }

    exec() {
        /**
         * 1.准备阶段
         * 2.下载模板
         * 3. 安装模板
         */
        try {
            this.prepare();
        } catch (error) {
            log.error(error.message);
        }
    }

    prepare() {
        /**
         * 1. 判断当前目录是否为空
         * 2. 是否启动强制刷新
         * 3. 选择创建项目或组件
         * 4. 获取项目基本信息
         */
        if(!this.isCwdEmpty()){
            // 1.1 询问是否继续创建
        }
    }

    isCwdEmpty() {
        const localPath = process.cwd();
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter(file => (
            !file.startsWith('.') && !['node_module'].includes(file)
        ))
        console.log('fileList: ', fileList);
        return !fileList || fileList.length <= 0;
    }
}

// todo 
function init(args) {
    return new InitCommand(args).exec();
}

module.exports = init;