<template>
  <!-- 加载状态 -->
  <div v-if="isLoading" class="detail-page loading-state">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>正在加载寺庙信息...</p>
    </div>
  </div>
  
  <!-- 错误状态 -->
  <div v-else-if="loadError" class="detail-page error-state">
    <div class="error-content">
      <span class="error-icon">🙏</span>
      <p>{{ loadError }}</p>
      <button class="back-btn" @click="router.push('/')">返回首页</button>
    </div>
  </div>
  
  <!-- 正常内容 -->
  <div v-else-if="temple" class="detail-page">
    <!-- 全息噪点层 -->
    <div class="noise-overlay"></div>
    
    <!-- 顶部英雄区 -->
    <div class="hero-section">
      <div class="hero-image">
        <!-- 赛博禅意骨架屏 -->
        <div v-if="temple.image" class="cyber-image-wrapper">
          <div v-show="!isHeroImageLoaded" class="cyber-skeleton"></div>
          <img
            :src="temple.image"
            :alt="temple.name"
            referrerpolicy="no-referrer"
            loading="lazy"
            decoding="async"
            @load="isHeroImageLoaded = true"
            @error="handleImageError"
            :class="{ 'is-loaded': isHeroImageLoaded }"
          />
        </div>
        <div v-else class="hero-placeholder">
          <span class="placeholder-char">禅</span>
        </div>
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <button class="back-btn" @click="goBack">
          <span>←</span> 返回地图
        </button>
        <div class="hero-badges">
          <span
            v-for="tag in temple.tags"
            :key="tag"
            class="hero-tag"
            :style="{ borderColor: getTagColor(tag), color: getTagColor(tag) }"
          >
            {{ getTagIcon(tag) }} {{ tag }}
          </span>
        </div>
        <div class="title-with-seal">
          <h1 class="hero-title">{{ temple.name }}</h1>
          <!-- 赛博印章 -->
          <div class="cyber-seal">
            <div class="seal-stamp">
              <span class="seal-char">灵</span>
            </div>
            <div class="seal-meta">
              <div class="seal-barcode">||| || ||| |</div>
              <div class="seal-coords">{{ temple.lat?.toFixed(2) || '00.00' }}N {{ temple.lng?.toFixed(2) || '00.00' }}E</div>
            </div>
          </div>
        </div>
        <p class="hero-subtitle">📍 {{ temple.city }} · {{ temple.province }}</p>
        <p class="hero-brief">{{ temple.brief }}</p>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 灵验领域 -->
      <section v-if="temple.highlights && Object.keys(temple.highlights).length > 0" class="section highlights-section">
        <h2 class="section-title">
          <span class="title-icon">🎯</span>
          最灵验的领域
        </h2>
        <div class="highlights-grid">
          <div
            v-for="(info, key) in temple.highlights"
            :key="key"
            class="highlight-card"
            :class="info.level"
          >
            <div class="hl-top">
              <span class="hl-name">{{ key }}</span>
              <span class="hl-badge" :class="info.level">
                <span class="badge-icon">{{ getLevelIcon(info.level) }}</span>
                {{ info.level }}
              </span>
            </div>
            <p class="hl-desc">{{ info.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 历史故事 -->
      <section v-if="temple.history" class="section history-section">
        <h2 class="section-title">
          <span class="title-icon">📜</span>
          历史故事
        </h2>
        <div class="history-content">
          <p>{{ temple.history }}</p>
        </div>
      </section>

      <!-- 实用信息 -->
      <section class="section info-section">
        <h2 class="section-title">
          <span class="title-icon">📋</span>
          实用信息
        </h2>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-icon">🕐</div>
            <div class="info-card-label">开放时间</div>
            <div class="info-card-value">{{ temple.openTime || '暂无信息' }}</div>
          </div>
          <div class="info-card">
            <div class="info-card-icon">🎫</div>
            <div class="info-card-label">门票价格</div>
            <div class="info-card-value">{{ temple.ticket || '请以实际为准' }}</div>
          </div>
          <div class="info-card">
            <div class="info-card-icon">📍</div>
            <div class="info-card-label">所在城市</div>
            <div class="info-card-value">{{ temple.city }}，{{ temple.province }}</div>
          </div>
        </div>
        <div v-if="temple.tips" class="tips-box">
          <div class="tips-icon">💡</div>
          <div class="tips-text">{{ temple.tips }}</div>
        </div>
      </section>

      <!-- 赛博上香与功德木鱼 -->
      <section class="section cyber-section">
        <h2 class="section-title">
          <span class="title-icon">🪷</span>
          赛博上香
        </h2>
        <p class="section-desc">心诚则灵，在线祈福同样灵验</p>

        <div class="cyber-area">
          <!-- 上方：赛博香炉 + 线香 -->
          <div class="incense-altar">
            <div class="censer">
              <svg viewBox="0 0 200 180" class="censer-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <!-- 香炉体渐变 -->
                  <linearGradient id="censerBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3a3a3a"/>
                    <stop offset="40%" stop-color="#2a2a2a"/>
                    <stop offset="100%" stop-color="#1a1a1a"/>
                  </linearGradient>
                  <!-- 霓虹金光 -->
                  <linearGradient id="neonGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#FADA60" stop-opacity="0"/>
                    <stop offset="50%" stop-color="#FADA60" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#FADA60" stop-opacity="0"/>
                  </linearGradient>
                  <!-- 发光滤镜 -->
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="glowStrong">
                    <feGaussianBlur stdDeviation="6" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                <!-- 炉足 -->
                <line x1="60" y1="155" x2="52" y2="172" stroke="#FADA60" stroke-width="2" opacity="0.5" filter="url(#glow)"/>
                <line x1="100" y1="158" x2="100" y2="175" stroke="#FADA60" stroke-width="2" opacity="0.5" filter="url(#glow)"/>
                <line x1="140" y1="155" x2="148" y2="172" stroke="#FADA60" stroke-width="2" opacity="0.5" filter="url(#glow)"/>

                <!-- 炉身（梯形鼎） -->
                <path d="M45 100 Q45 155 100 158 Q155 155 155 100 L148 80 L52 80 Z"
                      fill="url(#censerBody)" stroke="#FADA60" stroke-width="1.5" opacity="0.9"/>
                <!-- 炉身霓虹外发光 -->
                <path d="M45 100 Q45 155 100 158 Q155 155 155 100 L148 80 L52 80 Z"
                      fill="none" stroke="#FADA60" stroke-width="4" opacity="0.12" filter="url(#glowStrong)"/>

                <!-- 炉身纹饰（回纹） -->
                <path d="M65 110 L75 110 L75 120 L85 120 L85 110 L95 110" fill="none" stroke="#FADA60" stroke-width="0.8" opacity="0.3"/>
                <path d="M105 110 L115 110 L115 120 L125 120 L125 110 L135 110" fill="none" stroke="#FADA60" stroke-width="0.8" opacity="0.3"/>
                <line x1="55" y1="130" x2="145" y2="130" stroke="#FADA60" stroke-width="0.5" opacity="0.2"/>

                <!-- 炉口（椭圆） -->
                <ellipse cx="100" cy="80" rx="50" ry="12" fill="#1a1a1a" stroke="#FADA60" stroke-width="1.5" opacity="0.8"/>
                <!-- 炉口内圈 -->
                <ellipse cx="100" cy="80" rx="40" ry="8" fill="none" stroke="#FADA60" stroke-width="0.5" opacity="0.25"/>

                <!-- 炉耳（双环） -->
                <circle cx="48" cy="88" r="8" fill="none" stroke="#FADA60" stroke-width="1.2" opacity="0.5" filter="url(#glow)"/>
                <circle cx="152" cy="88" r="8" fill="none" stroke="#FADA60" stroke-width="1.2" opacity="0.5" filter="url(#glow)"/>

                <!-- 底座 -->
                <rect x="40" y="155" width="120" height="6" rx="2" fill="#2a2a2a" stroke="#FADA60" stroke-width="1" opacity="0.6"/>
              </svg>
              <!-- 线香（从炉口伸出） -->
              <div class="incense-sticks">
                <div class="incense-stick" v-for="i in 3" :key="i"
                     :class="{ burning: isBurning }"
                     :style="{ left: `${38 + i * 14}px`, height: `${55 + i * 5}px`, animationDelay: `${i * 0.3}s`, '--drift': `${(i - 1) * 20}px` }">
                  <div class="stick-body"></div>
                  <div class="stick-flame" v-if="isBurning"></div>
                </div>
              </div>
              <!-- 动态烟雾粒子（S 形摇曳） -->
              <div class="smoke-container" v-if="isBurning">
                <div v-for="smoke in smokeList" :key="smoke.id" class="smoke-puff"
                     :style="{
                       '--drift': smoke.drift,
                       'animation-delay': smoke.delay,
                       '--smoke-scale': smoke.scale
                     }">
                </div>
              </div>
            </div>
          </div>

          <!-- 中间：木鱼 + 功德漂浮 -->
          <div class="muyu-area" @click="hitWoodenFish">
            <div class="muyu-container" :class="{ 'is-hitting': isHitting }">
              <!-- 木鱼本体 -->
              <div class="muyu-body">
                <svg viewBox="0 0 300 240" class="muyu-svg" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="muyuBody" cx="45%" cy="40%" r="55%">
                      <stop offset="0%" stop-color="#D4A574"/>
                      <stop offset="50%" stop-color="#B8834F"/>
                      <stop offset="85%" stop-color="#8B6340"/>
                      <stop offset="100%" stop-color="#4A3728"/>
                    </radialGradient>
                    <radialGradient id="muyuHollow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#1a1008"/>
                      <stop offset="100%" stop-color="#3a2818"/>
                    </radialGradient>
                    <filter id="cyanGlow">
                      <feGaussianBlur stdDeviation="4" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <filter id="cyanGlowSoft">
                      <feGaussianBlur stdDeviation="8" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="200" height="200">
                      <line x1="0" y1="20" x2="200" y2="25" stroke="#000" stroke-width="0.3" opacity="0.08"/>
                      <line x1="0" y1="55" x2="200" y2="50" stroke="#000" stroke-width="0.2" opacity="0.06"/>
                      <line x1="0" y1="90" x2="200" y2="95" stroke="#000" stroke-width="0.3" opacity="0.07"/>
                      <line x1="0" y1="130" x2="200" y2="125" stroke="#000" stroke-width="0.2" opacity="0.05"/>
                      <line x1="0" y1="170" x2="200" y2="175" stroke="#000" stroke-width="0.3" opacity="0.06"/>
                    </pattern>
                  </defs>

                  <!-- 木鱼主体（斜15度椭圆体） -->
                  <g transform="translate(150, 120) rotate(-15)">
                    <ellipse cx="0" cy="0" rx="105" ry="72" fill="none"
                             stroke="#00FFCC" stroke-width="3" opacity="0.08" filter="url(#cyanGlowSoft)"/>
                    <ellipse cx="4" cy="6" rx="100" ry="68" fill="#000" opacity="0.3"/>
                    <ellipse cx="0" cy="0" rx="100" ry="68" fill="url(#muyuBody)" stroke="#00FFCC" stroke-width="1" opacity="0.85"/>
                    <ellipse cx="0" cy="0" rx="100" ry="68" fill="url(#woodGrain)" opacity="0.5"/>
                    <path d="M-70 -5 Q-30 -18 0 -8 Q30 2 70 -12" fill="none"
                          stroke="#1a1008" stroke-width="5" stroke-linecap="round"/>
                    <path d="M-70 -5 Q-30 -18 0 -8 Q30 2 70 -12" fill="none"
                          stroke="#D4A574" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
                    <ellipse cx="0" cy="-8" rx="50" ry="25" fill="url(#muyuHollow)" opacity="0.6"/>
                    <ellipse cx="85" cy="8" rx="18" ry="40" fill="none"
                             stroke="#8B6340" stroke-width="2.5" opacity="0.6"/>
                    <ellipse cx="85" cy="8" rx="14" ry="36" fill="none"
                             stroke="#D4A574" stroke-width="1" opacity="0.3"/>
                    <circle cx="85" cy="-30" r="4" fill="none" stroke="#8B6340" stroke-width="1.5" opacity="0.5"/>
                    <circle cx="85" cy="46" r="4" fill="none" stroke="#8B6340" stroke-width="1.5" opacity="0.5"/>
                    <ellipse cx="0" cy="55" rx="70" ry="12" fill="#2a1a0a" opacity="0.5"/>
                  </g>
                </svg>
              </div>

              <!-- 棒槌（独立图层，旋转敲击动画） -->
              <div class="muyu-mallet">
                <svg viewBox="0 0 80 120" class="mallet-svg" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="malletGlow">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <!-- 槌柄 -->
                  <line x1="40" y1="30" x2="40" y2="110" stroke="#E8C39E" stroke-width="5" stroke-linecap="round"/>
                  <line x1="40" y1="30" x2="40" y2="110" stroke="#00FFCC" stroke-width="1" opacity="0.15" filter="url(#malletGlow)"/>
                  <!-- 槌头 -->
                  <circle cx="40" cy="22" r="14" fill="#F0E8E0" opacity="0.85"/>
                  <circle cx="40" cy="22" r="14" fill="none" stroke="#00FFCC" stroke-width="0.8" opacity="0.25"/>
                  <!-- 槌头包布纹理 -->
                  <circle cx="40" cy="22" r="10" fill="none" stroke="#D4A574" stroke-width="0.5" opacity="0.3"/>
                </svg>
              </div>

              <!-- 功德漂浮 -->
              <div v-for="m in meritFloats" :key="m.id" class="merit-plus"
                   :style="{ left: m.x + 'px' }">
                +1 功德
              </div>
            </div>
            <div class="muyu-label">木魚</div>
          </div>

          <!-- 数据展示 -->
          <div class="cyber-stats">
            <div class="stat">
              <span class="stat-value cyber-number">{{ incenseTimerDisplay }}</span>
              <span class="stat-label">敬香时长</span>
            </div>
            <div class="stat">
              <span class="stat-value cyber-number">{{ knockCount }}</span>
              <span class="stat-label">功德</span>
            </div>
          </div>

          <!-- 按钮组 -->
          <div class="cyber-actions">
            <button class="cyber-btn glass-btn" @click.stop="toggleIncense">
              {{ isBurning ? '熄灭' : '点燃' }}
            </button>
            <button class="cyber-btn glass-btn" @click.stop="hitWoodenFish">
              敲木鱼
            </button>
          </div>

          <!-- 祝福语 -->
          <div v-if="blessingMessage" class="blessing-msg" :key="blessingKey">
            {{ blessingMessage }}
          </div>
        </div>
      </section>

      <!-- 分享好运符 -->
      <section class="section share-section">
        <h2 class="section-title">
          <span class="title-icon">🏮</span>
          抽取好运签
        </h2>
        <p class="section-desc">抽取专属寺庙签文，生成符箓海报分享给好友</p>

        <button class="share-btn" :class="{ flying: isCraneFlying }" @click="handleShareClick">
          <span class="share-btn-text">分享 / 抽取好运签</span>
          <!-- 折纸鹤 SVG（赛博霓虹线框） -->
          <svg class="crane-icon" viewBox="0 0 1352 1024" xmlns="http://www.w3.org/2000/svg">
            <path d="M314.840977 798.683448a25.154838 25.154838 0 0 1-17.771886-42.927724l177.005863-177.006863a25.144838 25.144838 0 1 1 35.559771 35.559772L332.628863 791.315495a25.125839 25.125839 0 0 1-17.787886 7.367953z" fill="currentColor"/>
            <path d="M314.869977 798.683448a25.154838 25.154838 0 0 1-21.398863-11.886924L3.856975 320.075523a25.154838 25.154838 0 0 1 34.537778-34.639777L505.144754 575.122884a25.156838 25.156838 0 0 1-26.52183 42.754726L103.153337 384.848107l233.130502 375.426588a25.139838 25.139838 0 0 1-21.341863 38.409753z" fill="currentColor"/>
            <path d="M347.01877 492.951412a25.139838 25.139838 0 0 1-18.909878-41.732731l112.652276-128.769173a25.154838 25.154838 0 0 1 37.861756 33.099787l-65.895576 75.319516 55.735642-9.640938a25.139838 25.139838 0 0 1 8.562945 49.547682l-125.704193 21.74386a24.262844 24.262844 0 0 1-4.302972 0.431997z" fill="currentColor"/>
            <path d="M572.378322 814.787344a25.139838 25.139838 0 0 1-10.734931-47.892692l273.598242-128.769172a25.144838 25.144838 0 0 1 21.412862 45.503707l-273.598242 128.797173a25.010839 25.010839 0 0 1-10.677931 2.359984z" fill="currentColor"/>
            <path d="M699.089508 905.318763a25.269838 25.269838 0 0 1-14.549907-4.67697l-112.649276-80.472483a25.154838 25.154838 0 0 1 29.183813-40.941737l102.59134 73.277529 210.954645-64.039589 243.333436-133.83314-179.696845 40.825738a24.85284 24.85284 0 0 1-5.569964 0.633996h-112.579277a25.154838 25.154838 0 1 1 0-50.295677H969.953767l351.321743-79.840487a25.139838 25.139838 0 0 1 17.686886 46.553701L936.536982 833.811222a26.665829 26.665829 0 0 1-4.819969 2.014987l-225.316552 68.413561a25.485836 25.485836 0 0 1-7.309953 1.079993z m148.067048-286.808157a25.212838 25.212838 0 0 1-24.88184-28.982814l62.758597-407.935379-173.408886 349.695753a25.139838 25.139838 0 1 1-45.04371-22.348856L911.91514 13.99749a25.139838 25.139838 0 0 1 47.373696 15.009904l-87.380439 568.176349a25.154838 25.154838 0 0 1-24.751841 21.326863z" fill="currentColor"/>
            <path d="M540.157529 1023.971a25.154838 25.154838 0 0 1-24.83784-28.982814L547.496482 785.803531a24.636842 24.636842 0 0 1 0.661996-3.021981l76.443508-269.582268a25.125839 25.125839 0 0 1 38.351754-13.94491L814.344767 601.975712a22.391856 22.391856 0 0 1 1.985987 1.439991l45.719707 38.091755a25.153838 25.153838 0 1 1-32.163794 38.682751L785.131955 642.902449l-121.602219-82.48747-66.513572 234.568493-21.341863 138.685108 92.619405-82.38747a25.154838 25.154838 0 0 1 33.414785 37.602758l-144.829069 128.769173a25.169838 25.169838 0 0 1-16.721893 6.316959z" fill="currentColor"/>
            <path d="M540.129529 1023.971a25.139838 25.139838 0 0 1-24.92484-22.103858l-80.473482-659.81776a25.139838 25.139838 0 0 1 36.206767-25.542836l64.369586 32.177793a25.226838 25.226838 0 0 1 11.167928 11.094929l106.405317 209.241656a25.139838 25.139838 0 1 1-44.827712 22.780853l-102.649341-201.844703-15.138902-7.540951 74.832519 613.392058a25.169838 25.169838 0 0 1-21.917859 28.01982 27.802821 27.802821 0 0 1-3.049981 0.142999z" fill="currentColor"/>
            <path d="M521.924646 874.133963a25.413837 25.413837 0 0 1-8.633944-1.438991l-207.05467-75.522514a25.164838 25.164838 0 0 1 17.268889-47.273697l207.05467 75.479515a25.139838 25.139838 0 0 1-8.634945 48.769687z" fill="currentColor"/>
          </svg>
        </button>
        <p class="share-tip">点击抽取今日签文，生成符箓海报</p>
      </section>

      <!-- 海报预览弹窗 -->
      <teleport to="body">
        <transition name="fade">
          <div v-if="showPosterModal" class="poster-modal-overlay" @click.self="closePosterModal">
            <div class="poster-modal">
              <button class="modal-close" @click="closePosterModal">&times;</button>
              
              <!-- 海报预览区域 -->
              <div class="poster-preview-area">
                <img v-if="posterImage" :src="posterImage" alt="签文海报" class="poster-result" />
                <div v-else class="poster-generating">
                <span class="generating-icon">🏮</span>
                <p v-if="posterError">{{ posterError }}</p>
                <p v-else>正在生成符箓...</p>
              </div>
              </div>

              <!-- 操作按钮 -->
              <div class="poster-actions">
                <button v-if="posterImage" class="download-btn" @click="downloadPoster">
                  <svg class="action-icon" viewBox="0 0 1024 1024" fill="currentColor">
                    <path d="M762.9 487.8l-3.3-0.9 2.4-19.3c6.6-10.4 6.1-24.4-2.3-34.3-10.2-12.2-28.3-13.9-40.7-3.9 12-10.4 13.4-28.5 3.2-40.7-9.6-11.4-26-13.6-38.2-5.7l-0.3-0.4c9.9-10.6 10.5-27.2 0.9-38.5-8.9-10.6-23.6-13.3-35.4-7.3l-1-1.3c7.9-10.6 7.8-25.6-1.1-36.1-8.2-9.7-21.3-12.8-32.5-8.6l-2.1-2.7c6-10.3 5.2-23.7-2.9-33.4a29.23 29.23 0 0 0-29.4-9.6l-3.7-4.9c4.2-9.8 2.9-21.5-4.5-30.3-6.6-7.9-16.5-11.4-26-10.2l-5.7-7.6v-50.9c0-16-13.1-29.2-29.2-29.2-16 0-29.2 13.1-29.2 29.2v52.5l-4.5 5.9c-9.3-0.9-18.8 2.6-25.2 10.3-7.1 8.5-8.6 19.9-4.7 29.6l-4.1 5.4c-10.3-2.3-21.5 1.1-28.7 9.7-7.9 9.5-8.8 22.5-3.2 32.7l-2.4 3.1c-11.1-3.9-23.9-0.7-31.9 8.8-8.7 10.4-8.9 25-1.5 35.6l-1.1 1.5c-11.7-5.6-26.1-2.8-34.9 7.6-9.4 11.2-8.9 27.4 0.5 38.1l-0.4 0.5c-12.1-7.5-28.2-5.1-37.6 6.1-10.1 12-8.8 29.8 2.7 40.3v0.1c-12.3-9.5-30.1-7.7-40.2 4.3-7.9 9.4-8.8 22.4-3.3 32.6 0.5 4.2 1.6 12.8 3.1 24.5l-3.9 1c-15.5 4.2-24.8 20.2-20.6 35.7l11 41.2c27.7 45.3 43.7 98.5 43.7 155.4 0 32.6-5.2 63.9-14.9 93.2v7.6c-0.9 3.5-1.4 7.3-1.4 11.1s0.5 7.5 1.4 11.1v0.1c4.9 18.7 22 32.5 42.3 32.5 20.3 0 37.3-13.8 42.3-32.5h0.7v-0.1c41.1 41.5 93.5 65.2 146.1 65.2 52.2-0.1 105.3-23.7 147.4-64.9 5 18.6 22 32.4 42.2 32.4 20.3 0 37.3-13.8 42.3-32.5h2v-24.3c-10.9-30.9-16.8-64.2-16.8-98.8 0-55.6 15.3-107.7 41.8-152.3l12.9-48c4.7-15.5-4.6-31.5-20.1-35.7zM322.5 850.3c-8.1 0-14.6-6.5-14.6-14.6s6.5-14.6 14.6-14.6 14.6 6.5 14.6 14.6-6.5 14.6-14.6 14.6z m379.1 0c-8.1 0-14.6-6.5-14.6-14.6s6.5-14.6 14.6-14.6 14.6 6.5 14.6 14.6-6.5 14.6-14.6 14.6z m16.9-325.8l-10.7 78.2c-0.5 3.4-13.4 93.3-13.4 93.3-3.2 21.4-9.8 41.1-19.4 58.6-35.5 64.5-100.1 103.8-163.2 103.9-57.2 0.1-114.2-32.1-149.8-85.9-14.4-21.7-25-47.1-30.6-75.4l-0.3-1.5c-1.4-7.5-14.3-89-14.8-93l-10.7-78.2c-0.6-4.6 0.7-18.7 0.7-18.7 4.5-20.6 21.2-36.8 43.9-41.4H369c17.3 3.9 69 15.4 82.6 15.4h121c13.5 0 65.3-11.5 82.6-15.4H674c22.7 4.6 39.4 20.8 43.9 41.4-0.1 0 1.2 14.1 0.6 18.7z"></path><path d="M497.4 544.9a14.6 14.6 0 1 0 29.2 0 14.6 14.6 0 1 0-29.2 0zM449.4 616.6h-81.1c-10.5 0-19.8-5.6-24.9-14v0.5c0 16.1 26.1 29.2 58.3 29.2 22.7 0 42.4-6.5 52-16-1.4 0.2-2.8 0.3-4.3 0.3z m206.4 0h-81.1c-1.5 0-2.9-0.1-4.4-0.3 9.6 9.5 29.3 16 52 16 32.2 0 58.3-13.1 58.3-29.2v-0.5c-5 8.3-14.3 14-24.8 14zM512 792.6c32.2 0 58.3-13.1 58.3-29.2H453.7c0 16.1 26.1 29.2 58.3 29.2z"></path>
                  </svg>
                  <span>保存到手机 / 下载</span>
                </button>
                <button v-else class="download-btn disabled" disabled>
                  生成中...
                </button>
                <button class="cancel-btn" @click="closePosterModal">
                  关闭
                </button>
              </div>

              <!-- 社交裂变引导 -->
              <transition name="slide-up">
                <div v-if="showShareHint" class="share-hint-bar">
                  <svg class="action-icon" viewBox="0 0 1024 1024" fill="currentColor">
                    <path d="M837.72441406 476.83847656H186.56474609l-2.50488281-0.76289062c-35.5921875-10.84394531-61.06025391-52.5375-76.15546875-85.60458985-15.51005859-33.97324219-26.81367188-73.91513672-26.87695312-94.97197265v-0.05888672c-10.93183594-12.26601562-16.66142578-25.959375-16.66142579-40.01660156 0-8.77939453 6.36240234-16.40917969 14.99501954-18.23466797a19.60839844 19.60839844 0 0 1 4.28378906-0.47197266c4.49384766 0 8.88310547 1.53544922 12.36005859 4.32333984l0.29003906 0.2381836c34.37490234 28.79121094 78.24726563 45.30410156 120.36884766 45.30410156 23.66894531 0 44.23183594-5.35429687 57.77578125-14.86669922v-82.6453125c0-16.35292969 15.71220703-29.16386719 35.76972656-29.16386719 15.72363281 0 28.77451172 7.87148438 33.68232422 19.15048829h336.21240235c4.9078125-11.27900391 17.96308594-19.15048828 33.68408203-19.15048828 20.05751953 0 35.76972656 12.81005859 35.76972656 29.16386718v82.67167969c13.39013672 9.37880859 34.33798828 14.84121094 57.77578125 14.84121094 41.96689453 0 85.76191406-16.45927734 120.20097656-45.16435547 3.47431641-3.00146484 8.06660156-4.70126953 12.80039063-4.70126953 1.84042969 0 3.65625 0.25400391 5.40351562 0.75410156 8.30654297 2.37832031 13.88847656 9.59238281 13.88847656 17.95253906l-0.0008789 0.13798828c-0.10898438 13.91484375-5.73574219 27.51240234-16.37138672 39.73359375v0.15117188c-0.06328125 21.11044922-11.36777344 61.05146484-26.87783203 95.02470703-15.09697266 33.06708984-40.56064453 74.76152344-76.15371094 85.60458984l-2.49873047 0.76201172zM862.08681641 797.41601563a20.17089844 20.17089844 0 0 0-9.11777344-2.14892579h-25.565625V515.22382813H196.59394531v280.0415039h-25.56298828c-3.22119141 0-6.40810547 0.74091797-9.21533203 2.14892578l-0.98173828 0.4913086-0.91230469 0.61083984c-5.19082031 3.46904297-8.28896484 9.21708984-8.28896484 15.38085937v74.30009766c0 7.03037109 3.90849609 13.34707031 10.21201172 16.49707031a20.16123047 20.16123047 0 0 0 9.08964843 2.1366211h682.03476563c3.99990234 0 7.78974609-1.11357422 11.00566406-3.2484375 5.19433594-3.46728516 8.29511719-9.21796875 8.29511719-15.38261719v-74.30009766c0-7.02158203-3.90234375-13.33740234-10.18300781-16.48388672z m-369.99492188 38.66484374H364.63203125V607.85703125h127.45986328v228.22382813z m173.69033203 0H538.32236328V607.85703125H665.78222656v228.22382813z"></path>
                  </svg>
                  <span class="share-hint-text">长按图片保存，发送给好友传递赛博好运</span>
                  <span class="share-hint-pulse"></span>
                </div>
              </transition>
            </div>
          </div>
        </transition>
      </teleport>

      <!-- 隐藏的海报DOM（用于html2canvas截图） -->
      <div ref="posterCaptureRef" class="talisman-poster poster-template-container">
        <div class="talisman-container">
          <!-- 纸质纹理层 -->
          <div class="talisman-texture"></div>

          <!-- 中央符箓主体 -->
          <div class="talisman-body">
            <!-- 云纹边框 -->
            <div class="talisman-border">
              <!-- 顶部云纹装饰 -->
              <div class="cloud-top"></div>
              <!-- 底部灵芝纹装饰 -->
              <div class="cloud-bottom"></div>
            </div>

            <!-- 四方印章圆 -->
            <div class="seal-circle seal-tr">天</div>
            <div class="seal-circle seal-br">官</div>
            <div class="seal-circle seal-bl">福</div>
            <div class="seal-circle seal-tl">賜</div>

            <!-- 中央竖排主文 -->
            <div class="talisman-center">
              <!-- 左侧副文 -->
              <div class="talisman-flank flank-left">
                <span>諸神</span>
                <span>護佑</span>
              </div>

              <!-- 中间主标题 -->
              <div class="talisman-main-text">
                <span v-for="(char, i) in templeNameChars" :key="i">{{ char }}</span>
              </div>

              <!-- 右侧副文 -->
              <div class="talisman-flank flank-right">
                <span>有求</span>
                <span>必應</span>
              </div>
            </div>

            <!-- 顶部：上上籤 -->
            <div class="talisman-badge-wrap">
              <div class="talisman-badge">上上籤</div>
            </div>

            <!-- 底部：祝福语 -->
            <div class="talisman-blessing-wrap">
              <p class="talisman-blessing">{{ getTalismanBlessing() }}</p>
            </div>
          </div>

          <!-- 底部赛博信息 + 二维码 -->
          <div class="talisman-footer">
            <div class="footer-left">
              <span class="cyber-stamp">[ SYSTEM: CYBER ZEN ]</span>
              <span class="cyber-date">{{ currentDate }}</span>
            </div>
            <div class="qr-code-box" v-if="qrcodeUrl">
              <img :src="qrcodeUrl" alt="QR Code" />
              <span class="qr-hint">扫码云游</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载状态 -->
  <div v-else class="loading-page">
    <div class="loading-spinner">🏮</div>
    <p>正在加载寺庙信息…</p>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlessingStore } from '../store/blessing.js'
