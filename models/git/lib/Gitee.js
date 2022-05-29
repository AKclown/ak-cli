const GitServer = require('./GitServer');
const GiteeRequest = require('./GiteeRequest');

class Gitee extends GitServer {
  constructor() {
    super('gitee');
    // axios实例
    this.request = null;
  }

  // 设置token
  setToken(token) {
    super.setToken(token);
    this.request = new GiteeRequest(token);
  }

  // 获取用户信息
  async getUser() {
    return this.request.get('/users');
  }

  // 获取组织信息
  async getOrgs(username) {
    return this.request.get(`/users/${username}/orgs`, {
      // 目前不支持分页，尽可能展示多的数据，选择100条
      page: 1,
      per_page: 100,
    });
  }

  // 获取SSH KEY的帮助文档
  getSHHKeysUrl() {
    return 'https://gitee.com/profile/sshkeys';
  }

  // 获取SSH KEY的帮助文档
  getTokenHelpUrl() {
    return 'https://gitee.com/profile/personal_access_tokens';
  }
}

module.exports = Gitee;
