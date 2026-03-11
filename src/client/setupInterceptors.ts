import type { AxiosInstance } from 'axios';

// 响应拦截器
import { requestErrorInterceptor, requestInterceptor } from './interceptors/request';
import { errorInterceptor, responseInterceptor } from './interceptors/response';

export const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
};