import { levelConfig, loadTemples } from '../data/temples.js'
import { handleImageError } from '../utils/imageErrorHandler.js'
import QRCode from 'qrcode'
const route = useRoute()
const router = useRouter()
const store = useBlessingStore()

const temple = computed(() => store.getTempleById(route.params.id))
const isLoading = ref(true)
const loadError = ref('')
const posterCaptureRef = ref(null)
const isHeroImageLoaded = ref(false)

// 海报弹窗状态
const showPosterModal = ref(false)
const posterImage = ref('')
const posterError = ref('')
const isCraneFlying = ref(false)
const showShareHint = ref(false)

// 二维码
const qrcodeUrl = ref('')

// 生成二维码
const generateQRCode = async () => {
  try {
    const currentUrl = window.location.href
    qrcodeUrl.value = await QRCode.toDataURL(currentUrl, {
      width: 80,
      margin: 1,
      color: {
        dark: '#eab308',
        light: '#0f172a'
      }
    })
  } catch (err) {
    console.error('二维码生成失败', err)
  }
}


// 点击分享按钮：纸鹤飞出动画 + 生成海报
const handleShareClick = () => {
  if (isCraneFlying.value) return
  isCraneFlying.value = true
  // 动画 0.8s 后执行海报生成，1s 后重置纸鹤
  setTimeout(() => {
    openPosterModal()
  }, 350)
  setTimeout(() => {
    isCraneFlying.value = false
  }, 1000)
}

