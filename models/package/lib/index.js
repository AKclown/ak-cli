'use strict';
const { isObject } = require('@ak-clown/utils');
const pkgDir = require('pkg-dir');
const path = require('path');
const formatPath = require('@ak-clown/format-path');
class Package {
    constructor(options) {
        if (!options || isObject(options)) {
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
    getRootFilePath() {
        // 1. 获取package.json所在目录
        const dir = pkgDir(this.targetPath);
        if (dir) {
            // 2. 获取package.json
            const pkgFile = require(path.resolve(dir, 'package.json'));
            //  3. 寻找main/lib
            if (pkgFile && pkgFile.main) {
                //  4. 路径的兼容 (Windows/macOS)   定义为入口文件路径
                return formatPath(path.resolve(dir, pkgFile.main)) 
            }
        }
        return null;
    }
}

module.exports = Package;
