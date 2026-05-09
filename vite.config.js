import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 把这里的 'cyber-zen' 换成您在 GitHub 创建的仓库名
  base: '/blessing-map/', 
  plugins: [vue()],
})