// 打开海报弹窗并生成
const openPosterModal = async () => {
  showPosterModal.value = true
  posterImage.value = ''
  posterError.value = ''
  // 每次抽签时清空旧文案，触发 getTalismanBlessing 重新随机抽取
  currentBlessingText.value = ''
  // 等待 DOM 更新 + 字体渲染
  await nextTick()
  setTimeout(generateTalisman, 500)
}

// 关闭海报弹窗
const closePosterModal = () => {
  showPosterModal.value = false
  posterImage.value = ''
  posterError.value = ''
  showShareHint.value = false
}

// 生成符箓海报
const generateTalisman = async () => {
  if (!posterCaptureRef.value || !temple.value) return
  try {
    // 确保字体加载完毕，防止海报乱码
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(posterCaptureRef.value, {
      backgroundColor: '#FADA60',
      scale: 2,
      useCORS: true,
      logging: false,
    })
    posterImage.value = canvas.toDataURL('image/png', 1.0)
    // 海报生成成功后，0.5s 后显示社交裂变引导（固定显示，不自动隐藏）
    setTimeout(() => {
      showShareHint.value = true
    }, 500)
  } catch (e) {
    console.error('符箓生成失败:', e)
    posterError.value = '神明显灵失败，请稍后再试 🙏'
  }
}

