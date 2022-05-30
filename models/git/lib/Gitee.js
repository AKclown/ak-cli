// API文档: https://gitee.com/api/v5/swagger#/getV5UsersUsernameOrgs
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

  // 获取远程仓库
  getRepo(login, name) {
    return this.request.get(`/repos/${login}/${name}`).then(response => {
      return this.handleResponse(response);
    });
  }

  // 是否为http请求
  isHttpResponse(response) {
    return response && response.status;
  }

  handleResponse(response) {
    // $ 仓库存在和不存在返回的数据不一样，做数据处理
    if (this.isHttpResponse(response) && response !== 200) {
      return null;
    }
    return response;
  }

  // 创建个人仓库
  createRepo(name) {
    this.request.post('/user/repos', { name });
  }

  // 创建组织仓库
  createOrgRepo(name, login) {
    this.request.post(`/orgs/${login}/repos`, { name });
  }

  // 获取仓库地址
  getRemote(login, name) {
    return `git@gitee.com:${login}/${name}.git`;
  }

  // 获取SSH KEY的帮助文档
  getTokenUrl() {
    return 'https://gitee.com/profile/personal_access_tokens';
  }

  // 获取SSH KEY的帮助文档
  getTokenHelpUrl() {
    return 'https://gitee.com/profile/personal_access_tokens';
  }
}

module.exports = Gitee;
