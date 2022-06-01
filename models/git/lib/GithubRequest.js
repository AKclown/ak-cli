const axios = require('axios');
const BASE_URL = 'https://api.github.com';

class GithubRequest {
  constructor(token) {
    this.token = token;
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 6000,
    });

    this.service.interceptors.request.use(
      config => {
        config.headers['Authorization'] = `token ${this.token}`;
        return config;
      },
      error => {
        Promise.reject(error);
      }
    );
    this.service.interceptors.response.use(
      response => {
        return response.data;
      },
      error => {
        if (error.response && error.response.data) {
          return error.response;
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
      params,
      method: 'get',
      header,
    });
  }

  post(url, data, header) {
    return this.service({
      url,
      data,
      method: 'post',
      header,
    });
  }
}

module.exports = GithubRequest;