// 下载海报
const downloadPoster = () => {
  if (!posterImage.value) return
  const link = document.createElement('a')
  link.download = `${temple.value?.name || '祈福'}-上上签.png`
  link.href = posterImage.value
  link.click()
}

// 赛博禅意随机祝语词库
const blessingDictionary = {
  '求事业': [
    '贵人相助，事业腾达',
    '拨云见日，前程似锦',
    '平步青云，功名顺遂',
    '乘风破浪，所求皆愿'
  ],
  '求财': [
    '财源广进，八方来财',
    '紫气东来，富贵盈门',
    '金玉满堂，时来运转',
    '财运亨通，日进斗金'
  ],
  '求姻缘': [
    '良缘天成，佳偶早觅',
    '红鸾星动，情契三生',
    '桃花灼灼，花好月圆',
    '千里姻缘，心心相印'
  ],
  '求平安': [
    '岁岁平安，灾厄退散',
    '无灾无难，喜乐常伴',
    '福寿安康，逢凶化吉',
    '身心康泰，福泽绵长'
  ],
  '求学': [
    '金榜题名，独占鳌头',
    '文曲星临，才思泉涌',
    '拨云见日，学业有成',
    '茅塞顿开，前程似锦'
  ],
  '求健康': [
    '药师佛佑，身体康健',
    '百病不侵，元气充沛',
    '身心康泰，福泽绵长',
    '祛病消灾，延年益寿'
  ],
  '化太岁': [
    '太岁星君，诸事顺遂',
    '逢凶化吉，遇难呈祥',
    '星君庇佑，岁岁平安',
    '化解煞气，否极泰来'
  ],
  '求子': [
    '送子观音，早生贵子',
    '麒麟送子，人丁兴旺',
    '子嗣绵延，福泽深厚',
    '天赐麟儿，家门添喜'
  ],
  '综合祈福': [
    '诸神护佑，心想事成',
    '吉星高照，万事顺遂',
    '时和岁丰，百无禁忌',
    '福气绵绵，所愿皆得'
  ]
}

