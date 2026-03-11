import { useState, useEffect } from 'react';

export interface QuizType {
  id: string;
  name: string;
  status: '进行中' | '已完成' | '已过期';
  totalQuestions: number;
  answeredCount: number;
  correctCount?: number;
  score?: number;
  deadline: string;
  submittedAt?: string;
  classInfo: string;
}

export function Countdown({ deadline }: { deadline: string }) {
  const calc = () =>
    Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
  const [secs, setSecs] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (secs <= 0) return <span style={{ color: '#8a8aa0' }}>已截止</span>;

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

interface QuizCardProps {
  quiz: QuizType;
  onClick: () => void;
}

export default function QuizCard({ quiz, onClick }: QuizCardProps) {
  // 进度条百分比
  const pct =
    quiz.totalQuestions > 0
      ? (quiz.answeredCount / quiz.totalQuestions) * 100
      : 0;

  // 进度条颜色
  const barColor =
    quiz.status === '进行中'
      ? '#52c41a'
      : quiz.status === '已完成'
        ? '#4361ee'
        : '#bfbfbf';

  const fmtDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        cursor: 'pointer',
      }}
    >
      {/* 第一行：标题和状态 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#333', flex: 1 }}>
          {quiz.name}
        </div>
        <span
          style={{
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 500,
            color:
              quiz.status === '进行中'
                ? '#1890ff'
                : quiz.status === '已完成'
                  ? '#52c41a'
                  : '#f5222d',
            background:
              quiz.status === '进行中'
                ? '#e6f7ff'
                : quiz.status === '已完成'
                  ? '#f6ffed'
                  : '#fff1f0',
          }}
        >
          {quiz.status}
        </span>
      </div>

      {/* 第二行：题目数量和倒计时 */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          marginBottom: 12,
          fontSize: 12,
          color: '#8a8aa0',
        }}
      >
        <span>📚 {quiz.totalQuestions}道题</span>
        {quiz.status === '进行中' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            ⏰
            <span
              style={{
                background: '#fef0f0', // 浅红底色
                color: '#e34c4c', // 深红文字
                padding: '2px 8px', // 左右留白
                borderRadius: '12px', // 胶囊圆角
                fontFamily: 'DM Mono, monospace', // 等宽数字字体，防止倒计时跳动
                fontSize: '12px',
                fontWeight: 1000, // 加粗
              }}
            >
              <Countdown deadline={quiz.deadline} />
            </span>
          </span>
        )}
        {quiz.status === '已完成' && (
          <span>
            🏆 正确 {quiz.correctCount}/{quiz.totalQuestions}
          </span>
        )}
      </div>

      {/* 进度条 */}
      <div
        style={{
          height: 6,
          background: '#f0f0f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* 第三行：底部详情 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          fontSize: 11,
          color: '#8a8aa0',
        }}
      >
        <span>
          {quiz.status === '已完成'
            ? `得分 ${quiz.score} 分`
            : `${quiz.answeredCount}/${quiz.totalQuestions} 已作答`}
        </span>
        <span>
          {quiz.status === '已完成'
            ? `${fmtDate(quiz.submittedAt!)} 提交`
            : `截止 ${fmtDate(quiz.deadline)}`}
        </span>
      </div>
    </div>
  );
}
