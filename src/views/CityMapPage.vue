<template>
  <div class="city-page">
    <!-- 地图容器 -->
    <div ref="mapRef" class="map-container city-map-container"></div>

    <!-- 加载动画 -->
    <transition name="fade">
      <div v-if="isLoading" class="map-loading">
        <div class="loading-bagua">
          <div class="bagua-ring ring-outer"></div>
          <div class="bagua-ring ring-inner"></div>
          <div class="bagua-dot"></div>
        </div>
        <p class="loading-text">正在连接诸天神佛...</p>
      </div>
    </transition>

    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">
        <span>←</span>
        <span>返回全国</span>
      </button>
      <div class="city-title">
        <span class="city-icon">📍</span>
        <h2>{{ cityName }}</h2>
        <span class="temple-count">共 <span class="cyber-number">{{ cityTemples.length }}</span> 座寺庙</span>
      </div>
      <!-- 使用公共分类筛选组件 -->
      <CategoryFilter
        :activeCategory="store.selectedCategory"
        @change="handleCategoryChange"
      />
    </div>

    <!-- 寺庙列表（左侧浮动） -->
    <div class="temple-list" :class="{ collapsed: isListCollapsed }">
      <button class="list-toggle" @click="isListCollapsed = !isListCollapsed">
        {{ isListCollapsed ? '寺庙列表 ▶' : '◀ 收起' }}
      </button>
      <div class="list-content">
        <div
          v-for="temple in filteredTemples"
          :key="temple.id"
          class="temple-card"
          :class="{ active: activeTempleId === temple.id }"
          @click="focusTemple(temple)"
          @mouseenter="preloadImage(temple.image)"
        >
          <div class="card-header">
            <h3>{{ temple.name }}</h3>
            <!-- 简化分类标签：只显示文字，带赛博颜色边框 -->
            <span 
              class="card-category-tag"
              :style="{ 
                borderColor: getCategoryColor(temple.category), 
                color: getCategoryColor(temple.category),
                boxShadow: `0 0 8px ${getCategoryColor(temple.category)}40`
              }"
            >
              {{ temple.category }}
            </span>
          </div>
          <div class="card-tags" v-if="getFunTags(temple).length">
            <span
              v-for="tag in getFunTags(temple)"
              :key="tag"
              class="mini-tag"
            >#{{ tag }}</span>
          </div>
          <p class="card-brief">{{ temple.brief }}</p>
          <div class="card-footer">
            <span class="card-action">点击查看详情 →</span>
          </div>
        </div>
        <div v-if="filteredTemples.length === 0" class="empty-state">
          <span class="empty-icon">🙏</span>
          <p>暂无符合条件的寺庙</p>
          <button class="reset-btn" @click="clearFilters">清除筛选</button>
        </div>
      </div>
    </div>

    <!-- 右侧抽屉详情 -->
    <transition name="drawer">
      <div v-if="drawerTemple" class="drawer-overlay" @click="closeDrawer"></div>
    </transition>
    <transition name="drawer-slide">
      <div v-if="drawerTemple" class="drawer">
        <button class="drawer-close" @click="closeDrawer">✕</button>
        <div class="drawer-content">
          <!-- 寺庙图片 -->
          <div class="drawer-image">
            <img v-if="drawerTemple.image" :src="drawerTemple.image" :alt="drawerTemple.name" referrerpolicy="no-referrer" @error="handleImageError" />
            <div v-else class="drawer-image-placeholder"><span>禅</span></div>
            <div class="drawer-image-overlay">
              <h2>{{ drawerTemple.name }}</h2>
              <p>{{ drawerTemple.city }} · {{ drawerTemple.province }}</p>
            </div>
          </div>

          <!-- 灵验标签 -->
          <div class="drawer-tags">
            <span
              v-for="tag in drawerTemple.tags"
              :key="tag"
              class="drawer-tag"
              :style="{ borderColor: getTagColor(tag), color: getTagColor(tag) }"
            >
              {{ getTagIcon(tag) }} {{ tag }}
            </span>
          </div>

          <!-- 灵验领域 -->
          <div v-if="drawerTemple.highlights && Object.keys(drawerTemple.highlights).length > 0" class="drawer-highlights">
            <h3>🎯 最灵验的领域</h3>
            <div
              v-for="(info, key) in drawerTemple.highlights"
              :key="key"
              class="highlight-item"
              :class="info.level"
            >
              <div class="highlight-header">
                <span class="highlight-name">{{ key }}</span>
                <span class="highlight-badge" :class="info.level">
                  {{ getLevelIcon(info.level) }} {{ info.level }}
                </span>
              </div>
              <p class="highlight-desc">{{ info.desc }}</p>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="drawer-info">
            <div class="info-item">
              <span class="info-icon">🕐</span>
              <div>
                <span class="info-label">开放时间</span>
                <span class="info-value">{{ drawerTemple.openTime || '暂无信息' }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">🎫</span>
              <div>
                <span class="info-label">门票</span>
                <span class="info-value">{{ drawerTemple.ticket || '请以实际为准' }}</span>
              </div>
            </div>
          </div>

          <!-- 小贴士 -->
          <div v-if="drawerTemple.tips" class="drawer-tips">
            <h3>💡 温馨提示</h3>
            <p>{{ drawerTemple.tips }}</p>
          </div>

          <!-- 操作按钮 -->
          <div class="drawer-actions">
            <button class="action-btn primary" @click="goToDetail(drawerTemple)">
              🏛️ 查看完整详情
            </button>
            <button class="action-btn secondary" @click="goBack">
              🗺️ 返回全国地图
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlessingStore } from '../store/blessing.js'
import { temples, levelConfig, loadTemples } from '../data/temples.js'
import { useTempleMap } from '../composables/useTempleMap.js'
import { handleImageError } from '../utils/imageErrorHandler.js'
import CategoryFilter from '../components/CategoryFilter.vue'