// 当前签文祝福语（每次抽签时随机生成）
const currentBlessingText = ref('')

// 获取符箓祝福语（基于寺庙最灵验领域 + 随机抽取）
const getTalismanBlessing = () => {
  // 如果已经有随机生成的文案，直接返回
  if (currentBlessingText.value) return currentBlessingText.value

  if (!temple.value) return '心诚则灵'
  const highlights = temple.value.highlights || {}
  const keys = Object.keys(highlights)
  if (keys.length === 0) {
    // 无领域信息，从综合祈福中随机抽取
    const phrases = blessingDictionary['综合祈福']
    return phrases[Math.floor(Math.random() * phrases.length)]
  }

  // 找到等级最高的领域
  const bestKey = keys.reduce((best, key) => {
    const level = highlights[key].level
    const levelScore = { '极度灵验': 3, '非常灵验': 2, '颇为灵验': 1 }
    const bestLevel = highlights[best].level
    return (levelScore[level] || 0) > (levelScore[bestLevel] || 0) ? key : best
  }, keys[0])

  // 根据领域从词库中随机抽取一句
  const phrases = blessingDictionary[bestKey] || blessingDictionary['综合祈福']
  return phrases[Math.floor(Math.random() * phrases.length)]
}

// 确保寺庙数据已加载（支持直接 URL 访问）
onMounted(async () => {
  // 生成二维码
  generateQRCode()
  
  try {
    await loadTemples()
    // 数据加载完成后，检查 temple 是否存在
    if (!temple.value) {
      loadError.value = '未找到该寺庙信息'
      // 3秒后自动返回首页
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  } catch (e) {
    console.error('[TempleDetailPage] 加载数据失败:', e)
    loadError.value = '数据加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  // 释放音频资源
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
  // 清理敬香计时器
  if (incenseTimer) {
    clearInterval(incenseTimer)
    incenseTimer = null
  }
  // 清理烟雾生成器
  if (smokeTimer) {
    clearInterval(smokeTimer)
    smokeTimer = null
  }
  // 清理所有烟雾粒子的 setTimeout
  smokeTimers.forEach(timer => clearTimeout(timer))
  smokeTimers.length = 0
  // 清理功德浮动文字的 setTimeout
  meritTimers.forEach(timer => clearTimeout(timer))
  meritTimers.length = 0
})

// 赛博上香状态
const isBurning = ref(false)
const incenseSeconds = ref(0)
let incenseTimer = null
let smokeTimer = null
const knockCount = ref(0)
const isHitting = ref(false)
const blessingMessage = ref('')
const blessingKey = ref(0)
const meritFloats = ref([])
const smokeList = reactive([])
let meritId = 0
let smokeId = 0
const smokeTimers = [] // 存储所有烟雾粒子的 setTimeout，用于清理
const meritTimers = [] // 存储功德浮动文字的 setTimeout，用于清理

// 敬香计时器显示
const incenseTimerDisplay = computed(() => {
  const m = String(Math.floor(incenseSeconds.value / 60)).padStart(2, '0')
  const s = String(incenseSeconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

// 音频上下文（延迟初始化，确保在用户首次点击后才创建）
let audioCtx = null
let audioInitialized = false

const initAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  audioInitialized = true
  return audioCtx
}

const getAudioCtx = () => {
  // 如果尚未初始化，返回 null，由调用方处理
  return audioCtx
}

const getTagColor = (tag) => store.tagConfig[tag]?.color || '#fff'

const getTagIcon = (tag) => store.tagConfig[tag]?.icon || ''

const getLevelIcon = (level) => {
  return levelConfig[level]?.icon || '✨'
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else if (temple.value) {
    router.push(`/city/${encodeURIComponent(temple.value.city)}`)
  } else {
    router.push('/')
  }
}

// 木鱼音效（必须在用户点击/触摸事件中调用）
const playWoodenFishSound = async () => {
  try {
    // 首次点击时初始化 AudioContext
    const ctx = audioInitialized ? getAudioCtx() : initAudioContext()
    if (!ctx) return
    // 确保 AudioContext 在用户手势后恢复（浏览器自动播放策略）
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch (e) {
    // 音频播放失败静默处理
  }
}

// 敲木鱼（物理打击感 + 功德漂浮）
const hitWoodenFish = () => {
  knockCount.value++
  isHitting.value = true
  playWoodenFishSound()

  // 150ms 后重置，支持连续快速点击（连击）
  setTimeout(() => {
    isHitting.value = false
  }, 150)

  // 生成功德漂浮
  const id = meritId++
  const x = 30 + Math.random() * 40
  meritFloats.value.push({ id, x })
  const timer = setTimeout(() => {
    meritFloats.value = meritFloats.value.filter(m => m.id !== id)
  }, 1000)
  meritTimers.push(timer)

  // 每敲3下显示祝福语
  if (knockCount.value % 3 === 0) {
    showBlessing()
  }
}

// 点燃 / 熄灭香
const toggleIncense = () => {
  if (isBurning.value) {
    // 熄灭
    isBurning.value = false
    clearInterval(incenseTimer)
    clearInterval(smokeTimer)
    incenseTimer = null
    smokeTimer = null
    // 清除残留烟雾
    smokeList.splice(0, smokeList.length)
  } else {
    // 点燃
    isBurning.value = true
    incenseSeconds.value = 0
    incenseTimer = setInterval(() => {
      incenseSeconds.value++
    }, 1000)
    // 启动烟雾粒子生成器（每 400ms 生成一缕）
    spawnSmoke() // 立即生成第一缕
    smokeTimer = setInterval(spawnSmoke, 400)
    showBlessing()
  }
}

// 生成单缕烟雾粒子
const spawnSmoke = () => {
  const id = smokeId++
  smokeList.push({
    id,
    drift: Math.floor(Math.random() * 60 - 30) + 'px',  // -30px ~ +30px 随机飘散
    delay: (Math.random() * 0.5).toFixed(2) + 's',       // 0 ~ 0.5s 随机延迟
    scale: Math.random() * 0.5 + 0.5,                     // 0.5 ~ 1.0 随机大小
  })
  // 3 秒后移除（与动画时长一致）
  const timer = setTimeout(() => {
    const idx = smokeList.findIndex(s => s.id === id)
    if (idx > -1) smokeList.splice(idx, 1)
  }, 3000)
  smokeTimers.push(timer)
}

// 祝福语
const blessings = [
  '🙏 心誠則靈，所求皆如願',
  '✨ 善念善行，福報自來',
  '🏮 福運亨通，吉祥如意',
  '🪷 菩薩保佑，出入平安',
  '💫 功德圓滿，萬事順遂',
  '🌟 心懷善念，好運連連',
  '🕊️ 慈悲為懷，福慧雙修',
  '🔥 誠心祈福，靈驗非凡',
]

const showBlessing = () => {
  blessingKey.value++
  blessingMessage.value = blessings[Math.floor(Math.random() * blessings.length)]
  setTimeout(() => {
    blessingMessage.value = ''
  }, 3000)
}

// 日期
const currentDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})

// 海报主标题逐字拆分（竖排渲染用）
const templeNameChars = computed(() => {
  return (temple.value?.name || '').split('')
})
</script>

<style scoped>
/* ── 赛博禅意骨架屏 ── */
.cyber-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #0a0a0a;
  overflow: hidden;
}

.cyber-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #0a0a0a 25%, #1a1500 50%, #0a0a0a 75%);
  background-size: 400% 100%;
  animation: cyber-skeleton-loading 1.5s ease-in-out infinite;
  z-index: 1;
}

@keyframes cyber-skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.cyber-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.4s ease-out;
  position: relative;
  z-index: 2;
}

