import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizType } from './QuizCard';
import Header from './Header';
import QuizCard from './QuizCard';
import api from '../api';
import { getStudentId } from '../utils/auth';

const FILTERS = [
  { key: '全部', label: '全部' },
  { key: '进行中', label: '进行中' },
  { key: '已完成', label: '已完成' },
  { key: '已过期', label: '已过期' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function Home() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('全部');
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const fetchData = async () => {
    try {
      setLoading(true);
      // 注意：接口如果支持 status 过滤可以直接传，如果不支持则前端过滤
      const res = await api.student.quizList(getStudentId(), '全部');

      // 🚀 核心适配逻辑：将接口字段映射为组件需要的 QuizType
      const adaptedData: QuizType[] = res.data.items.map((item: any) => ({
        id: item.quiz_id,
        name: item.quiz_name,
        status: item.status,
        totalQuestions: item.question_count,
        answeredCount: item.correct_count || 0, // 如果接口没给已答数，暂用正确数或0
        correctCount: item.correct_count,
        score: item.score,
        deadline: item.due_at,
        submittedAt: item.submitted_at,
        classInfo: '默认班级', // 接口中暂无此字段，设为默认
      }));

      setQuizzes(adaptedData);
    } catch (error) {
      console.error('获取测验列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchName = async () => {
    try {
      const res = await api.student.profile(getStudentId());
      console.log('🚀 ~ Home ~ res:', res);
      setName(res.data.real_name);
    } catch (error) {
      console.log(error);
    }
  };
  // 根据当前 Filter 过滤列表
  const filteredQuizzes = quizzes.filter(
    (q) => filter === '全部' || q.status === filter,
  );
  useEffect(() => {
    fetchName();
  }, []);
  // 计算进行中的数量（从原始数据计算）
  const ongoingCount = quizzes.filter((q) => q.status === '进行中').length;

  return (
    <>
      <Header
        title="我的测验"
        rightNode={
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            👤
          </button>
        }
      />

      {/* 欢迎 Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)',
          margin: '12px 14px',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          color: 'white',
          boxShadow: '0 8px 20px rgba(67, 97, 238, 0.25)',
        }}
      >
        <div style={{ fontSize: 32 }}>🌟</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            {name}同学，加油！
          </div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {ongoingCount > 0
              ? `今日有 ${ongoingCount} 场测验待完成`
              : '暂无待完成测验'}
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          overflowX: 'auto',
          background: '#fff',
          borderBottom: '1px solid #eee',
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 测验列表 */}
      <div
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : filteredQuizzes.length === 0 ? (
          <div
            style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            暂无相关测验
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onClick={() => {
                // 暂时统一跳转到测验详情页
                navigate(`/quiz/${quiz.id}`);
              }}
            />
          ))
        )}
      </div>
    </>
  );
}
