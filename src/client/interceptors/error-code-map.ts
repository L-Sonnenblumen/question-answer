// 错误码参考
export const ERROR_CODE_MAP: Record<number, string> = {
  400: '参数错误',
  401: '登录已过期',
  403: '无权限',
  409: '账号在其他设备登录',
  422: '表单校验失败',
  500: '服务器异常',
};
