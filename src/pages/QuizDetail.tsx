import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import api from '../api';
import { getStudentId } from '../utils/auth';
// 🚀 修改位置 1：在 import 下方加上这段组件
function Countdown({ deadline }: { deadline?: string }) {
  // 1. 兼容处理：解决某些浏览器不能解析 "YYYY-MM-DD HH:mm:ss" 的问题
  const safeDeadline = deadline?.replace(/-/g, '/').replace('T', ' ');

  // 2. 核心计算：截止时间减去当前时间 (Date.now())
  const calc = () => {
    if (!safeDeadline) return 0;
    const targetTime = new Date(safeDeadline).getTime();
    const nowTime = Date.now();
    return Math.max(0, Math.floor((targetTime - nowTime) / 1000));
  };

  const [secs, setSecs] = useState(calc);

  useEffect(() => {
    if (!safeDeadline) return;

    // 拿到新 deadline 后立刻计算一次，防止页面刚加载时白等 1 秒
    setSecs(calc());

    const id = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(id);
  }, [safeDeadline]);

  if (!safeDeadline) return <span>00:00:00</span>;
  if (secs <= 0) return <span>已截止</span>; // 倒计时结束直接显示已截止

  // 算时间
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const f = (n: number) => String(n).padStart(2, '0');

  return (
    <span>
      {f(h)}:{f(m)}:{f(s)}
    </span>
  );
}
// 状态标签组件保持不变
function QStatusLabel({ status }: { status: string }) {
  if (status === 'correct')
    return (
      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#2ec98e' }}>
        ✓ 已批改 · 正确
      </span>
    );
  if (status === 'wrong')
    return (
      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#e34c4c' }}>
        ✕ 已批改 · 错误
      </span>
    );
  if (status === 'pending')
    return (
      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#f5a623' }}>
        ⏳ 已提交，待批改
      </span>
    );
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#8a8aa0' }}>
      — 未作答
    </span>
  );
}

