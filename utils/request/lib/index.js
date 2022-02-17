'use strict';

const axios = require('axios');

// 地址不要使用ip，如果还没用域名，应该使用switchHoot进行ip映射
const BASE_URL = process.env.AK_CLI_BASE_URL ? process.env.AK_CLI_BASE_URL :
    'http://local.akclown.com:7001';

const request = axios.create({
    baseURL: BASE_URL,
    timeout: 5000
})

request.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        return Promise.reject(error);
    }
)

module.exports = request;