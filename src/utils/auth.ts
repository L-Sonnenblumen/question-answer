// src/utils/auth.ts

const TOKEN_KEY = 'token';
const UID_KEY = 'student_id';

// 1. 存入鉴权信息 (登录时调用)
export const setAuth = (token: string, studentId: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(UID_KEY, studentId);
};

// 2. 获取鉴权信息 (拦截器、路由守卫用)
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getStudentId = () => localStorage.getItem(UID_KEY);

// 3. 清除鉴权信息 (退出登录时调用)
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(UID_KEY);
};

// 判断是否已登录
export const isLogin = () => !!getToken();
