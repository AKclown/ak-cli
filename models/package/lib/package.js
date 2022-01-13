'use strict';
const { isObject } = require('@ak-clown/utils')
class Package {
    constructor(options) {
        if(!options ||isObject(options) ){
            throw new Error('Package类的options参数不能为空');
        }
        // package路径
        this.targetPath = options.targetPath;
        // package存储路径
        this.storePath = options.storePath;
        // package的name
        this.packageName = options.name;
        // package的version
        this.packageVersion = options.version;
    }
    // 判断当前package是否存在
    exists() { }

    // 安装package
    install() { }

    // 更新package
    update() { }

    // 获取入口文件路径
    getRootFilePath() { }
}

module.exports = Package;
