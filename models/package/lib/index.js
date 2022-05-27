'use strict';
const { isObject } = require('@ak-clown/utils');
const pkgDir = require('pkg-dir');
const path = require('path');
const npminstall = require('npminstall');
const formatPath = require('@ak-clown/format-path');
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require('@ak-clown/get-npm-info');
const pathExists = require('path-exists');
const fse = require('fs-extra');

class Package {
  constructor(options) {
    if (!options || !isObject(options)) {
      throw new Error('Package类的options参数不能为空');
    }
    // package路径
    this.targetPath = options.targetPath;
    // package存储路径
    this.storePath = options.storePath;
    // package的name
    this.packageName = options.packageName;
    // package的version
    this.packageVersion = options.version;
    // package的缓存目录前缀  @ak-cli/init 改为 @ak-cli_init
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  // 准备工作
  async prepare() {
    // $ 新建缓存目录 - 安装包的位置
    if (this.storePath && !pathExists(this.storePath)) {
      fse.mkdirSync(this.storePath);
    }

    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  get cacheFilePath() {
    // @ak-cli/init 1.1.2 => _@ak-cli_init@1.1.2@@ak-cli/
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }

  // 判断当前package是否存在
  async exists() {
    // $ 判断属于storeDir还是targetPath 。
    if (this.storePath) {
      await this.prepare();
      return await pathExists(this.cacheFilePath);
    } else {
      // targetPath 直接判断当前路径是否存在
      return await pathExists(this.targetPath);
    }
  }

  // 安装package
  async install() {
    await npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }

  // 更新package
  async update() {
    await this.prepare();
    // 1. 获取到最新的npm模块版本号
    const lastPackageVersion = await getNpmLatestVersion(this.packageName);
    // 2. 查询最新版本号对应的路径是否存在 （判断当前包是否存在）
    const lastFilePath = this.getSpecificCacheFilePath(lastPackageVersion);
    // 3. 如果不存在, 则直接安装最新版本
    if (!pathExists(lastFilePath)) {
      npminstall({
        root: this.targetPath,
        storePath: this.storePath,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: lastPackageVersion,
          },
        ],
      });
      this.packageVersion = lastPackageVersion;
    } else {
      this.packageVersion = lastPackageVersion;
    }
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${packageVersion}
        @${this.packageName}`
    );
  }

  // 获取入口文件路径  -  从main下的lib找到入口文件路径
  async getRootFilePath() {
    async function _getRootFile(targetPath) {
      // 1. 获取package.json所在目录 --- pkgDir获取当前路径的根目录
      const dir = await pkgDir(targetPath);

      if (dir) {
        // 2. 获取package.json
        const pkgFile = require(path.resolve(dir, 'package.json'));
        //  3. 寻找main/lib
        if (pkgFile && pkgFile.main) {
          //  4. 路径的兼容 (Windows/macOS)   定义为入口文件路径
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
    }
    if (this.storePath) {
      return await _getRootFile(this.cacheFilePath);
    } else {
      return await _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