export default function QuizDetail() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState({
    name: '',
    classInfo: '',
    answeredCount: 0,
    totalQuestions: 0,
    status: 'ongoing', // 接口暂无 status/due_at 字段，这里默认设为进行中
    deadline: '', // 👈 a. 初始状态加上 deadline
  });
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!quizId) return;
      try {
        setLoading(true);
        const res = await api.student.quizDetail(getStudentId(), quizId);
        console.log('🚀 ~ fetchDetail ~ res:', res);

        // 🚀 核心修复：兼容不同层级的数据返回结构
        // 如果你的 api 封装直接返回了数据对象就是 res.data，如果是原生 axios 就是 res.data.data
        const responseData = res?.data?.data || res?.data || res;

        // 预防性拦截：如果还是没拿到 questions，停止向下执行避免报错
        if (!responseData || !Array.isArray(responseData.questions)) {
          console.error('接口返回的数据格式异常:', res);
          return;
        }

        // 映射题目数据
        const mappedQuestions = responseData.questions.map(
          (q: any, index: number) => {
            let uiStatus = 'blank';
            if (q.is_answered) {
              if (q.grading_status === '已批改') {
                uiStatus = q.result_status === '正确' ? 'correct' : 'wrong';
              } else {
                uiStatus = 'pending'; // 已作答但未批改
              }
            }

            return {
              id: q.question_id,
              index: index + 1,
              preview: q.question,
              status: uiStatus,
              isAnswered: q.is_answered,
            };
          },
        );

        // 计算已答题数
        const answeredCount = mappedQuestions.filter(
          (q: any) => q.isAnswered,
        ).length;

        // 更新测验基础信息
        setQuizInfo({
          name: responseData.quiz_name || '未命名测验',
          classInfo: responseData.class_name || '默认班级',
          answeredCount: answeredCount,
          totalQuestions: responseData.questions.length,
          status: 'ongoing',
          deadline: responseData.due_at, // 👈 b. 把接口返回的时间字段存进来 (如果是别的字段名请替换)
        });
        console.log(quizInfo);

        // 更新题目列表
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error('获取测验详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [quizId]);

  const isExpired = quizInfo.status === 'expired';
  const pct =
    quizInfo.totalQuestions > 0
      ? (quizInfo.answeredCount / quizInfo.totalQuestions) * 100
      : 0;

  if (loading) {
    return (
      <>
        <Header title="加载中..." showBack onBack={() => navigate('/home')} />
        <div style={{ textAlign: 'center', padding: '40px', color: '#8a8aa0' }}>
          数据加载中...
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={quizInfo.name} showBack onBack={() => navigate('/home')} />

      {/* 顶部进度与信息面板 */}
      <div
        style={{
          background: '#ffffff',
          padding: '14px 16px',
          borderBottom: '1px solid #e2ddd6',
        }}
      >
        <div style={{ fontSize: 13, color: '#8a8aa0', marginBottom: 6 }}>
          {quizInfo.name} · {quizInfo.classInfo}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#8a8aa0' }}>已作答</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: 'DM Mono,monospace',
                color: '#1c1c2e',
              }}
            >
              {quizInfo.answeredCount} / {quizInfo.totalQuestions}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              height: 6,
              background: '#f0ede8',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: '#2ec98e',
                borderRadius: 3,
                transition: 'width 0.5s ease',
              }}
            />
          </div>

          {isExpired ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 700,
                background: '#f0ede8',
                color: '#8a8aa0',
              }}
            >
              已过期
            </span>
          ) : (
            <div
            // style={{
            //   fontFamily: 'DM Mono, monospace',
            //   fontSize: 12,
            //   fontWeight: 600,
            //   background: '#fef0f0',
            //   color: '#e34c4c',
            //   padding: '2px 8px',
            //   borderRadius: 12,
            // }}
            >
              {/* 接口暂时没有提供倒计时数据，这里保留你的 Mock 占位 */}
              {/* <Countdown deadline={quizInfo.deadline} /> */}
            </div>
          )}
        </div>
      </div>

      {isExpired && (
        <div
          style={{
            margin: '12px 14px',
            background: 'rgba(245,166,35,0.08)',
            border: '1px solid rgba(245,166,35,0.3)',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 13,
            color: '#2d2d42',
          }}
        >
          ⚠
          测验已过期。已提交的题目可查看批改结果，未作答的题目仅可查看题目内容。
        </div>
      )}

      {/* 题目列表 */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {questions.map((q) => (
          <div
            key={q.id}
            style={{
              opacity: isExpired && q.status === 'blank' ? 0.6 : 1,
              background: '#ffffff',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid #e2ddd6',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/quiz/${quizId}/question/${q.id}`)}
          >
            {/* 题号圆圈 */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'DM Mono, monospace',
                flexShrink: 0,
                background:
                  q.status === 'correct'
                    ? '#e8faf3'
                    : q.status === 'wrong'
                      ? '#fef0f0'
                      : q.status === 'pending'
                        ? '#fef8ec'
                        : '#f0ede8',
                color:
                  q.status === 'correct'
                    ? '#2ec98e'
                    : q.status === 'wrong'
                      ? '#e34c4c'
                      : q.status === 'pending'
                        ? '#f5a623'
                        : '#2d2d42',
              }}
            >
              {q.index}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                  color: '#1c1c2e',
                }}
              >
                {q.preview}
              </div>
              {isExpired && q.status === 'blank' ? (
                <span
                  style={{ fontSize: 11.5, fontWeight: 600, color: '#8a8aa0' }}
                >
                  — 未作答（仅查看）
                </span>
              ) : (
                <QStatusLabel status={q.status} />
              )}
            </div>
            <div style={{ color: '#e2ddd6', fontSize: 16 }}>›</div>
          </div>
        ))}
      </div>
    </>
  );
}
