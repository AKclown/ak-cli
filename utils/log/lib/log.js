'use strict';

const log = require('npmlog');
// 修改log日志层级
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';
// 同一修改前缀
log.heading = 'akClown';
log.addLevel('success', 200, { fg: 'green', bold: true });


module.exports = log;