'use strict';

const path = require('path');
function formatPath(p) {
    // $ 主要还是将window下的\转为/
    if (p && typeof p === 'string') {
        // $ 获取到平台分割符  window为\  macOS为/  
        const sep = path.sep;
        if (sep === '/') {
            return p;
        } else {
            return p.replace(/\\/g, '/');
        }
    }
    return p;
}

module.exports = formatPath;
