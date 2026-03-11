// src/layout/MainLayout.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname.includes(path) ? 'var(--accent)' : 'var(--muted)';

  return (
    <div className="app-container">
      {/* 滚动内容区 */}
      <div
        className="scroll-content"
        style={{ paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom))' }}
      >
        <Outlet />
      </div>

      {/* 底部导航 */}
      <div className="bottom-nav">
        {[
          { path: '/home', icon: '🏠', label: '首页' },
          { path: '/profile', icon: '👤', label: '我的' },
        ].map((tab) => (
          <div
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: isActive(tab.path),
            }}
          >
            <div
              style={{
                fontSize: 20,
                transition: 'transform 0.2s',
                transform: location.pathname.includes(tab.path)
                  ? 'scale(1.1)'
                  : 'scale(1)',
              }}
            >
              {tab.icon}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
