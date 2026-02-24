import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Edu-Pay-Manager/' : '/', // 로컬: /, 배포: GitHub Pages 경로
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
