// src/router.tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Login from '../pages/Login';
import MainLayout from '../layout/mainLayout';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import QuizDetail from '../pages/QuizDetail';
import QuestionDetail from '../pages/QuestionDetail';
import AuthRoute from '../pages/AuthRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    // 带有底部导航栏的主布局 (Tab 页)
    path: '/',
    element: (
      <AuthRoute>
        <MainLayout />
      </AuthRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home', element: <Home /> },
      { path: 'profile', element: <Profile /> },
      // 成绩页 stats 等我们画好了再往这里加
    ],
  },
  {
    // 全屏独立布局 (没有底部导航栏的页面，比如答题页)
    path: '/quiz',
    // 覆盖一下 paddingBottom: 0，因为这里没有底部导航栏了
    element: (
      <AuthRoute>
        <div
          className="app-container scroll-content"
          style={{ paddingBottom: 0 }}
        >
          <Outlet />
        </div>
      </AuthRoute>
    ),
    children: [
      { path: ':quizId', element: <QuizDetail /> },
      { path: ':quizId/question/:questionId', element: <QuestionDetail /> },
      // 测验结果页 result 等画好了往这里加
    ],
  },
  {
    // 兜底路由：匹配不到的路径全回首页
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