const route = useRoute()
const router = useRouter()
const store = useBlessingStore()
const mapRef = ref(null)
const isListCollapsed = ref(window.innerWidth <= 480)
const isLoading = ref(true)
const drawerTemple = ref(null)
const activeTempleId = ref(null)

// InfoWindow 小卡片 "查看详情" 按钮 → 打开右侧大抽屉
// 必须在 useTempleMap 之前定义（onDetailClick 回调引用）
const openDrawer = (templeId) => {
  const temple = temples.find(t => t.id === templeId)
  if (temple) {
    drawerTemple.value = temple
  }
}

// 图片预加载缓存
const preloadedImages = new Set()

// 预加载图片函数（用于鼠标悬停时提前加载）
const preloadImage = (url) => {
  if (!url || preloadedImages.has(url)) return
  const img = new Image()
  img.src = url
  preloadedImages.add(url)
}

// 先定义 computed，再传给 useTempleMap
const cityName = computed(() => decodeURIComponent(route.params.city))

const cityTemples = computed(() => {
  return temples.filter(t => t.city === cityName.value)
})

const filteredTemples = computed(() => {
  return cityTemples.value.filter(t => {
    const catMatch = !store.selectedCategory || t.category === store.selectedCategory
    const tagMatch = !store.selectedTag || t.tags.includes(store.selectedTag)
    return catMatch && tagMatch
  })
})

// 提取公共的精准平移函数：将寺庙平移到可视区域中心
// 计算顶部栏高度 + 330px 弹窗总高度 + 50px 安全间距
const focusAndCenterTemple = (temple) => {
  activeTempleId.value = temple.id

  // 关闭右侧大抽屉（保证不遮挡视野）
  drawerTemple.value = null

  const map = getMap()
  if (!map) return

  // 设置缩放级别（不带动画）
  map.setZoom(15, false)

  // 先平移到目标经纬度
  map.panTo([temple.lng, temple.lat], false)

  // 等待一帧后计算视觉偏移
  requestAnimationFrame(() => {
    const container = map.getContainer()
    if (!container) return

    const containerRect = container.getBoundingClientRect()

    // 测量左侧列表和顶部栏的实际遮挡尺寸
    const listEl = container.closest('.city-page')?.querySelector('.temple-list')
    const topBarEl = container.closest('.city-page')?.querySelector('.top-bar')

    const listWidth = (listEl && !listEl.classList.contains('collapsed'))
      ? listEl.getBoundingClientRect().width + 15
      : 0
    const topBarHeight = topBarEl ? topBarEl.getBoundingClientRect().height : 80

    // 纯显示区域（排除左侧列表和顶部栏）
    const visibleWidth = containerRect.width - listWidth
    const visibleHeight = containerRect.height - topBarHeight

    // 视觉中心 X：纯显示区域水平中点
    const visibleCenterX = listWidth + visibleWidth / 2

    // 视觉中心 Y：用固定像素精确计算，不再用百分比
    // InfoWindow 从标记点向上延伸：offset(48px) + 弹窗高度(~280px) = 328px
    // 标记点 Y = 顶部栏底部 + InfoWindow总高度 + 安全间距
    // 这样 InfoWindow 顶部刚好在顶部栏下方，图片区完整可见
    const INFO_WINDOW_TOTAL_HEIGHT = 360 // offset(48) + 图片(150) + 内容(132) + 额外buffer(30)
    const SAFE_MARGIN = 20
    const visibleCenterY = topBarHeight + INFO_WINDOW_TOTAL_HEIGHT + SAFE_MARGIN

    // 获取目标寺庙当前的屏幕像素坐标
    const targetPixel = map.lngLatToContainer([temple.lng, temple.lat])

    // 计算偏移量：标记点当前位置 → 目标视觉中心
    const deltaX = targetPixel.getX() - visibleCenterX
    const deltaY = targetPixel.getY() - visibleCenterY

    // 平滑移动到视觉中心
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      map.panBy(-deltaX, -deltaY, true, 500)
    }

    // 平移完成后再打开 InfoWindow 小卡片（autoPan=false，不二次偏移）
    setTimeout(() => {
      openInfoWindow(temple, null, false)
    }, 550)
  })
}

