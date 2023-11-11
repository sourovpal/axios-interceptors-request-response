import axios from 'axios';

import { useDispatch } from 'react-redux';

import { TokenService } from '..';

import { deleteUserData } from '../../../Accounts/actions';

const requestService = axios.create({
  baseURL: process.env.REACT_APP_API_ENTRYPOINT,
});

requestService.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

requestService.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const valid = TokenService.getRefreshTokenValidity();
    // if refresh token is expired, redirect user to login with action
    if (!valid) {
      useDispatch(deleteUserData());
    }

    if (error.response.status === 401 && !originalRequest.retry) {
      originalRequest.retry = true;
      return requestService({
        url: '/api/v1/accounts/token/refresh/',
        method: 'post',
        data: {
          refresh: TokenService.getRefreshToken(),
        },
      }).then((res) => {
        if (res.status === 200) {
          TokenService.setToken(res.data);

          requestService.defaults.headers.common.Authorization = `Bearer ${TokenService.getAccessToken()}`;

          return requestService(originalRequest);
        }
        return null;
      });
    }
    return Promise.reject(error);
  }
);

export default requestService;


import jwt from 'jsonwebtoken';

const TokenService = (function tokenService() {
  let service;
  function getServiceFunc() {
    if (!service) {
      service = this;
      return service;
    }
    return service;
  }

  const setToken = (tokenObj) => {
    if (tokenObj.access) {
      localStorage.setItem('accessToken', tokenObj.access);
    }
    if (tokenObj.refresh) {
      localStorage.setItem('refreshToken', tokenObj.refresh);
    }
  };

  const getAccessToken = () => localStorage.getItem('accessToken');

  const getRefreshToken = () => localStorage.getItem('refreshToken');

  const getTokenValidity = (tokenObj) => {
    const decodedToken = jwt.decode(tokenObj, { complete: true });
    const dateNow = new Date();
    const timeStamp = dateNow.getTime() / 1000;

    if (decodedToken.payload.exp < timeStamp) {
      return false;
    }
    return true;
  };

  const getAccessTokenValidity = () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      return getTokenValidity(accessToken);
    }
    return null;
  };

  const getRefreshTokenValidity = () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      return getTokenValidity(refreshToken);
    }
    return null;
  };

  const clearToken = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return {
    getService: getServiceFunc,
    setToken,
    getAccessToken,
    getRefreshToken,
    getAccessTokenValidity,
    getRefreshTokenValidity,
    clearToken,
  };
})();

export default TokenService;