.cyber-image-wrapper img.is-loaded {
  opacity: 1;
}

/* ── 全息噪点材质 ── */
.noise-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  animation: noiseShift 0.5s steps(10) infinite;
}
@keyframes noiseShift {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-2%, -2%); }
  20% { transform: translate(2%, 1%); }
  30% { transform: translate(-1%, 2%); }
  40% { transform: translate(1%, -1%); }
  50% { transform: translate(-2%, 1%); }
  60% { transform: translate(2%, -2%); }
  70% { transform: translate(-1%, -1%); }
  80% { transform: translate(1%, 2%); }
  90% { transform: translate(-2%, -1%); }
}

.detail-page {
  min-height: 100vh;
  background: #000;
  position: relative;
}

/* ── 英雄区 ── */
.hero-section {
  position: relative;
  height: 420px;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
}
.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.placeholder-char {
  font-size: 120px;
  font-weight: 300;
  color: rgba(255, 180, 50, 0.15);
  text-shadow: 0 0 60px rgba(255, 180, 50, 0.08);
  user-select: none;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #FFF;
  border-radius: 0;
  padding: 10px 20px;
  color: #FFF;
  font-size: 14px;
  transition: all 0.3s;
  z-index: 10;
}
.back-btn:hover {
  background: #FFF;
  color: #000;
  border-color: #FFF;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.hero-tag {
  padding: 4px 14px;
  border: 2px solid #FFF;
  border-radius: 0;
  font-size: 13px;
  background: transparent;
  color: #FFF;
}

.title-with-seal {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}
.hero-title {
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 900;
  color: #FFF;
  text-shadow: 3px 3px 0 #000;
  letter-spacing: 4px;
  line-height: 1.2;
  flex: 1;
}

/* ── 赛博印章 ── */
.cyber-seal {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.seal-stamp {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(200, 50, 50, 0.9) 0%, rgba(150, 30, 30, 0.95) 100%);
  border: 2px solid rgba(255, 200, 150, 0.6);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 10px rgba(200, 50, 50, 0.4),
    inset 0 0 8px rgba(0, 0, 0, 0.3);
  position: relative;
  transform: rotate(-3deg);
}
.seal-stamp::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(255, 200, 150, 0.4);
  border-radius: 2px;
}
.seal-char {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 900;
  color: rgba(255, 220, 180, 0.95);
  text-shadow: 0 0 4px rgba(255, 150, 100, 0.5);
  letter-spacing: 0;
}
.seal-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.seal-barcode {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  line-height: 1;
}
.seal-coords {
  font-family: var(--font-pixel);
  font-size: 9px;
  color: rgba(0, 255, 204, 0.6);
  letter-spacing: 1px;
  line-height: 1;
}

.hero-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.hero-brief {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
}

/* ── 主内容 ── */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

.section {
  margin-top: 40px;
}

.section-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 700;
  color: #FFF;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
}

.section-desc {
  font-size: 14px;
  color: #999;
  margin-top: -12px;
  margin-bottom: 20px;
}

/* ── 灵验领域 ── */
.highlights-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── 赛博朋克霓虹光晕边框 ── */
.highlight-card {
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 4px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid var(--c-gold);
  box-shadow:
    /* 内发光 - 暗金色 */
    inset 0 0 20px rgba(200, 170, 100, 0.08),
    inset 0 0 40px rgba(200, 170, 100, 0.03),
    /* 外发光 - 幽冷青蓝 */
    0 0 15px rgba(0, 255, 204, 0.1),
    0 0 30px rgba(0, 200, 255, 0.05),
    /* 底部阴影 */
    0 4px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.highlight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 100, 0.4) 20%, 
    rgba(200, 170, 100, 0.6) 50%, 
    rgba(200, 170, 100, 0.4) 80%, 
    transparent 100%
  );
}
.highlight-card:hover {
  border-color: rgba(0, 255, 204, 0.3);
  border-left-color: var(--c-gold);
  box-shadow:
    inset 0 0 30px rgba(200, 170, 100, 0.12),
    inset 0 0 60px rgba(200, 170, 100, 0.05),
    0 0 25px rgba(0, 255, 204, 0.2),
    0 0 50px rgba(0, 200, 255, 0.1),
    0 8px 30px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}
.highlight-card.极度灵验 {
  border-left-color: #FFF;
  box-shadow:
    inset 0 0 30px rgba(255, 255, 255, 0.1),
    0 0 20px rgba(255, 255, 255, 0.15),
    0 0 40px rgba(200, 170, 100, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.4);
}
.highlight-card.非常灵验 {
  border-left-color: var(--c-gold);
  box-shadow:
    inset 0 0 25px rgba(200, 170, 100, 0.1),
    0 0 20px rgba(200, 170, 100, 0.15),
    0 0 35px rgba(0, 255, 204, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.4);
}
.highlight-card.颇为灵验 {
  border-left-color: rgba(100, 150, 180, 0.6);
  box-shadow:
    inset 0 0 15px rgba(100, 150, 180, 0.05),
    0 0 15px rgba(100, 150, 180, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.4);
}

.hl-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.hl-name {
  font-size: 18px;
  font-weight: 700;
  color: #FFF;
}

.hl-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-pixel);
  font-size: 12px;
  padding: 4px 12px;
  border: 2px solid #FFF;
  border-radius: 0;
  font-weight: 600;
  background: transparent;
  color: #FFF;
}
.hl-badge.极度灵验 {
  background: #FFF;
  color: #000;
}
.hl-badge.非常灵验 {
  background: var(--c-red);
  color: #FFF;
  border-color: var(--c-red);
}
.hl-badge.颇为灵验 {
  background: transparent;
  color: #999;
}

.badge-icon {
  font-size: 14px;
}

.hl-desc {
  font-size: 14px;
  color: #999;
  line-height: 1.7;
}

