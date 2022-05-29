const GitServer = require('./GitServer');

class Gitee extends GitServer {
  constructor() {
    super('gitee');
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
