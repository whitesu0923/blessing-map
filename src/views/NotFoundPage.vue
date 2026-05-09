<template>
  <div class="not-found-page">
    <div class="void-bg"></div>
    <div class="content">
      <div class="lantern">🏮</div>
      <h1 class="title">404</h1>
      <p class="subtitle">施主走偏了</p>
      <p class="desc">前方是一片虚无，请返回正途</p>
      <div class="divider"></div>
      <button class="back-btn" @click="goHome">
        🏮 返回首页
      </button>
    </div>
    <div class="floating-particles">
      <span v-for="(p, i) in particles" :key="i" class="particle" :style="p"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

// 粒子随机属性（onMounted 中预生成，避免渲染时 Math.random 跳帧）
const particles = ref([])
onMounted(() => {
  particles.value = Array.from({ length: 6 }, (_, i) => ({
    left: `${10 + i * 15}%`,
    animationDelay: `${i * 0.8}s`,
    animationDuration: `${3 + Math.random() * 2}s`,
  }))
})
</script>

<style scoped>
.not-found-page {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.void-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(230, 57, 39, 0.05) 0%, transparent 70%);
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fadeIn 1s ease-out;
}

.lantern {
  font-size: 64px;
  animation: lanternSwing 3s ease-in-out infinite;
  margin-bottom: 24px;
}

.title {
  font-family: var(--font-pixel);
  font-size: 72px;
  color: #E63927;
  letter-spacing: 8px;
  margin: 0;
  text-shadow: 0 0 20px rgba(230, 57, 39, 0.4);
}

.subtitle {
  font-family: var(--font-serif);
  font-size: 28px;
  color: #FFF;
  margin: 16px 0 8px;
  letter-spacing: 6px;
}

.desc {
  font-family: var(--font-sans);
  font-size: 14px;
  color: #666;
  margin: 0 0 32px;
  letter-spacing: 2px;
}

.divider {
  width: 60px;
  height: 2px;
  background: #E63927;
  margin: 0 auto 32px;
}

.back-btn {
  background: transparent;
  border: 2px solid #FFF;
  color: #FFF;
  padding: 14px 40px;
  font-family: var(--font-sans);
  font-size: 16px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #FFF;
  color: #000;
}

/* 浮动粒子 */
.floating-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -20px;
  width: 4px;
  height: 4px;
  background: rgba(255, 215, 0, 0.4);
  animation: floatUp 4s ease-in infinite;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh) scale(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes lanternSwing {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
</style>
