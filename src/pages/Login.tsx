import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLogin, setAuth } from '../utils/auth'; // 💡 引入刚刚写的存储工具
import api from '../api';
import { message } from 'antd';

export default function Login() {
  const navigate = useNavigate();
  const [no, setNo] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    if (!no.trim() || !pw) {
      message.warning('请输入学号和密码');
      return;
    }
    setLoading(true);
    try {
      // 🚧 这里替换为真实的 axios 请求
      // const res = await api.post('/login', { studentNo: no, password: pw });
      const res = await api.student.login({
        student_no: no,
        password: pw,
      });
      console.log('🚀 ~ handleLogin ~ res:', res);

      // 💡 核心步骤：拿到后端返回的数据后，存入本地
      setAuth(res.data.token_info.access_token, res.data.user_id); // 真实场景用 res.data.token, res.data.studentId

      // 跳转到首页，并替换历史记录
      navigate('/home', { replace: true });
    } catch (error) {
      message.warning('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };
  // 💡 新增的拦截逻辑：组件挂载时检查，如果已经登录，瞬间跳走
  useEffect(() => {
    if (isLogin()) {
      // replace: true 保证这次强制跳转不会在历史记录里留下痕迹
      navigate('/home', { replace: true });
    }
  }, [navigate]);
  return (
    <div className="app-container" style={{ background: '#1c1c2e' }}>
      {/* 装饰性发光背景球 */}
      <div
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background:
            'radial-gradient(circle,rgba(67,97,238,0.3) 0%,transparent 70%)',
          top: -80,
          right: -80,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background:
            'radial-gradient(circle,rgba(46,201,142,0.2) 0%,transparent 70%)',
          bottom: 200,
          left: -60,
          pointerEvents: 'none',
        }}
      />

      {/* Logo 与 标题区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px 0',
        }}
      >
        <div
          style={{
            fontSize: 52,
            marginBottom: 16,
            filter: 'drop-shadow(0 0 20px rgba(67,97,238,0.5))',
          }}
        >
          📖
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            letterSpacing: 6,
            marginBottom: 6,
          }}
        >
          答题系统学生端
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 2,
            fontFamily: 'DM Mono,monospace',
            marginBottom: 32,
          }}
        >
          STUDENT LEARNING APP
        </div>
      </div>

      {/* 白色表单底座 */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px 48px',
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 22,
            color: '#1c1c2e',
          }}
        >
          学生登录
        </h2>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 16,
            }}
          >
            🎓
          </span>
          <input
            className="m-input"
            type="text"
            placeholder="请输入学号 (测试: 随便填)"
            value={no}
            onChange={(e) => setNo(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 16,
            }}
          >
            🔒
          </span>
          <input
            className="m-input"
            type="password"
            placeholder="请输入密码"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="m-btn m-btn-primary"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '登 录 中...' : '登 录'}
        </button>
      </div>
    </div>
  );
}
