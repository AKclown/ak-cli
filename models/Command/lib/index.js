'use strict';

// 所有命令的基类，参考lerna源码
class Command {
    constructor() {

    }

    // 准备阶段
    init() {
        throw new Error('准备阶段');
    }   
    // 执行阶段
    exec() {
        throw new Error('执行阶段');
    }
}

module.exports = Command;