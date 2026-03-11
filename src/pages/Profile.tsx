// src/pages/Profile.tsx
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { clearAuth, getStudentId } from '../utils/auth';
import api from '../api';
import { useEffect, useState } from 'react';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [student, setProfileData] = useState();
  const fetchData = async (student_id) => {
    setLoading(true);
    try {
      const res = await api.student.profile(student_id);
      setProfileData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(getStudentId());
  }, []);
  const handleLogout = async () => {
    // UI 阶段：不清理实际状态，直接跳转感受交互
    await api.student.logout(getStudentId());
    clearAuth();
    navigate('/login');
  };

  return (
    <>
      <Header
        title="个人中心"
        rightNode={
          <button style={{ background: 'none', border: 'none', fontSize: 18 }}>
            👤
          </button>
        }
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
      ) : (
        student && (
          <div>
            {/* 深色头部背景与基本信息 */}
            <div className="profile-header">
              <div className="profile-avatar">{student.real_name[0]}</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 4,
                }}
              >
                {student.real_name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'DM Mono,monospace',
                }}
              >
                学号: {student.student_no} · {student.class_name}
              </div>
            </div>

            {/* 悬浮的统计数据卡片 */}
            <div
              style={{
                display: 'flex',
                background: 'var(--surface)',
                margin: '-24px 14px 0' /* 负 Margin 让它悬浮在深色背景上 */,
                borderRadius: 16,
                padding: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: 10,
              }}
            >
              {[
                { val: student.quiz_count, label: '已参与测验' },
                {
                  val: `${Math.round(student.avg_accuracy_rate * 100)}%`,
                  label: '平均正确率',
                },
                { val: student.answered_count, label: '已答题数' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      fontFamily: 'DM Mono,monospace',
                      color: 'var(--ink)',
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 24 }} />

            {/* 基本信息列表 */}
            <div
              style={{
                padding: '0 14px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--muted)',
                letterSpacing: 1.5,
              }}
            >
              基本信息
            </div>
            <div
              style={{
                background: 'var(--surface)',
                margin: '0 14px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {[
                { icon: '👤', label: '姓名', val: student.real_name },
                { icon: '🎓', label: '学号', val: student.student_no },
                { icon: '🏛️', label: '班级', val: student.class_name },
                { icon: '🏫', label: '学校', val: '哈尔滨理工大学' },
              ].map((item) => (
                <div key={item.label} className="profile-item">
                  <div style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 24 }} />

            {/* 账号设置列表 */}
            <div
              style={{
                padding: '0 14px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--muted)',
                letterSpacing: 1.5,
              }}
            >
              账号设置
            </div>
            <div
              style={{
                background: 'var(--surface)',
                margin: '0 14px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <div className="profile-item" onClick={handleLogout}>
                <div style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                  🚪
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: 'var(--red)',
                  }}
                >
                  退出登录
                </div>
                <div style={{ color: 'var(--border)', fontSize: 14 }}>›</div>
              </div>
            </div>
          </div>
        )
      )}

      {/* 底部留白，防止被导航栏遮挡 */}
      <div style={{ height: 32 }} />
    </>
  );
}
