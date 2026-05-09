import { ref } from 'vue'

/**
 * useTempleMap — 地图公共逻辑 Composable（性能优化版）
 * 特性：
 *   - 分批渲染避免主线程阻塞
 *   - 完善的错误保护
 *   - 鼠标悬停预加载图片
 */

// 图片预加载缓存
const preloadedImages = new Set()

// 预加载图片函数
const preloadImage = (url) => {
  if (!url || preloadedImages.has(url)) return
  const img = new Image()
  img.src = url
  preloadedImages.add(url)
}
export function useTempleMap({ mapRef, mapConfig, onDetailClick, onMarkerClick }) {
  let map = null
  let markers = []
  let infoWindow = null
  let infoWindowTimer = null
  let renderRafId = null

  // 移动端检测
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent)

  // ═══════════════════════════════════════════════════════════════
  // 全局事件代理：InfoWindow "查看详情" 按钮点击
  // 使用事件代理而非 setTimeout + querySelector，确保 100% 可靠
  // ═══════════════════════════════════════════════════════════════
  const _onGlobalClick = (e) => {
    const btn = e.target.closest('.view-detail-btn')
    if (!btn) return
    e.stopPropagation()
    const templeId = Number(btn.dataset.templeId)
    if (templeId && onDetailClick) {
      onDetailClick(templeId)
    }
  }
  // 在 setup 阶段立即绑定（document 始终存在）
  document.addEventListener('click', _onGlobalClick, true) // capture 阶段拦截

  // 获取响应式缩放级别
  const getResponsiveZoom = () => {
    return window.innerWidth < 768 ? 4 : 5
  }

  // 初始化高德地图（带错误保护）
  const initMap = () => {
    try {
      if (typeof AMap === 'undefined') {
        console.warn('[useTempleMap] AMap SDK 未加载，等待重试...')
        return null
      }

      const defaultZoom = mapConfig?.zoom || getResponsiveZoom()

      map = new AMap.Map(mapRef.value, {
        // 自定义地图样式：暗黑模式（赛博禅意）
        mapStyle: 'amap://styles/dark',
        features: ['bg', 'road', 'building', 'point'],
        zooms: [3, 18],
        viewMode: '2D',
        resizeEnable: true,
        pitchEnable: false,
        rotateEnable: false,
        center: [105.0, 36.0],
        zoom: defaultZoom,
        ...mapConfig,
      })

      // 地图底图瓦片加载完毕后，通知外部关闭 Loading
      map.on('complete', () => {
        console.log('[useTempleMap] 地图底图加载完成')
        if (options.onMapReady) {
          options.onMapReady()
        }
      })

      window.addEventListener('resize', handleResize)
      return map
    } catch (e) {
      console.error('[useTempleMap] 地图初始化失败:', e)
      return null
    }
  }

  // 窗口大小变化处理（带防抖，避免频繁触发）
  let _resizeTimer = null
  const handleResize = () => {
    if (_resizeTimer) clearTimeout(_resizeTimer)
    _resizeTimer = setTimeout(() => {
      if (!map) return
      const newZoom = getResponsiveZoom()
      const currentZoom = map.getZoom()
      if ((window.innerWidth < 768 && currentZoom > 4.5) ||
          (window.innerWidth >= 768 && currentZoom < 4.5)) {
        map.setZoom(newZoom)
      }
    }, 150)
  }

  // 构建灯笼 Marker HTML（带随机交错呼吸延迟）
  const createMarkerContent = (temple) => {
    const delay = (Math.random() * 2).toFixed(2)
    return `
      <div class="lantern-marker" data-id="${temple.id}">
        <div class="lantern-icon" style="animation-delay: -${delay}s">🏮</div>
      </div>
    `
  }

  // 构建 InfoWindow HTML（带赛博禅意骨架屏）
  const createInfoContent = (temple) => {
    const funTags = (temple.tags || []).filter(tag => tag !== temple.category)
    const tagsHtml = funTags.map(tag => `<span class="hash-tag">#${tag}</span>`).join('')

    // 图片区域：带骨架屏和渐显效果
    const imageSection = temple.image
      ? `<div class="cyber-image-wrapper">
           <div class="cyber-skeleton" id="skeleton-${temple.id}"></div>
           <img src="${temple.image}" alt="${temple.name}" class="temple-cover-img" referrerpolicy="no-referrer" onload="this.classList.add('is-loaded'); document.getElementById('skeleton-${temple.id}').style.display='none';">
         </div>`
      : `<div class="temple-cover-placeholder">🏯</div>`

    return `
      <div class="temple-info-window">
        <div class="close-btn">&times;</div>
        ${imageSection}
        <div class="temple-header-row">
          <h3 class="temple-name">${temple.name}</h3>
          <span class="temple-category-tag">${temple.category}</span>
        </div>
        ${funTags.length > 0 ? `<div class="temple-tags">${tagsHtml}</div>` : ''}
        <p class="temple-desc">${temple.brief}</p>
        <button class="view-detail-btn" data-temple-id="${temple.id}">
          查看详情 <span>➔</span>
        </button>
      </div>
    `
  }

  // 当前绑定的 DOM 事件清理函数
  let cleanupInfoCardEvents = null

  // 关闭当前 InfoWindow
  const closeInfoWindow = () => {
    if (cleanupInfoCardEvents) {
      cleanupInfoCardEvents()
      cleanupInfoCardEvents = null
    }
    if (infoWindow) {
      infoWindow.close()
      infoWindow = null
    }
  }

  // 绑定弹窗事件（返回清理函数）
  // 注意：view-detail-btn 的点击已由全局事件代理处理，此处只绑定 hover 和关闭
  const bindInfoCardEvents = () => {
    setTimeout(() => {
      const card = document.querySelector('.temple-info-window')
      if (!card) return

      const onMouseEnter = () => { clearTimeout(infoWindowTimer) }
      const onMouseLeave = () => {
        infoWindowTimer = setTimeout(() => {
          if (infoWindow) infoWindow.close()
        }, 400)
      }

      card.addEventListener('mouseenter', onMouseEnter)
      card.addEventListener('mouseleave', onMouseLeave)

      const closeBtn = card.querySelector('.close-btn')
      const onCloseClick = (e) => {
        e.stopPropagation()
        clearTimeout(infoWindowTimer)
        closeInfoWindow()
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', onCloseClick)
      }

      // 返回清理函数
      cleanupInfoCardEvents = () => {
        card.removeEventListener('mouseenter', onMouseEnter)
        card.removeEventListener('mouseleave', onMouseLeave)
        if (closeBtn) closeBtn.removeEventListener('click', onCloseClick)
      }
    }, 0)
  }

  // 打开某个寺庙的 InfoWindow
  // autoPan: 是否自动偏移到可视中心（默认 true，CityMapPage 会手动处理偏移，传 false）
  const openInfoWindow = (temple, position, autoPan = true) => {
    if (!map) return
    clearTimeout(infoWindowTimer)
    closeInfoWindow()
    try {
      const pos = position || [temple.lng, temple.lat]
      infoWindow = new AMap.InfoWindow({
        content: createInfoContent(temple),
        offset: new AMap.Pixel(0, -48),
        isCustom: true,
        autoMove: false, // 禁用高德 SDK 默认的自动平移，避免与自定义平移逻辑冲突
      })
      infoWindow.open(map, pos)

      // 仅在 autoPan=true 时自动偏移（HomePage 等场景）
      // CityMapPage 已手动计算偏移，不需要二次偏移
      if (autoPan) {
        requestAnimationFrame(() => {
          panToVisibleCenter(pos)
        })
      }

      bindInfoCardEvents()
    } catch (e) {
      console.error('[useTempleMap] InfoWindow 打开失败:', e)
    }
  }

  // 将目标点平移到可视区域中心（考虑 UI 遮挡）
  const panToVisibleCenter = (targetLngLat) => {
    if (!map) return

    const container = map.getContainer()
    const containerRect = container.getBoundingClientRect()

    // InfoWindow 弹出后大约 280px 宽，出现在 marker 右上方
    // 我们需要将 marker（灯笼）移到可视区域的中心偏左位置
    // 这样 InfoWindow（在右侧）和灯笼都能完整显示
    const infoWindowWidth = 300
    const infoWindowHeight = 320 // InfoWindow 大致高度

    // 动态获取顶部栏高度（尝试获取实际元素，失败则使用默认值）
    let topBarHeight = 150 // 默认值增大，适应 HomePage 的搜索栏+分类筛选
    const topBarEl = document.querySelector('.home-header') || document.querySelector('.top-bar')
    if (topBarEl) {
      topBarHeight = topBarEl.getBoundingClientRect().height + 20 // 额外 20px 安全间距
    }

    // 计算可视区域中心（排除顶部栏，InfoWindow 显示在上方）
    const visibleCenterX = containerRect.width / 2 - infoWindowWidth / 4
    // Y 中心需要考虑 InfoWindow 高度，确保弹窗完整显示在顶部栏下方
    const visibleCenterY = topBarHeight + infoWindowHeight / 2 + 20

    // 获取 marker 当前的屏幕像素坐标
    const targetPixel = map.lngLatToContainer(targetLngLat)

    // 计算需要平移的像素偏移
    const deltaX = targetPixel.getX() - visibleCenterX
    const deltaY = targetPixel.getY() - visibleCenterY

    // 使用 panBy 平滑移动
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      map.panBy(-deltaX, -deltaY, true, 400)
    }
  }

  // 中国境内坐标范围校验（大致边界）
  const isValidChinaCoordinate = (lat, lng) => {
    return lat > 18 && lat < 53 && lng > 73 && lng < 135
  }

  // 创建单个 Marker
  const createMarker = (temple) => {
    // 拦截极端坐标，防止地图飞到海里
    if (!isValidChinaCoordinate(temple.lat, temple.lng)) {
      console.warn('[useTempleMap] 坐标异常，跳过渲染:', temple.name, temple.lat, temple.lng)
      return null
    }
    const marker = new AMap.Marker({
      position: new AMap.LngLat(temple.lng, temple.lat),
      content: createMarkerContent(temple),
      offset: new AMap.Pixel(-18, -44),
      zIndex: 100,
      extData: temple,
    })

    // 鼠标悬停预加载图片
    marker.on('mouseover', () => {
      preloadImage(temple.image)
    })

    marker.on('click', () => {
      if (onMarkerClick) {
        onMarkerClick(temple)
      } else {
        openInfoWindow(temple, marker.getPosition())
      }
    })

    return marker
  }

  // 分批渲染 Marker（使用 requestAnimationFrame）
  const renderMarkersBatched = (templeList, batchSize = 50) => {
    if (!map) return

    // 过滤异常坐标（如 lat=0, lng=0 的占位数据）
    const validTemples = templeList.filter(t => t.lat !== 0 || t.lng !== 0)

    if (renderRafId) {
      cancelAnimationFrame(renderRafId)
    }

    if (markers.length) {
      map.remove(markers)
      markers = []
    }

    // 创建所有 Marker 对象
    markers = validTemples.map(temple => createMarker(temple)).filter(m => m !== null)

    // ====== 核心分支：区分设备 ======
    if (isMobile) {
      // 【手机端】：开启视野剔除，只渲染屏幕内的灯笼
      console.log('[useTempleMap] 检测到移动端，开启可视区域渲染优化')
      renderMarkersInBounds()

      // 监听拖拽和缩放，停止时重新计算
      map.off('moveend', renderMarkersInBounds)
      map.off('zoomend', renderMarkersInBounds)
      map.on('moveend', renderMarkersInBounds)
      map.on('zoomend', renderMarkersInBounds)
    } else {
      // 【电脑端】：一次性全部渲染
      console.log('[useTempleMap] 检测到 PC 端，一次性渲染所有灯笼')
      if (markers.length <= batchSize) {
        map.add(markers)
      } else {
        // 数据量大时分批添加
        let index = 0
        const total = markers.length
        const renderBatch = () => {
          const batch = markers.slice(index, index + batchSize)
          map.add(batch)
          index += batchSize
          if (index < total) {
            renderRafId = requestAnimationFrame(renderBatch)
          }
        }
        renderRafId = requestAnimationFrame(renderBatch)
      }
    }
  }

  // 视野剔除函数（仅手机端使用）
  const renderMarkersInBounds = () => {
    if (!map || markers.length === 0) return
    const bounds = map.getBounds()

    markers.forEach(marker => {
      const isVisible = bounds.contains(marker.getPosition())
      const isAdded = marker.getMap() !== null

      if (isVisible && !isAdded) {
        map.add(marker)
      } else if (!isVisible && isAdded) {
        map.remove(marker)
      }
    })
  }

  // 渲染 Marker（使用分批渲染避免卡顿）
  const renderWithCluster = (templeList) => {
    if (!map) return
    renderMarkersBatched(templeList)
  }

  // 飞到指定位置
  const flyTo = (center, zoom, duration = 800) => {
    if (!map) return
    map.setZoomAndCenter(zoom, center, false, duration)
  }

  // 获取当前地图状态
  const getMapState = () => ({
    zoom: map?.getZoom(),
    center: map?.getCenter(),
    bounds: map?.getBounds(),
  })

  // 获取地图实例
  const getMap = () => map

  // 销毁地图实例
  const destroy = () => {
    // 清理全局事件代理
    document.removeEventListener('click', _onGlobalClick, true)

    window.removeEventListener('resize', handleResize)

    if (renderRafId) {
      cancelAnimationFrame(renderRafId)
      renderRafId = null
    }

    clearTimeout(infoWindowTimer)
    closeInfoWindow()

    if (map) {
      map.clearMap()
      map.destroy()
      map = null
    }
    markers = []
  }

  // 聚焦到指定寺庙坐标（用于"查看详情"跳转前的地图定位）
  // 参数：position [lng, lat], options { zoom }
  const panToTemple = (position, options = {}) => {
    if (!map) return
    const { zoom = 16 } = options
    
    try {
      // 先缩放，再平移（带 300ms 动画）
      map.setZoom(zoom, false, 300)
      map.panTo(position, false, 300)
    } catch (e) {
      console.warn('[useTempleMap] panToTemple 失败:', e)
    }
  }

  return {
    initMap,
    renderMarkers: renderMarkersBatched,
    renderWithCluster,
    openInfoWindow,
    closeInfoWindow,
    flyTo,
    panToTemple,
    getMapState,
    getMap,
    destroy,
  }
}