const {
  initMap,
  renderMarkers,
  openInfoWindow,
  flyTo,
  destroy: destroyMap,
  getMap,
} = useTempleMap({
  mapRef,
  temples: computed(() => filteredTemples.value),
  mapConfig: { zoom: 5, center: [104.19, 35.86] },
  onDetailClick: openDrawer,
  onMarkerClick: focusAndCenterTemple, // Marker 点击时复用相同的平移逻辑
})

// 防抖包装：300ms 内只执行最后一次 renderMarkers
let _debounceTimer = null
const debouncedRender = (templeList) => {
  clearTimeout(_debounceTimer)
  _debounceTimer = setTimeout(() => {
    renderMarkers(templeList)
  }, 300)
}

const getTagColor = (tag) => store.tagConfig[tag]?.color || 'rgba(255,255,255,0.25)'

const getFunTags = (temple) => {
  return (temple.tags || []).filter(tag => tag !== temple.category)
}

const getTagIcon = (tag) => store.tagConfig[tag]?.icon || '🏷'

const getCategoryIcon = (category) => store.categoryConfig[category]?.icon || '🏮'

const getCategoryColor = (category) => {
  const colorMap = {
    '综合祈福': '#d4af37',
    '求财': '#d4af37',
    '求平安': '#FF5E6D',
    '求健康': '#4ade80',
    '求姻缘': '#F48FB1',
    '求学': '#4FC3F7'
  }
  return colorMap[category] || '#FFD700'
}

const getLevelIcon = (level) => {
  return levelConfig[level]?.icon || '✨'
}

const toggleCategory = (key) => {
  store.selectedCategory = store.selectedCategory === key ? '' : key
}

const handleCategoryChange = (key) => {
  store.selectedCategory = store.selectedCategory === key ? '' : key
}

