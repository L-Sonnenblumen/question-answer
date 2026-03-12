import { Navigate } from 'react-router-dom';
import { isLogin } from '../utils/auth';

export default function AuthRoute({ children }) {
  // 如果没有登录，直接重定向到 login 页面，并替换当前历史记录
  if (!isLogin()) {
    return <Navigate to="/login" replace />;
  }

  // 登录了就正常渲染页面
  return children;
}
