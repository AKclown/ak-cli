const GitServer = require('./GitServer');

class Github extends GitServer {
  constructor() {
    super('github');
  }

  // 获取SSH KEY的帮助文档
  getSHHKeysUrl() {
    return 'https://github.com/settings/keys';
  }

  // 获取SSH KEY的帮助文档
  getTokenHelpUrl() {
    return 'https://docs.github.com/cn/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection';
  }
}

module.exports = Github;