const clearFilters = () => {
  store.selectedCategory = ''
  store.selectedTag = ''
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// 点击列表项 → 复用 focusAndCenterTemple 实现相同的平移效果
const focusTemple = (temple) => {
  focusAndCenterTemple(temple)
}

const closeDrawer = () => {
  drawerTemple.value = null
}

const goToDetail = (temple) => {
  router.push(`/temple/${temple.id}`)
}

onMounted(async () => {
  try {
    await loadTemples()
    
    // 检查城市是否存在
    if (cityTemples.value.length === 0) {
      console.warn(`[CityMapPage] 未找到城市: ${cityName.value}`)
      // 3秒后返回首页
      setTimeout(() => {
        router.push('/')
      }, 3000)
      return
    }
    
    // 初始化地图并等待完成
    const mapInstance = initMap()
    if (!mapInstance) {
      console.warn('[CityMapPage] 地图初始化失败，可能高德 SDK 未加载')
      isLoading.value = false
      return
    }

    // 延迟执行地图操作，确保高德地图完全初始化
    setTimeout(() => {
      const cityTemplesList = cityTemples.value
      if (cityTemplesList.length > 0) {
        let sumLng = 0, sumLat = 0
        cityTemplesList.forEach(t => { sumLng += t.lng; sumLat += t.lat })
        const centerLng = sumLng / cityTemplesList.length
        const centerLat = sumLat / cityTemplesList.length
        flyTo([centerLng, centerLat], 12, 800)
      }
      renderMarkers(filteredTemples.value)
    }, 500)
  } catch (e) {
    console.error('[CityMapPage] 加载失败:', e)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  clearTimeout(_debounceTimer)
  destroyMap()
})

// 监听标签筛选变化
watch(() => store.selectedCategory, () => {
  debouncedRender(filteredTemples.value)
  if (filteredTemples.value.length > 0) {
    let sumLng = 0, sumLat = 0
    filteredTemples.value.forEach(t => { sumLng += t.lng; sumLat += t.lat })
    const centerLng = sumLng / filteredTemples.value.length
    const centerLat = sumLat / filteredTemples.value.length
    flyTo([centerLng, centerLat], 12, 600)
  }
})
</script>

<style scoped>
.city-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.map-container {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-color: #050505 !important; /* 强制黑色背景，防止地图瓦片加载前白屏闪烁 */
}

/* ── 顶部导航 ── */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  padding: 16px 24px 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  padding: 8px 16px;
  color: #FFFFFF;
  font-size: 13px;
  margin-bottom: 12px;
  transition: all 0.3s;
}
.back-btn:hover {
  background: #FFFFFF;
  color: #000000;
  border-color: #FFFFFF;
}

.city-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.city-icon {
  font-size: 24px;
}

.city-title h2 {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 2px;
}

.temple-count {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: #FFFFFF;
  background: transparent;
  padding: 2px 10px;
  border: 2px solid #FFFFFF;
  border-radius: 0;
}

/* ── 顶部筛选标签（降噪：未选中弱化，选中高亮） ── */
.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0;
  color: #888;
  font-size: 13px;
  transition: all 0.3s;
}
.filter-chip:hover {
  color: #ccc;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}
.filter-chip.active {
  background: var(--c-gold);
  border-color: var(--c-gold);
  color: #000;
}

/* ── 寺庙列表（悬浮毛玻璃质感） ── */
.temple-list {
  position: absolute;
  top: 220px;
  left: 0;
  bottom: 80px;
  width: 340px;
  margin: 0 0 0 15px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  transition: all 0.4s var(--ease-out);
  /* 毛玻璃效果 */
  background: rgba(18, 18, 20, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(248, 176, 10, 0.15);
}
.temple-list.collapsed {
  width: auto;
}

.list-toggle {
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  color: #ccc;
  padding: 8px 14px;
  font-size: 12px;
  white-space: nowrap;
  margin-bottom: 12px;
  transition: all 0.3s;
}
.list-toggle:hover {
  border-color: rgba(250, 218, 96, 0.5);
  color: #fff;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-right: 4px;
}

.temple-list.collapsed .list-content {
  display: none;
}

/* ── 卡片：毛玻璃 + 悬浮质感 ── */
.temple-card {
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}
.temple-card:hover {
  border-color: rgba(250, 218, 96, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
}
.temple-card.active {
  border-color: rgba(250, 218, 96, 0.6);
  background: rgba(250, 218, 96, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.card-header h3 {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.temple-card.active .card-header h3 {
  color: var(--c-gold);
}

.card-category-tag {
  font-size: 11px;
  color: #FFD700;
  border: 1px solid rgba(255, 215, 0, 0.5);
  padding: 1px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.temple-card.active .card-category-tag {
  color: var(--c-gold);
  border-color: rgba(250, 218, 96, 0.5);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.mini-tag {
  font-size: 12px;
  padding: 2px 10px;
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 12px;
  color: #FFE699;
  background: rgba(212, 175, 55, 0.1);
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
  box-shadow: 0 0 5px rgba(212, 175, 55, 0.2) inset;
  backdrop-filter: blur(4px);
}
.temple-card.active .mini-tag {
  color: var(--c-gold);
  border-color: rgba(250, 218, 96, 0.2);
  background: rgba(250, 218, 96, 0.06);
}

.card-brief {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.temple-card.active .card-brief {
  color: #bbb;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.card-action {
  font-size: 12px;
  color: var(--c-red);
  opacity: 0;
  transition: opacity 0.3s;
}
.temple-card:hover .card-action {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}
.reset-btn {
  margin-top: 12px;
  padding: 8px 20px;
  background: transparent;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  color: #FFFFFF;
  font-size: 13px;
  transition: all 0.3s;
}
.reset-btn:hover {
  background: #FFFFFF;
  color: #000000;
  border-color: #FFFFFF;
}

/* ── 抽屉 ── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 90vw;
  background: #000;
  z-index: 2001;
  overflow-y: auto;
  border-left: 3px solid #FFFFFF;
}

.drawer-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 0;
  background: transparent;
  border: 2px solid #FFFFFF;
  color: #FFFFFF;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.drawer-close:hover {
  background: #FFFFFF;
  color: #000000;
  border-color: #FFFFFF;
}

.drawer-content {
  padding-bottom: 30px;
}

.drawer-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}
.drawer-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.drawer-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.drawer-image-placeholder span {
  font-size: 64px;
  font-weight: 300;
  color: rgba(255, 180, 50, 0.15);
  user-select: none;
}
.drawer-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: #000;
}
.drawer-image-overlay h2 {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 4px;
}
.drawer-image-overlay p {
  font-size: 13px;
  color: #999;
}

.drawer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 20px;
}
.drawer-tag {
  padding: 4px 12px;
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 12px;
  font-size: 13px;
  color: #FFE699;
  background: rgba(212, 175, 55, 0.1);
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
  box-shadow: 0 0 5px rgba(212, 175, 55, 0.2) inset;
  backdrop-filter: blur(4px);
}

.drawer-highlights {
  padding: 0 20px 16px;
}
.drawer-highlights h3 {
  font-family: var(--font-serif);
  font-size: 16px;
  color: #FFFFFF;
  margin-bottom: 12px;
}

.highlight-item {
  background: #111;
  border-radius: 0;
  padding: 12px;
  margin-bottom: 8px;
  border-left: 3px solid #FFFFFF;
}
.highlight-item.极度灵验 {
  border-left-color: #FFFFFF;
}
.highlight-item.非常灵验 {
  border-left-color: var(--c-red);
}
.highlight-item.颇为灵验 {
  border-left-color: #999;
}

.highlight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.highlight-name {
  font-weight: 600;
  font-size: 14px;
  color: #FFFFFF;
}

.highlight-badge {
  font-family: var(--font-pixel);
  font-size: 11px;
  padding: 2px 8px;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  font-weight: 600;
  background: transparent;
  color: #FFFFFF;
}
.highlight-badge.极度灵验 {
  background: #FFFFFF;
  color: #000;
}
.highlight-badge.非常灵验 {
  background: var(--c-red);
  color: #FFF;
  border-color: var(--c-red);
}
.highlight-badge.颇为灵验 {
  background: transparent;
  color: #999;
}

.highlight-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}

.drawer-info {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #111;
  border: 2px solid #FFFFFF;
  border-radius: 0;
}

.info-icon {
  font-size: 20px;
}

.info-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.info-value {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
}

.drawer-tips {
  padding: 0 20px 16px;
}
.drawer-tips h3 {
  font-family: var(--font-serif);
  font-size: 16px;
  color: #FFFFFF;
  margin-bottom: 8px;
}
.drawer-tips p {
  font-size: 13px;
  color: #CCC;
  line-height: 1.7;
  padding: 12px;
  background: #111;
  border-radius: 0;
  border-left: 3px solid #FFFFFF;
}

.drawer-actions {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  padding: 14px;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s;
}
.action-btn.primary {
  background: #FFFFFF;
  color: #000;
}
.action-btn.primary:hover {
  background: transparent;
  color: #FFF;
  border-color: #FFFFFF;
}
.action-btn.secondary {
  background: transparent;
  color: #FFF;
}
.action-btn.secondary:hover {
  background: #FFF;
  color: #000;
  border-color: #FFFFFF;
}

/* ── 抽屉动画 ── */
.drawer-enter-active, .drawer-leave-active {
  transition: opacity 0.3s;
}
.drawer-enter-from, .drawer-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active {
  transition: transform 0.4s var(--ease-out);
}
.drawer-slide-leave-active {
  transition: transform 0.3s ease-in;
}
.drawer-slide-enter-from {
  transform: translateX(100%);
}
.drawer-slide-leave-to {
  transform: translateX(100%);
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .temple-list {
    width: 260px;
    top: 240px;
  }
  .drawer {
    width: 100%;
    max-width: 100vw;
  }
}
@media (max-width: 480px) {
  /* 移动端：列表变为底部抽屉 */
  .temple-list {
    position: fixed;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 40vh;
    max-height: 70vh;
    border-top: 2px solid #FFF;
    background: rgba(0, 0, 0, 0.95);
    z-index: 1000;
    padding: 0 16px 16px;
    transition: height 0.3s ease;
  }

  .temple-list.collapsed {
    height: 48px;
    max-height: 48px;
  }

  .list-toggle {
    width: 100%;
    text-align: center;
    padding: 12px 0 8px;
    margin-bottom: 8px;
    border: none;
    border-bottom: 1px solid #333;
    border-radius: 0;
  }

  .list-content {
    padding-right: 0;
  }

  .temple-card {
    padding: 10px 12px;
  }
}

/* ═══════════════════════════════════════════════════════════════
   地图加载动画 — 八卦阵旋转
   ═══════════════════════════════════════════════════════════════ */
.map-loading {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 24px;
}

.loading-bagua {
  position: relative;
  width: 80px;
  height: 80px;
}

.bagua-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 50%;
}

.ring-outer {
  border-top-color: #FFD700;
  border-right-color: rgba(255, 215, 0, 0.3);
  animation: baguaSpin 2s linear infinite;
}

.ring-inner {
  inset: 12px;
  border-bottom-color: #E63927;
  border-left-color: rgba(230, 57, 39, 0.3);
  animation: baguaSpin 1.5s linear infinite reverse;
}

.bagua-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: #FFD700;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  animation: baguaPulse 1.5s ease-in-out infinite;
}

.loading-text {
  font-family: var(--font-serif);
  font-size: 14px;
  color: #FFD700;
  letter-spacing: 4px;
  animation: baguaPulse 2s ease-in-out infinite;
}

@keyframes baguaSpin {
  to { transform: rotate(360deg); }
}

@keyframes baguaPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ── 粉紫发光赛博莲花 SVG 样式 ── */
.cyber-pink-lotus {
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
  color: #ffb3ff;
  animation: pinkLotusSpin 8s linear infinite, pinkLotusAura 3s ease-in-out infinite alternate;
}

@keyframes pinkLotusSpin {
  0% { transform: perspective(400px) rotateY(0deg); }
  100% { transform: perspective(400px) rotateY(360deg); }
}

@keyframes pinkLotusAura {
  0% { filter: drop-shadow(0 0 3px rgba(128, 0, 128, 0.8)) drop-shadow(0 0 8px rgba(128, 0, 128, 0.5)); }
  100% { filter: drop-shadow(0 0 6px rgba(255, 105, 180, 0.9)) drop-shadow(0 0 15px rgba(255, 0, 255, 0.7)); }
}

/* ── 金元宝扫光动画样式 ── */
.cyber-gold-container {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
  overflow: hidden;
  border-radius: 5px;
}

.cyber-gold-sycee {
  display: block;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 10px rgba(255, 140, 0, 0.4));
  animation: goldBreathe 3s ease-in-out infinite alternate;
}

.gold-sweep-light {
  position: absolute;
  top: 0;
  left: -100%;
  width: 30%;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%);
  transform: skewX(-25deg);
  animation: sweepGold 4s linear infinite;
  pointer-events: none;
}

@keyframes sweepGold {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

@keyframes goldBreathe {
  0% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6)); }
  100% { transform: scale(1.05); filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.9)); }
}

/* ── 地图底图 logo/版权淡化 ── */
:deep(.amap-logo),
:deep(.amap-copyright) {
  opacity: 0.5;
}

/* =========================================
   移动端响应式适配 (小于 768px 视为手机)
========================================= */
@media (max-width: 768px) {
  /* 1. 改变信息弹窗(抽屉)的形态为 Bottom Sheet */
  .temple-list {
    position: fixed !important;
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: auto !important;
    max-height: 85vh !important;
    border-radius: 20px 20px 0 0 !important;
    transform: translateY(100%);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* 修复内容区在底部的滚动 */
  .temple-list-content {
    overflow-y: auto;
    padding-bottom: 30px;
    max-height: calc(85vh - 60px);
  }

  /* 2. 在抽屉顶部加一个"横条"提示用户可以滑动下拉 */
  .temple-list::before {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin: 10px auto;
  }

  /* 3. 优化分类 Filter 按钮的大小 */
  .category-filter {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: none;
  }
  .category-filter::-webkit-scrollbar {
    display: none;
  }
  .tag-btn {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 14px;
  }
}

@keyframes slideUp {
  to { transform: translateY(0); }
}
</style>
