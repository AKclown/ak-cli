// 云构建
const io = require('socket.io-client');
const log = require('@ak-clown/log');
const get = require('lodash/get');

// ws的链接地址
const WS_SERVER = 'http://127.0.0.1:7001';
// 构建超时时间
const TIME_OUT = 5 * 60 * 1000;
// ws链接超时时间
const WS_CONNECT_TIMEOUT = 5 * 1000;

// 解析socket的msg
function parseMsg(msg) {
  const action = get(msg, 'data.action');
  const message = get(msg, 'data.payload.message');
  return {
    action,
    message,
  };
}

class CloudBuild {
  constructor(git, options) {
    this.git = git; // git实例
    this.buildCmd = options.buildCmd;
    this.timeout = TIME_OUT;
  }

  // 超时方法
  doTimeout(fn, timeout) {
    this.timer && clearTimeout(this.timer);
    log.info('设置任务超时时间:', `${timeout / 1000}秒`);
    this.timer = setTimeout(fn, timeout);
  }

  // 云构建初始化
  init() {
    const socket = io(WS_SERVER, {
      query: {
        // 服务端需要下载源码、安装依赖。 需要客户端提供一些基础信息
        repo: this.git.remote,
        name: this.git.name,
        branch: this.git.branch,
        version: this.git.version,
        buildCmd: this.buildCmd,
      },
    });

    // connect事件
    socket.on('connect', () => {
      // 链接成功清除超时任务
      clearTimeout(this.timer);
      const { id } = socket;
      log.success('云构建任务创建成功', `任务ID:${id}`);
      socket.on(id, msg => {
        const parsedMsg = parseMsg(msg);
        log.success(parsedMsg.action, parsedMsg.message);
      });
    });

    // 断开链接
    const disconnect = () => {
      clearTimeout(this.timer);
      socket.disconnect();
      socket.close();
    };

    // 注册连接超时定时任务
    this.doTimeout(() => {
      log.error('云构建服务链接超时，自动终止');
      disconnect();
    }, WS_CONNECT_TIMEOUT);

    // disconnect - 服务端断开链接
    socket.on('disconnect', () => {
      log.success('disconnect', '云构建任务断开');
      disconnect();
    });

    // 出现异常
    socket.on('error', error => {
      log.error('error', '云构建出错', error);
      disconnect();
    });
  }
}
module.exports = CloudBuild;
