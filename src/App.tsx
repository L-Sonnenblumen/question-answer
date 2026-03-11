// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import router from './router';
import './index.css';
import { message } from 'antd';

export default function App() {
  message.config({
    maxCount: 1,
    duration: 3,
  });
  return <RouterProvider router={router} />;
}
