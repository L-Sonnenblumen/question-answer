import axios from 'axios';

import { setupInterceptors } from './setupInterceptors'; // 改一下路径即可

const TIME_OUT = 200000;

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_PREFIX,
  timeout: TIME_OUT,
});

setupInterceptors(instance); // 单例装配
export default instance;
