const axios = require('axios');
const BASE_URL = 'https://gitee.com/api/v5';

class GiteeRequest {
  constructor(token) {
    this.token = token;
    this.service = axios.create({
      baseUrl: BASE_URL,
      timeout: 6000,
    });
    this.service.interceptors.response.use(
      response => {
        return response.data;
      },
      error => {
        if (error.response && error.response.data) {
          return error.response.data;
        } else {
          return Promise.reject(error);
        }
      }
    );
  }

  // Get方法
  get(url, params, header) {
    return this.service({
      url,
      params: {
        ...params,
        access_token: this.token,
      },
      method: 'get',
      header,
    });
  }

  post(url, data, header) {
    return this.service({
      url,
      params: {
        access_token: this.token,
      },
      data,
      method: 'post',
      header,
    });
  }
}

module.exports = GiteeRequest;
