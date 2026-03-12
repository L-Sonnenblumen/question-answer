import { message } from 'antd';
import type { AxiosError, AxiosResponse } from 'axios';

const TokenKey = 'ACCESS-TOKEN';

/* 成功拦截：只返回 response.data */
export const responseInterceptor = (response: AxiosResponse) => {
  // 二进制直接透传 data（后端一般返回 blob 本身）
  if (response.config.responseType === 'blob') {
    if (response.status !== 200) {
      message.error(`请求失败 ${response.status}`);
      return Promise.reject(response.data);
    }
    return response.data;
  }

  // 业务码失败
  const { code, message: msg } = response.data ?? {};
  if (code !== 0 && code !== 200 && code !== 201) {
    // console.log("拦截器Code", code);

    // if (code === 207) return Promise.reject("存在循环绑定行为");
    message.error(msg || '系统错误');
    return Promise.reject(response.data);
  }

  // 成功 => 只返回 data
  return response.data;
};

/* 失败拦截：保持现有提示，reject 统一抛 error.response?.data || error */
export const errorInterceptor = (error: AxiosError) => {
  if (!error.response) {
    return Promise.reject(error);
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
      window.localStorage.removeItem(TokenKey);

      setTimeout(() => {
        const { pathname } = window.location;
        if (pathname.startsWith('/manage'))
          window.location.href = '/scholar-guard';
        if (pathname.startsWith('/consumer')) window.location.href = '/custom';
      }, 3000);
      break;
    case 409:
      message.error('该账号已在别的设备登录');
      break;
    case 422:
      // data?.detail?.forEach((item: any) => message.error(item.msg));
      break;
    default:
      message.error('服务器异常');
  }

  return Promise.reject(data || error);
};
