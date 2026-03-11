import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  leftNode?: ReactNode; // 自定义左侧插槽
  rightNode?: ReactNode; // 自定义右侧插槽
  showBack?: boolean; // 是否显示默认的返回按钮
  onBack?: () => void; // 自定义返回逻辑（如果不传，默认返回上一页）
}

export default function Header({
  title,
  leftNode,
  rightNode,
  showBack,
  onBack,
}: HeaderProps) {
  const navigate = useNavigate();

  // 处理返回逻辑
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1); // React Router 的原生方法，后退一步
    }
  };

  // 决定左侧显示什么
  const renderLeft = () => {
    if (leftNode) return leftNode;
    if (showBack) {
      return (
        <button
          onClick={handleBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 18,
            color: 'var(--ink2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          // 这里可以加一个简单的按压反馈
          onMouseDown={(e) =>
            (e.currentTarget.style.background = 'var(--border)')
          }
          onMouseUp={(e) => (e.currentTarget.style.background = 'transparent')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'transparent')
          }
        >
          ←
        </button>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        height: 'var(--header-h)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        position: 'sticky', // 吸顶效果
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* 左侧区域（固定宽度，保证标题居中） */}
      <div
        style={{
          width: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderLeft()}
      </div>

      {/* 中间标题区域（自适应撑开） */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--ink)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis', // 标题过长时显示省略号
        }}
      >
        {title}
      </div>

      {/* 右侧区域（固定宽度，保证标题居中） */}
      <div
        style={{
          width: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {rightNode}
      </div>
    </div>
  );
}
