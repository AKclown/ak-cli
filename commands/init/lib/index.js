const Command = require('@ak-clown/command');
const log = require('@ak-clown/log');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra')

// 项目/组件
const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

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

    async prepare() {
        /**
         * 1. 判断当前目录是否为空
         * 2. 是否启动强制刷新
         * 3. 选择创建项目或组件
         * 4. 获取项目基本信息
         */
        const localPath = process.cwd();
        if (!this.isCwdEmpty(localPath)) {
            // 1.1 询问是否继续创建
            let ifContinue = false;
            // $ 强制更新 - 不给予提示
            if (!this.force) {
                ifContinue = await inquirer
                    .prompt({
                        type: 'confirm',
                        name: 'ifContinue',
                        default: false,
                        message: '当前文件不为空，是否继续创建项目?'
                    }).ifContinue;

                if (!ifContinue) {
                    return;
                }
            }
            if (ifContinue || this.force) {
                // $ 给用户做二次确认框
                const { confirmDelete } = await inquirer
                    .prompt({
                        type: 'confirm',
                        name: 'confirmDelete',
                        default: false,
                        message: '是否确认清空当前目录下的文件?'
                    });
                if (confirmDelete) {
                    // $ 清空当前目录
                    fse.emptyDirSync(localPath);
                }

            }
        }

        return this.getProjectInfo();
    }

    isCwdEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter(file => (
            !file.startsWith('.') && !['node_module'].includes(file)
        ))
        console.log('fileList: ', fileList);
        return !fileList || fileList.length <= 0;
    }

    getProjectInfo() {
        const projectInfo = {};
        // 1. 选择创建项目或组件
        const { type } = await inquirer
            .prompt([{
                type: 'list',
                name: 'type',
                message: '请选择初始化类型',
                default: TYPE_PROJECT,
                choices: [{
                    name: '项目',
                    value: TYPE_PROJECT
                }, {
                    name: '组件',
                    value: TYPE_COMPONENT
                }]
            }]);
        log.verbose('type', type);

        const o = await inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'projectName',
                    message: '请输入项目名称',
                    default: '',
                    validate: function (v) {
                        return v;
                    },
                    filter: function (v) {
                        return v;
                    }
                }, {
                    type: 'input',
                    name: 'projectVersion',
                    message: '请输入项目版本号',
                    default: '',
                    validate: function (v) {
                        return v === 'string';
                    },
                    filter: function (v) {
                        return v;
                    }
                }
            ])
        // 2. 获取项目的基本信息
        if (type === TYPE_PROJECT) {

        } else if (type === TYPE_COMPONENT) {

        }
        // 返回项目的基本信息
        return projectInfo
    }
}

// todo 
function init(args) {
    return new InitCommand(args).exec();
}

module.exports = init;