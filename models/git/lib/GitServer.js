function error(methodName) {
  throw new Error(`${methodName} must be implemented !`);
}

class GitServer {
  constructor(type, token) {
    this.type = type;
    this.token = token;
  }

  // 设置token
  setToken(token) {
    this.token = token;
  }

  // $ 定义子类必须实现方法
  // 创建个人仓库
  createRepo() {
    error('createRepo');
  }

  // 创建组织仓库
  createOrgRepo() {
    error('createRepo');
  }

  // 获取仓库地址
  getRemote() {
    error('createRepo');
  }

  // 获取到用户信息
  getUser() {
    error('createRepo');
  }

  // 获取到组织信息
  getOrg() {
    error('createRepo');
  }

  // 获取SSH KEY的帮助文档
  getSHHKeysUrl() {
    error('getSHHKeysUrl');
  }

  // 获取SSH KEY的帮助文档
  getTokenHelpUrl() {
    error('getTokenHelpUrl');
  }
}

module.exports = GitServer;
