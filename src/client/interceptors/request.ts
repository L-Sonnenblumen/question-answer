import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../../utils/auth';

// 不需要token的接口白名单
const whiteList = [
  '/user/login',
  '/user/checkCode',
  '/user/refreshToken',
  '/V1/epc_ai/user/login',
  '/V1/epc_ai/user/register',
  '/V1/epc_ai/user/code_image',
  '/V1/epc_ai/user/refreshToken',
  '/V1/epc_ai/user/forgot_password',
  '/V1/epc_ai/user/phone_verification_code',
];

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (config.url && !whiteList.includes(config.url)) {
    const token = getToken();
    if (token?.length) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

export const requestErrorInterceptor = (error: AxiosError) => {
  return Promise.reject(error);
};
