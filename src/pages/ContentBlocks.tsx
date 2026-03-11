// 建议安装: npm install react-markdown remark-math rehype-katex
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Block {
  type: 'text' | 'image';
  value?: string;
  url?: string;
}

export default function ContentBlocks({ blocks }: { blocks: Block[] }) {
  if (!blocks || blocks.length === 0) return <span>暂无内容</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {blocks.map((block, index) => {
        if (block.type === 'image' && block.url) {
          // 渲染图片
          return (
            <img
              key={index}
              src={block.url}
              alt={`图片内容 ${index + 1}`}
              style={{
                maxWidth: '100%',
                borderRadius: '8px',
                border: '1px solid #eee',
                marginTop: '8px',
              }}
            />
          );
        }

        if (block.type === 'text' && block.value) {
          // 渲染 Markdown 和公式
          return (
            <div key={index} className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {block.value}
              </ReactMarkdown>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
