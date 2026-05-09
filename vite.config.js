import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 寺庙数据单独拆分为异步 chunk
          if (id.includes('temples-data')) {
            return 'temple-data'
          }
          // Vue 核心框架
          if (id.includes('node_modules/vue/') || id.includes('node_modules/vue-router/') || id.includes('node_modules/pinia/')) {
            return 'vue-vendor'
          }
        },
      },
    },
  },
})
