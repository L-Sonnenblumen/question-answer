import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import ContentBlocks from './ContentBlocks';
import api from '../api';
import { getStudentId } from '../utils/auth';

export default function QuestionDetail() {
  const { quizId, questionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [answerMd, setAnswerMd] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const loadDetail = useCallback(async () => {
    if (!quizId || !questionId) return;
    try {
      setLoading(true);
      const res = await api.student.questionDetail(
        getStudentId(),
        quizId,
        questionId,
      );
      const rawData = res?.data?.data || res?.data || res;

      if (!rawData) return;

      // 1. 状态判断
      let uiStatus = 'blank';
      if (rawData.is_answered) {
        if (rawData.grading_status === '已批改') {
          uiStatus = rawData.result_status === '正确' ? 'correct' : 'wrong';
        } else {
          uiStatus = 'pending';
        }
      }

      // 2. 组装题目内容
      const questionContent = [];
      if (rawData.question)
        questionContent.push({ type: 'text', value: rawData.question });

      // 3. 组装我的答案（文本 + 图片）
      const myAnswerContent = [];
      if (rawData.my_answer)
        myAnswerContent.push({ type: 'text', value: rawData.my_answer });
      if (Array.isArray(rawData.image_urls)) {
        rawData.image_urls.forEach((url: string) =>
          myAnswerContent.push({ type: 'image', url }),
        );
      }

      // 4. 组装参考答案
      const correctAnswerContent = [];
      if (rawData.reference_answer)
        correctAnswerContent.push({
          type: 'text',
          value: rawData.reference_answer,
        });

      // 5. 格式化典型错误
      const formattedTypicalError = Array.isArray(rawData.typical_errors)
        ? rawData.typical_errors
            .map(
              (err: any) =>
                `【${err.pattern_name}】${err.pattern_desc}\n建议：${err.suggestion_text}`,
            )
            .join('\n\n')
        : '';

      // 6. 格式化时间字符串（如：用时 2分0秒 · 03/11 03:48）
      let timeStr = '';
      if (rawData.submitted_at) {
        const d = new Date(rawData.submitted_at);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const sec = rawData.duration_sec || 0;
        timeStr = `用时 ${Math.floor(sec / 60)}分${sec % 60}秒 · ${mm}/${dd} ${hh}:${min}`;
      }

      setData({
        status: uiStatus,
        content: questionContent,
        myAnswer: myAnswerContent,
        correctAnswer: correctAnswerContent,
        feedback:
          rawData.teacher_feedback || rawData.ai_feedback || '暂无详细评语',
        score: rawData.final_score ?? rawData.ai_score ?? 0,
        typicalError: formattedTypicalError,
        timeStr,
        index: '当前题', // 接口无返回题号，占位
        total: '-',
      });

      // 回显草稿
      if (uiStatus === 'blank' && rawData.my_answer) {
        setAnswerMd(rawData.my_answer);
      }
    } catch (error) {
      console.error('获取题目详情失败:', error);
    } finally {
      setLoading(false);
    }
  }, [quizId, questionId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    // 只有当题目加载出来，且状态是“未作答”时，才启动计时
    if (data && data.status === 'blank') {
      timer = setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);
    }
    // 组件卸载或状态改变时清理定时器，防止内存泄漏
    return () => clearInterval(timer);
  }, [data?.status]);

  // 辅助函数：将秒数转为 MM:SS 格式显示
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const handleSubmit = async () => {
    if (!answerMd.trim() && imageUrls.length === 0) {
      alert('请填写答案或上传图片后再提交');
      return;
    }
    try {
      setSubmitting(true);
      await api.student.answer(
        getStudentId(),
        quizId,
        questionId,
        answerMd,
        imageUrls,
        new Date().toISOString(),
        durationSec,
      );
      await loadDetail();
    } catch (error) {
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: string) =>
    s === 'correct'
      ? '#2ec98e'
      : s === 'wrong'
        ? '#e34c4c'
        : s === 'pending'
          ? '#f5a623'
          : '#1c1c2e';
  const statusLabel = (s: string) =>
    s === 'correct' || s === 'wrong'
      ? '已批改'
      : s === 'pending'
        ? '待批改'
        : '作答';

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8a8aa0' }}>
        加载中...
      </div>
    );
  if (!data)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8a8aa0' }}>
        未能加载题目数据
      </div>
    );

  return (
    <>
      <Header
        title="题目详情"
        showBack
        onBack={() => navigate(`/quiz/${quizId}`)}
      />

      <div style={{ paddingBottom: 100 }}>
        {/* --- 1. 题目卡片 --- */}
        <div
          style={{
            background: '#ffffff',
            margin: '12px 14px',
            borderRadius: 16,
            padding: 16,
            border: '1px solid #e2ddd6',
            color: '#1c1c2e',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                background: statusColor(data.status),
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 6,
                fontFamily: 'DM Mono,monospace',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {data.index}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: '#8a8aa0',
                fontWeight: 600,
              }}
            >
              {statusLabel(data.status)}
            </span>
          </div>
          <ContentBlocks blocks={data.content} />
        </div>

        {/* --- 2. 未作答状态（带数学符号按钮） --- */}
        {data.status === 'blank' && (
          <div style={{ padding: '0 14px' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 16,
                border: '1px solid #e2ddd6',
              }}
            >
              {/* 🚀 修改：带有计时器的标题栏 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#8a8aa0',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  我的作答
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#4361ee',
                    fontWeight: 600,
                    fontFamily: 'DM Mono, monospace',
                    background: '#eef2ff',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  ⏱ {formatDuration(durationSec)}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginBottom: 10,
                  flexWrap: 'wrap',
                }}
              >
                {['𝐁', 'I', '≡', '√', '∫', '≤', '≥', '±', '∞', 'π'].map(
                  (sym) => (
                    <button
                      key={sym}
                      onClick={() => setAnswerMd((prev) => prev + sym)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1.5px solid #e2ddd6',
                        background: '#f0ede8',
                        color: '#2d2d42',
                      }}
                    >
                      {sym}
                    </button>
                  ),
                )}
              </div>
              <textarea
                value={answerMd}
                onChange={(e) => setAnswerMd(e.target.value)}
                placeholder="在此输入解答，支持数学符号和 Markdown 格式..."
                style={{
                  color: '#1c1c2e',
                  width: '100%',
                  minHeight: 100,
                  border: '1px solid #e2ddd6',
                  borderRadius: 8,
                  padding: 10,
                  outline: 'none',
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  border: '1.5px dashed #e2ddd6',
                  borderRadius: 10,
                  padding: 14,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f0ede8',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>📷</div>
                <div style={{ fontSize: 12.5, color: '#8a8aa0' }}>
                  拍照上传答案纸（支持 jpg/png）
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. 待批改状态 --- */}
        {data.status === 'pending' && (
          <div style={{ padding: '0 14px' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 18,
                border: '1px solid #e2ddd6',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#8a8aa0',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                我的答案
              </div>
              <div
                style={{
                  background: '#faf9f6',
                  borderRadius: 10,
                  padding: '12px 14px',
                  border: '1px solid #e2ddd6',
                  fontSize: 13.5,
                  lineHeight: 1.8,
                  color: '#2d2d42',
                }}
              >
                <ContentBlocks blocks={data.myAnswer} />
              </div>
              <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 6,
                    color: '#1c1c2e',
                  }}
                >
                  AI 批改中…
                </div>
                <div style={{ fontSize: 13, color: '#8a8aa0' }}>
                  通常在30秒内完成，完成后自动更新
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. 已批改状态 (还原了你的各种高亮和框框) --- */}
        {(data.status === 'correct' || data.status === 'wrong') && (
          <div style={{ padding: '0 14px' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 18,
                border: '1px solid #e2ddd6',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                    background:
                      data.status === 'correct' ? '#e8faf3' : '#fef0f0',
                  }}
                >
                  {data.status === 'correct' ? '✅' : '❌'}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: data.status === 'correct' ? '#2ec98e' : '#e34c4c',
                    }}
                  >
                    {data.status === 'correct' ? '回答正确！' : '回答错误'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#8a8aa0',
                      fontFamily: 'DM Mono,monospace',
                    }}
                  >
                    {data.timeStr}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#8a8aa0',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                我的答案
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.8,
                  color: '#2d2d42',
                  background: '#faf9f6',
                  borderRadius: 10,
                  padding: '12px 14px',
                  border: '1px solid #e2ddd6',
                }}
              >
                <ContentBlocks blocks={data.myAnswer} />
              </div>

              {/* AI 批改反馈框 */}
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: '#2d2d42',
                  background: data.status === 'correct' ? '#e8faf3' : '#fef0f0',
                  border:
                    data.status === 'correct'
                      ? '1px solid rgba(46,201,142,0.25)'
                      : '1px solid rgba(227,76,76,0.2)',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    color: data.status === 'correct' ? '#2ec98e' : '#e34c4c',
                  }}
                >
                  🤖 AI 批改反馈
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{data.feedback}</div>
                <div
                  style={{ marginTop: 8, fontWeight: 700, color: '#1c1c2e' }}
                >
                  得分：{data.score}
                </div>
              </div>

              {/* 回答错误时显示的：正确答案 & 典型错误 */}
              {data.status === 'wrong' && (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#8a8aa0',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    正确答案
                  </div>
                  <div
                    style={{
                      background: '#e8faf3',
                      border: '1px solid rgba(46,201,142,0.25)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      color: '#2d2d42',
                    }}
                  >
                    <ContentBlocks blocks={data.correctAnswer} />
                  </div>

                  {data.typicalError && (
                    <div
                      style={{
                        background: '#fef8ec',
                        border: '1px solid rgba(245,166,35,0.3)',
                        borderRadius: 10,
                        padding: '12px 14px',
                        marginTop: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#f5a623',
                          marginBottom: 4,
                        }}
                      >
                        ⚠ 典型错误提示
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: '#2d2d42',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {data.typicalError}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- 底部悬浮按钮 --- */}
      <div
        style={{
          position: 'fixed',
          bottom: 'env(safe-area-inset-bottom, 0px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          padding: '10px 14px',
          background: '#ffffff',
          borderTop: '1px solid #e2ddd6',
          zIndex: 40,
        }}
      >
        {data.status === 'blank' ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              background: submitting ? '#a0b1f7' : '#4361ee',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '提交中...' : '提交答案'}
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '100%',
              padding: '14px',
              background: '#4361ee',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            ← 返回题列表
          </button>
        )}
      </div>
    </>
  );
}
