const Command = require('@ak-clown/command');
const log = require('@ak-clown/log');
const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const semver = require('semver');
const getProjectTemplate = require('./getProjectTemplate.js')

// 项目/组件
const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

class InitCommand extends Command {

    // 模板数据
    template;

    // 项目信息
    projectInfo;

    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName', this.projectName);
        log.verbose('force', this.force);
    }

    async exec() {
        /**
         * 1.准备阶段
         * 2.下载模板
         * 3.安装模板
         */
        try {
            // 1.准备阶段
            const projectInfo = await this.prepare();
            if (projectInfo) {
                //  2.下载模板
                log.verbose('projectInfo', projectInfo);
                this.projectInfo = projectInfo;
                this.downloadTemplate();
                // 3. 安装模板
            }
        } catch (error) {
            log.error(error.message);
        }
    }

    downloadTemplate() {
        /**
         * 1.通过项目模板API获取项目模板信息
         * 2.通过egg.js搭建一套后台系统
         * 3.通过npm存储项目模板(vue-cli/vue-element-admin)
         * 4.将项目模板储存到mongodb数据库中
         * 5.通过egg.js获取mongodb中的数据并且通过API返回
         */
    }

    async prepare() {
        /**
         * 1. 判断当前目录是否为空
         * 2. 是否启动强制刷新
         * 3. 选择创建项目或组件
         * 4. 获取项目基本信息
         */

        // $ 判断项目模板是否存在
        const template = await getProjectTemplate();
        if (!template || template.length === 0) {
            throw new Error('项目模板不存在');
        }
        this.template = template;

        const localPath = process.cwd();
        if (!this.isCwdEmpty(localPath)) {
            // 1.1 询问是否继续创建
            let ifContinue = false;
            // $ 强制更新 - 不给予提示
            if (!this.force) {
                ifContinue = (await inquirer
                    .prompt({
                        type: 'confirm',
                        name: 'ifContinue',
                        default: false,
                        message: '当前文件不为空，是否继续创建项目?'
                    })).ifContinue;
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

        return await this.getProjectInfo();
    }

    // 判断当前目录是否为空
    isCwdEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        // 忽略掉.开头文件 以及 node_modules目录
        fileList = fileList.filter(file => (
            !file.startsWith('.') && !['node_modules'].includes(file)
        ))
        return !fileList || fileList.length <= 0;
    }

    async getProjectInfo() {
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

        const { projectName, projectVersion } = await inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'projectName',
                    message: '请输入项目名称',
                    default: '',
                    validate: function (v) {
                        const done = this.async();
                        /**
                         * 1. 首字母必须为英文字符
                         * 2. 尾字符必须为英文或数字，不能为字符
                         * 3. 字符仅允许“-_”
                         */
                        setTimeout(function () {
                            if (!/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]|[a-zA-Z0-9]*)*$/.test(v)) {
                                done('请输入合法的项目名称');
                                return;
                            }
                            // Pass the return value in the done callback
                            done(null, true);
                        }, 0);
                    },
                    filter: function (v) {
                        return v;
                    }
                }, {
                    type: 'input',
                    name: 'projectVersion',
                    message: '请输入项目版本号',
                    default: '1.0.0',
                    validate: function (v) {
                        return !!semver.valid(v);
                    },
                    filter: function (v) {
                        if (!!semver.valid(v)) {
                            // 能够将V1.0.0转为 1.0.0
                            return semver.valid(v);
                        } else {
                            return v
                        }
                    }
                }, {
                    type: 'list',
                    name: 'projectTemplate',
                    message: '请选择项目模板',
                    choices: this.createTemplateChoice()
                }
            ]);
        // 2. 获取项目的基本信息
        if (type === TYPE_PROJECT) {

        } else if (type === TYPE_COMPONENT) {

        }

        const projectInfo = { type, projectName, projectVersion };
        // 返回项目的基本信息
        return projectInfo
    }

    createTemplateChoice() {
        return this.template.map(item => ({
            value: item.npmName,
            name: item.name
        }))

    }
}



// todo 
function init(args) {
    return new InitCommand(args).exec();
}

module.exports = init;