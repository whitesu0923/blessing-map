<template>
  <div class="loading-page">
    <!-- 金色赛博祥云背景层 -->
    <div class="cyber-clouds-container">
      <svg 
        v-for="(cloud, index) in clouds" 
        :key="index"
        class="cyber-cloud"
        :style="cloud.style"
        viewBox="0 0 1024 1024"
      >
        <!-- 镂空线框祥云：fill="none" 内部镂空，stroke 描边 -->
        <path 
          fill="none" 
          stroke="rgba(212, 175, 55, 0.8)" 
          stroke-width="2"
          d="M715.69 725.33c13.17-2.7 26.48-4.64 39.88-5.8h47.76c14.59.28 29.18 1.54 43.66 3.67a119.75 119.75 0 0 0-50.43-35.21 249.8 249.8 0 0 0-22.95-6.06 290.47 290.47 0 0 0-104.11 1.42c-33 7.25-65.34 17.07-96.8 29.41-41.24 15.93-87.07 15.36-127.89-1.68a76.94 76.94 0 0 1-50.86-56.2 9.39 9.39 0 0 0-6.48-3.96 141.57 141.57 0 0 1-49.72-12.65 94.44 94.44 0 0 1-54.67-78.2 110.65 110.65 0 0 1 49.89-111.13c7.85-5.04 16.38-8.93 25.34-11.55a14.28 14.28 0 0 0 10.16-10.01 92.07 92.07 0 0 1 38.45-52.96 138.52 138.52 0 0 1 87.75-21.14 133.55 133.55 0 0 1 48.73 13.26 101.55 101.55 0 0 1 50.43 58.31 10.35 10.35 0 0 0 7.91 6.88 88.46 88.46 0 0 1 66.62 79.47 95.43 95.43 0 0 1-27.88 82.4 81.58 81.58 0 0 1-83.68 18.72 14.39 14.39 0 0 0-9.73 0 86.47 86.47 0 0 1-93.95-4.35 80.67 80.67 0 0 1-31.97-80.59 83.57 83.57 0 0 1 50.43-62.54 71.96 71.96 0 0 1 43.52-3.39c6.68 1.68 12.37 5.97 15.79 11.97 3.41 6 4.21 13.11 2.25 19.74a20.14 20.14 0 0 1-19.17 12.23 17.07 17.07 0 0 1-18.72-10.13c-4.95-10.01-7.05-10.98-17.46-7.05a56.43 56.43 0 0 0-26.63 80.58 60.59 60.59 0 0 0 51.26 33.82 61.84 61.84 0 0 0 46.08-17.92l3.92-3.64a59.16 59.16 0 0 0 56.35 5.77 60.02 60.02 0 0 0 35.78-44.23 69.35 69.35 0 0 0-10.41-63.12 58.88 58.88 0 0 0-56.78-23.1h-4.66a210.94 210.94 0 0 0-7.17-35.21 69.23 69.23 0 0 0-52.68-43.1 106.58 106.58 0 0 0-37.26-.91 103.28 103.28 0 0 0-43.1 12.09 90.48 90.48 0 0 0-24.97 18.26 9.22 9.22 0 0 0-1.96 9.22c1.42 4.2 5.46 6.94 9.81 6.77a14.56 14.56 0 0 0 9.05-4.18 66.87 66.87 0 0 1 27.31-15.93 80.78 80.78 0 0 1 33.22-1 55.18 55.18 0 0 1 27.16 9.05 52.4 52.4 0 0 1 17.07 23.8 43.2 43.2 0 0 1 2.67 17.3 43.18 43.18 0 0 1-8.02 22.15 41.24 41.24 0 0 1-19.2 14.56 38.14 38.14 0 0 1-24.41 1.14 36.64 36.64 0 0 1-20.7-13.08 33.22 33.22 0 0 1-6.29-24.07c1-8.02-4.18-15.36-11.97-17.06a14.56 14.56 0 0 0-16.39 6.28 43.52 43.52 0 0 0-4.35 31.4 48.07 48.07 0 0 0 16.98 29.19 58.03 58.03 0 0 0 32.94 12.09 56.32 56.32 0 0 0 34.7-7.34z"
        />
      </svg>
    </div>

    <!-- 旋转法阵 -->
    <div class="loading-bagua">
      <div class="bagua-ring ring-outer"></div>
      <div class="bagua-ring ring-inner"></div>
      <div class="bagua-dot"></div>
    </div>

    <p class="loading-text">正在连接诸天神佛...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 随机生成 3-6 朵祥云
const generateClouds = () => {
  const cloudCount = Math.floor(Math.random() * 4) + 3 // 3 到 6
  return Array.from({ length: cloudCount }).map((_, index) => {
    const size = Math.random() * 100 + 150 // 150-250px
    const duration = Math.random() * 20 + 20 // 20-40s
    const delay = -(Math.random() * 40) // 负数延迟，一进页面云就在不同位置
    
    return {
      style: {
        // 只保留 top 和 size，left 由动画控制
        top: `${Math.random() * 80 + 10}%`, // 10% 到 90%
        width: `${size}px`,
        height: `${size}px`,
        // 通过 CSS 变量传递动画时长和延迟
        '--float-duration': `${duration}s`,
        '--float-delay': `${delay}s`
      }
    }
  })
}

const clouds = ref(generateClouds())

onMounted(() => {
  const timer = setTimeout(() => {
    router.replace('/home')
  }, 5000)
})
</script>

<style scoped>
.loading-page {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  gap: 24px;
  overflow: hidden;
}

/* 祥云容器 */
.cyber-clouds-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
}

/* 祥云从左到右漂浮动画 */
@keyframes cyber-cloud-float {
  0% { 
    transform: translateX(-30vw); 
  }
  100% { 
    transform: translateX(120vw); 
  }
}

/* 祥云基础样式 - 镂空线框 */
.cyber-cloud {
  position: absolute;
  left: 0; /* 重置 left，由 transform 控制位置 */
  opacity: 0.5 !important;
  /* 暗金双层发光特效 */
  filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.8)) 
          drop-shadow(0 0 40px rgba(212, 175, 55, 0.4));
  pointer-events: none;
  /* 强制应用从左到右的漂浮动画 */
  animation: cyber-cloud-float var(--float-duration, 30s) linear infinite !important;
  animation-delay: var(--float-delay, 0s) !important;
}

/* 八卦阵 */
.loading-bagua {
  position: relative;
  width: 100px;
  height: 100px;
  z-index: 2;
}

.bagua-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-radius: 50%;
}

.ring-outer {
  border-top-color: #FFD700;
  border-right-color: rgba(255, 215, 0, 0.3);
  animation: baguaSpin 2s linear infinite;
}

.ring-inner {
  inset: 15px;
  border-bottom-color: #E63927;
  border-left-color: rgba(230, 57, 39, 0.3);
  animation: baguaSpin 1.5s linear infinite reverse;
}

.bagua-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: #FFD700;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  animation: baguaPulse 1.5s ease-in-out infinite;
}

@keyframes baguaSpin {
  to { transform: rotate(360deg); }
}

@keyframes baguaPulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

/* 文字 */
.loading-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  color: #FFD700;
  letter-spacing: 6px;
  z-index: 2;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}
</style>