/* ── 历史故事 ── */
.history-content {
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 4px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 0 25px rgba(200, 170, 100, 0.06),
    0 0 15px rgba(0, 255, 204, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}
.history-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 100, 0.4) 30%, 
    rgba(200, 170, 100, 0.6) 50%, 
    rgba(200, 170, 100, 0.4) 70%, 
    transparent 100%
  );
}
.history-content p {
  font-size: 15px;
  color: #CCC;
  line-height: 2;
  text-indent: 2em;
}

/* ── 实用信息 ── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-card {
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 4px;
  padding: 18px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 0 20px rgba(200, 170, 100, 0.06),
    0 0 12px rgba(0, 255, 204, 0.08),
    0 4px 15px rgba(0, 0, 0, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(200, 170, 100, 0.3) 50%, 
    transparent 100%
  );
}
.info-card:hover {
  border-color: rgba(0, 255, 204, 0.25);
  box-shadow:
    inset 0 0 30px rgba(200, 170, 100, 0.1),
    0 0 20px rgba(0, 255, 204, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.info-card-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.info-card-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-card-value {
  font-size: 16px;
  font-weight: 600;
  color: #FFF;
}

.tips-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: #111;
  border: 2px solid #FFF;
  border-radius: 0;
}

.tips-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tips-text {
  font-size: 14px;
  color: #CCC;
  line-height: 1.7;
}

/* ── 赛博上香与功德木鱼 ── */
.cyber-section {
  text-align: center;
}

.cyber-area {
  background: rgba(17, 17, 17, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

/* ── 赛博香炉 ── */
.incense-altar {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.censer {
  position: relative;
  width: 160px;
  height: 144px;
}

.censer-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 15px rgba(250, 218, 96, 0.15));
}

/* ── 线香（从炉口伸出） ── */
.incense-sticks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.incense-stick {
  position: absolute;
  bottom: 38%;          /* 对齐炉口位置（炉口在 SVG 中约 cy=80/180≈44%，容器 padding 后约 38%） */
  width: 2px;
  height: 55px;          /* 默认高度，由 inline style 覆盖 */
  background: linear-gradient(to top, rgba(255,255,255,0.15), rgba(255,255,255,0.6));
  border-radius: 1px 1px 0 0;
}

.incense-stick.burning .stick-body {
  background: linear-gradient(to top, rgba(255,200,100,0.2), rgba(255,180,80,0.7));
}

/* 香头火焰 */
.stick-flame {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 10px;
  background: radial-gradient(ellipse, #ff8800, #ff4400, transparent);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: flameFlicker 0.4s ease-in-out infinite alternate;
  box-shadow: 0 0 6px rgba(255, 100, 0, 0.7), 0 0 14px rgba(255, 60, 0, 0.35), 0 -4px 10px rgba(255, 150, 0, 0.2);
}

@keyframes flameFlicker {
  0% { transform: translateX(-50%) scale(0.8); opacity: 0.7; }
  50% { transform: translateX(-50%) scale(1.1) translateY(-1px); opacity: 1; }
  100% { transform: translateX(-50%) scale(0.9); opacity: 0.85; }
}

/* 烟雾容器（覆盖香炉上方区域） */
.smoke-container {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 120px;
  pointer-events: none;
  overflow: visible;
}

/* 单缕烟雾粒子 */
.smoke-puff {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, rgba(0, 255, 204, 0.5) 0%, rgba(200, 220, 255, 0.15) 40%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transform: translateX(-50%) scale(var(--smoke-scale, 1));
  animation: rise-and-drift 3s ease-out forwards;
  will-change: transform, opacity;
}

/* S 形上升 + 左右摇曳 */
@keyframes rise-and-drift {
  0% {
    opacity: 0;
    transform: translate(-50%, 0) scale(1);
  }
  15% {
    opacity: 0.7;
    transform: translate(calc(-50% + var(--drift) * 0.15), -15px) scale(1.3);
  }
  40% {
    opacity: 0.5;
    transform: translate(calc(-50% - var(--drift) * 0.1), -40px) scale(2);
  }
  65% {
    opacity: 0.3;
    transform: translate(calc(-50% + var(--drift) * 0.5), -65px) scale(2.8);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--drift)), -100px) scale(4);
  }
}

/* ── 木鱼区域（图层分离） ── */
.muyu-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.muyu-container {
  position: relative;
  width: 180px;
  height: 140px;
}

/* 木鱼本体 */
.muyu-body {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.muyu-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 12px rgba(0, 255, 204, 0.12));
}

/* 木鱼本体受力回弹 */
.is-hitting .muyu-body {
  animation: body-bounce 0.15s ease-in-out;
}

@keyframes body-bounce {
  0% { transform: scale(1) translateY(0); }
  60% { transform: scale(0.95) translateY(2px); }
  80% { transform: scale(1.02) translateY(-1px); }
  100% { transform: scale(1) translateY(0); }
}

/* 棒槌（独立图层） */
.muyu-mallet {
  position: absolute;
  top: -10px;
  right: -15px;
  width: 60px;
  height: 90px;
  z-index: 2;
  transform-origin: 80% 95%; /* 固定在手柄底部（右下） */
  transition: transform 0.05s;
}

.mallet-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 6px rgba(0, 255, 204, 0.1));
}

/* 棒槌三段式敲击动画 */
.is-hitting .muyu-mallet {
  animation: mallet-strike 0.15s ease-in-out;
}

@keyframes mallet-strike {
  0% { transform: rotate(0deg); }
  35% { transform: rotate(-50deg); }   /* 向后高高抬起 */
  65% { transform: rotate(12deg); }    /* 用力砸下接触木鱼 */
  100% { transform: rotate(0deg); }    /* 弹回原位 */
}

.muyu-label {
  font-family: var(--font-serif);
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  letter-spacing: 4px;
}

/* ── 功德漂浮 ── */
.muyu-container .merit-plus {
  position: absolute;
  bottom: 50%;
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--c-gold);
  white-space: nowrap;
  animation: meritFloat 1.2s ease-out forwards;
  text-shadow: 0 0 8px rgba(250, 218, 96, 0.4);
}

@keyframes meritFloat {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-60px); }
}

/* ── 数据展示 ── */
.cyber-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 28px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-family: var(--font-pixel);
  font-size: 28px;
  font-weight: 900;
  color: #fff;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  letter-spacing: 2px;
}

/* ── 毛玻璃按钮 ── */
.cyber-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.cyber-btn {
  padding: 12px 32px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  color: #ccc;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.glass-btn:hover {
  border-color: rgba(250, 218, 96, 0.5);
  color: var(--c-gold);
  box-shadow: 0 0 12px rgba(250, 218, 96, 0.15);
}

.glass-btn:active {
  transform: scale(0.97);
}

/* ── 祝福语 ── */
.blessing-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  font-family: var(--font-serif);
  font-size: 18px;
  color: var(--c-gold);
  text-shadow: 0 0 12px rgba(250, 218, 96, 0.3);
  animation: fadeIn 0.3s ease-out;
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: 2px;
}

/* ── 分享海报 ── */
.share-section {
  text-align: center;
}

.poster-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.share-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0, 20, 20, 0.8);
  color: #00ffff;
  padding: 14px 36px;
  border: 1.5px solid rgba(0, 255, 255, 0.5);
  border-radius: 2px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  box-shadow:
    0 0 10px rgba(0, 255, 255, 0.15),
    inset 0 0 15px rgba(0, 255, 255, 0.05);
}
.share-btn:hover {
  background: rgba(0, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.9);
  box-shadow:
    0 0 25px rgba(0, 255, 255, 0.3),
    0 0 50px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
  color: #fff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
}

