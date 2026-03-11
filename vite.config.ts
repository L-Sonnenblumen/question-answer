import react from '@vitejs/plugin-react';
import path from 'path'; // ⬇️ 修改点 1：引入 path 模块
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ⬇️ 修改点 2：配置 Vite 的路径解析别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ⬇️ 修改点 3：配置 Less，开启 javascriptEnabled
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  // 服务器配置
  server: {
    port: 3001,
    open: true,
    // 🟢 新增：代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8089', // 这里改为你后端实际运行的地址和端口
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['antd', '@ant-design/icons'],
        },
      },
    },
  },
});
