const log = require('npmlog');
// 修改log日志层级
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';
// 同一修改前缀
log.heading = 'AK';
// 添加自定义命令
log.addLevel('success', 2000, { fg: 'green', bold: true });

module.exports = log;