/* ── 折纸鹤图标（赛博霓虹） ── */
.crane-icon {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: #00ffff;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8));
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

/* 点击后纸鹤飞出动画 */
.share-btn.flying .crane-icon {
  animation: craneFlyOut 0.8s cubic-bezier(0.4, 0, 0.6, 1) forwards;
  filter: drop-shadow(0 0 16px rgba(0, 255, 255, 1)) drop-shadow(0 0 30px rgba(0, 255, 255, 0.5));
}

@keyframes craneFlyOut {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
  60% {
    transform: translate(80px, -120px) scale(1.4) rotate(12deg);
    opacity: 1;
  }
  100% {
    transform: translate(140px, -200px) scale(1.6) rotate(18deg);
    opacity: 0;
  }
}

/* 按钮文字在飞出时轻微上浮 */
.share-btn.flying .share-btn-text {
  animation: textFloat 0.8s ease-out forwards;
}

@keyframes textFloat {
  0% { transform: translateY(0); }
  40% { transform: translateY(-3px); }
  100% { transform: translateY(0); opacity: 1; }
}

.share-tip {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

/* ═══════════════════════════════════════════════════════════════
   符箓海报弹窗 & 海报样式
   ═══════════════════════════════════════════════════════════════ */

/* ── 弹窗遮罩 ── */
.poster-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.poster-modal {
  background: #111;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.15);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 2px solid #FFF;
  color: #FFF;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}
.modal-close:hover {
  background: #FFF;
  color: #000;
}

/* ── 海报预览区域 ── */
.poster-preview-area {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-bottom: 20px;
}

.poster-result {
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 100%;
  flex: 1;
  min-height: 0;
  object-fit: contain;
  display: block;
}

.poster-generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #999;
  flex: 1;
  min-height: 0;
}

.generating-icon {
  font-size: 48px;
  animation: lanternSwing 2s ease-in-out infinite;
}

/* ── 弹窗操作按钮 ── */
.poster-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.download-btn {
  background: #FFF;
  color: #000;
  padding: 14px 32px;
  border: 2px solid #FFF;
  border-radius: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
}
.download-btn:hover:not(.disabled) {
  background: transparent;
  color: #FFF;
}
.download-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: #999;
  padding: 12px 32px;
  border: 1px solid #333;
  border-radius: 0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}
.cancel-btn:hover {
  border-color: #FFF;
  color: #FFF;
}

/* ── 社交裂变引导提示条 ── */
.share-hint-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  margin-top: 16px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* ── 操作按钮图标 ── */
.action-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #D4AF37;
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.6));
  display: inline-block;
  vertical-align: middle;
}

.share-hint-icon {
  font-size: 16px;
}

.share-hint-text {
  color: #FFD700;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

/* 呼吸闪烁动画 */
.share-hint-pulse {
  position: absolute;
  inset: -2px;
  border-radius: 30px;
  border: 2px solid transparent;
  animation: hintPulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes hintPulse {
  0%, 100% {
    border-color: rgba(255, 215, 0, 0);
    box-shadow: 0 0 0 rgba(255, 215, 0, 0);
  }
  50% {
    border-color: rgba(255, 215, 0, 0.6);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
  }
}

/* 滑入动画 */
.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-leave-active {
  transition: all 0.3s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ═══════════════════════════════════════════════════════════════
   符箓海报样式（用于 html2canvas 截图）
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   上上籤海报 — 道教符箓风格（参考天官赐福符）
   ═══════════════════════════════════════════════════════════════ */

.talisman-poster {
  width: 400px;
  height: 700px;
  position: relative;
  overflow: hidden;
}

.poster-template-container {
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 400px;
  height: 700px;
  z-index: -1;
  opacity: 1;
  visibility: visible;
}

/* ── 容器：黄纸底 + 纸张纹理 ── */
.talisman-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #E8C547;
  background-image:
    radial-gradient(circle at 50% 50%, transparent 30%, rgba(180, 120, 40, 0.2) 150%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 纸质纤维纹理 */
.talisman-texture {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(139, 90, 20, 0.03) 2px, rgba(139, 90, 20, 0.03) 3px
    ),
    repeating-linear-gradient(
      90deg, transparent, transparent 2px,
      rgba(139, 90, 20, 0.03) 2px, rgba(139, 90, 20, 0.03) 3px
    );
  pointer-events: none;
}

/* 边缘泛旧暗角 */
.talisman-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 35%, rgba(100, 50, 0, 0.25) 100%);
  pointer-events: none;
  z-index: 1;
}

/* ── 中央符箓主体 ── */
.talisman-body {
  position: relative;
  width: 280px;
  height: 520px;
  z-index: 2;
}

/* ── 云纹边框（双线 + 如意云头） ── */
.talisman-border {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(184, 27, 27, 0.7);
  border-radius: 8px;
}

.talisman-border::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(184, 27, 27, 0.4);
  border-radius: 6px;
}

/* 顶部云纹装饰 */
.cloud-top {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  background: #E8C547;
  border-radius: 50%;
  border-top: 2px solid rgba(184, 27, 27, 0.7);
}

.cloud-top::before,
.cloud-top::after {
  content: '';
  position: absolute;
  top: 4px;
  width: 24px;
  height: 14px;
  border: 2px solid rgba(184, 27, 27, 0.5);
  border-bottom: none;
  border-radius: 50% 50% 0 0;
  background: #E8C547;
}
.cloud-top::before { left: -8px; }
.cloud-top::after { right: -8px; }

/* 底部灵芝纹装饰 */
.cloud-bottom {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 18px;
  background: #E8C547;
  border-radius: 0 0 50% 50%;
  border-bottom: 2px solid rgba(184, 27, 27, 0.7);
  border-left: 2px solid rgba(184, 27, 27, 0.5);
  border-right: 2px solid rgba(184, 27, 27, 0.5);
}

/* ── 四方印章圆（天官賜福） ── */
.seal-circle {
  position: absolute;
  width: 36px;
  height: 36px;
  border: 2px solid rgba(184, 27, 27, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "FZShuTi", "STXingkai", "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: 16px;
  font-weight: 700;
  color: rgba(184, 27, 27, 0.7);
  background: rgba(184, 27, 27, 0.05);
  z-index: 3;
}
.seal-tr { top: 16px; right: 16px; }
.seal-br { bottom: 16px; right: 16px; }
.seal-bl { bottom: 16px; left: 16px; }
.seal-tl { top: 16px; left: 16px; }

/* ── 中央竖排区域 ── */
.talisman-center {
  position: absolute;
  top: 50px;
  bottom: 50px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 2;
}

/* 两侧副文 */
.talisman-flank {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.talisman-flank span {
  font-family: "FZShuTi", "STXingkai", "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: 16px;
  color: rgba(184, 27, 27, 0.65);
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 4px;
}

/* 中间主标题（逐字竖排） */
.talisman-main-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.talisman-main-text span {
  font-family: "FZShuTi", "STXingkai", "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: 48px;
  font-weight: 900;
  color: rgba(184, 27, 27, 0.85);
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 8px;
  line-height: 1.15;
  text-shadow: 0px 0px 1px rgba(184, 27, 27, 0.3);
}

/* ── 顶部：上上籤 ── */
.talisman-badge-wrap {
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.talisman-badge {
  font-family: "FZShuTi", "STXingkai", "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: 18px;
  font-weight: 700;
  color: rgba(184, 27, 27, 0.8);
  letter-spacing: 6px;
  border-bottom: 1px solid rgba(184, 27, 27, 0.4);
  padding-bottom: 4px;
}

/* ── 底部：祝福语 ── */
.talisman-blessing-wrap {
  position: absolute;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  text-align: center;
}

.talisman-blessing {
  font-family: "FZShuTi", "STXingkai", "Kaiti SC", "STKaiti", "KaiTi", serif;
  font-size: 15px;
  color: rgba(184, 27, 27, 0.7);
  letter-spacing: 3px;
  white-space: nowrap;
}

/* ── 底部赛博信息 ── */
.talisman-footer {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 2;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cyber-stamp {
  font-family: 'VT323', 'Press Start 2P', monospace;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.18);
  letter-spacing: 2px;
}

.cyber-date {
  font-family: 'VT323', 'Press Start 2P', monospace;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.15);
  letter-spacing: 3px;
}

/* ── 二维码 ── */
.qr-code-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.qr-code-box img {
  width: 50px;
  height: 50px;
  opacity: 0.7;
}

.qr-hint {
  font-family: 'Noto Serif SC', serif;
  font-size: 9px;
  color: rgba(0, 0, 0, 0.35);
  letter-spacing: 1px;
}

/* ── 加载页 ── */
.loading-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #999;
}

.loading-spinner {
  font-size: 48px;
  animation: fadeIn 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── 响应式 ── */
@media (max-width: 640px) {
  .hero-section {
    height: 340px;
  }
  .hero-title {
    font-size: 28px;
    letter-spacing: 2px;
  }
  .hero-brief {
    font-size: 14px;
  }
}
</style>
