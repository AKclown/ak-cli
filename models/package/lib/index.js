'use strict';
const { isObject } = require('@ak-clown/utils');
const pkgDir = require('pkg-dir');
const path = require('path');
const npminstall = require('npminstall');
const formatPath = require('@ak-clown/format-path');
const { getDefaultRegistry, getNpmLatestVersion } = require('@ak-clown/get-npm-info');
const pathExists = require('path-exists');
const fse = require('fs-extra');

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
        // package的缓存目录前缀  @ak-cli/init 改为 @ak-cli_init
        this.cacheFilePathPrefix = this.packageName.replace('/', '_');
    }

    // 准备工作
    async prepare() {
        // $ 新建缓存目录
        if (this.storePath && !pathExists(this.storePath)) {
            fse.mkdirSync(this.storePath);
        }

        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName);
        }
    }

    get cacheFilePath() {
        // @ak-cli/init 1.1.2 => _@ak-cli_init@1.1.2@@ak-cli/
        return path.resolve(this.storePath, `_${this.cacheFilePathPrefix}@${this.
            packageVersion}@${this.packageName}`);
    }

    // 判断当前package是否存在
    async exists() {
        if (this.storePath) {
            await this.prepare();
            return await pathExists(this.cacheFilePath);
        } else {
            return await pathExists(this.targetPath);
        }
    }

    // 安装package
    install() {
        npminstall({
            root: this.targetPath,
            storePath: this.storePath,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName,
                version: this.packageVersion
            }]
        })
    }

    // 更新package
    async update() {
        await this.prepare();
        // 1. 获取到最新的npm模块版本号
        const lastPackageVersion = await getNpmLatestVersion(this.packageName);
        // 2. 查询最新版本号对应的路径是否存在
        const lastFilePath = this.getSpecificCacheFilePath(lastPackageVersion);
        // 3. 如果不存在, 则直接安装最新版本
        if (!pathExists(lastFilePath)) {
            npminstall({
                root: this.targetPath,
                storePath: this.storePath,
                registry: getDefaultRegistry(),
                pkgs: [{
                    name: this.packageName,
                    version: lastPackageVersion
                }]
            })
        }
        this.packageVersion = lastPackageVersion;
    }

    getSpecificCacheFilePath(packageVersion) {
        return path.resolve(this.storePath, `_${this.cacheFilePathPrefix}@${packageVersion}
        @${this.packageName}`);
    }

    // 获取入口文件路径
    getRootFilePath() {
        function _getRootFile(targetPath) {
            // 1. 获取package.json所在目录
            const dir = pkgDir(targetPath);
            if (dir) {
                // 2. 获取package.json
                const pkgFile = require(path.resolve(dir, 'package.json'));
                //  3. 寻找main/lib
                if (pkgFile && pkgFile.main) {
                    //  4. 路径的兼容 (Windows/macOS)   定义为入口文件路径
                    return formatPath(path.resolve(dir, pkgFile.main))
                }
            }
        }
        if (this.storePath) {
            return _getRootFile(this.cacheFilePath);
        } else {
            return _getRootFile(this.targetPath);
        }
    }
}

module.exports = Package;
