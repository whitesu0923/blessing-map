<template>
  <div class="search-page">
    <!-- 地图容器 -->
    <div ref="mapRef" class="map-container home-map-container"></div>

    <!-- 顶部搜索面板 -->
    <div class="search-panel" :class="{ collapsed: isSearchCollapsed }">
      <!-- 标题区 -->
      <div class="panel-header">
        <div class="brand">
          <button class="home-link" @click="goHome">
            <span>🏮</span>
            <span class="brand-title">中国祈福地图</span>
          </button>
          <span class="brand-sub">搜索寺庙</span>
        </div>
      </div>

      <!-- 搜索区域 -->
      <transition name="slide-up">
        <div v-show="!isSearchCollapsed" class="search-body">
          <!-- 搜索输入框 -->
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="store.searchKeyword"
              type="text"
              placeholder="搜索城市、寺庙、心愿，如：杭州、财、灵隐寺…"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
              @keydown.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>

          <!-- 搜索建议 -->
          <transition name="slide-up">
            <div v-if="showSuggestions && store.searchSuggestions.length" class="suggestions">
              <div
                v-for="item in store.searchSuggestions"
                :key="item.type + item.value"
                class="suggestion-item"
                @mousedown.prevent="selectSuggestion(item)"
              >
                <span>{{ item.type === 'city' ? '📍' : item.type === 'temple' ? '🏮' : '✨' }}</span>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </transition>

          <!-- 选择心愿签文（8大分类） -->
          <div class="tags-section">
            <div class="tags-label">✨ 选择心愿签文</div>
            <div class="tags-grid">
              <button
                v-for="cat in store.categories"
                :key="cat.key"
                class="tag-btn"
                :class="{ active: store.selectedCategory === cat.key }"
                :style="store.selectedCategory === cat.key ? { borderColor: cat.color, boxShadow: `0 0 15px ${cat.color}40` } : {}"
                @click="toggleCategory(cat.key)"
              >
                <span class="tag-icon">
                  <!-- 综合祈福：福寿双全 SVG -->
                  <svg v-if="cat.icon === 'shou'" class="cyber-shou" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em">
                    <path d="M1024 634.88c-2.56 0-107.52 81.92-243.2 66.56 15.36-12.8 35.84-35.84 51.2-79.36 104.96-2.56 166.4 7.68 192 12.8z" fill="currentColor"/>
                    <path d="M762.88 696.32c-15.36-20.48-35.84-38.4-64-46.08 66.56-61.44 81.92-133.12 76.8-186.88 30.72-28.16 51.2-71.68 64-99.84 25.6 245.76-56.32 317.44-76.8 332.8zM829.44 345.6c-10.24 25.6-28.16 69.12-56.32 97.28-5.12-20.48-10.24-35.84-20.48-48.64 0 0 0-2.56-2.56-2.56 28.16-2.56 58.88-28.16 79.36-46.08z" fill="currentColor"/>
                    <path d="M706.56 307.2c2.56 17.92 10.24 69.12 33.28 99.84 23.04 28.16 48.64 143.36-61.44 240.64h-5.12l5.12-133.12c-5.12-84.48-46.08-128-76.8-145.92 35.84-51.2 87.04-61.44 104.96-61.44zM317.44 307.2c17.92 2.56 69.12 10.24 104.96 58.88-33.28 20.48-74.24 61.44-76.8 148.48l5.12 133.12h-5.12c-110.08-97.28-81.92-212.48-61.44-240.64 20.48-30.72 30.72-81.92 33.28-99.84zM271.36 396.8c-7.68 10.24-15.36 28.16-20.48 48.64-28.16-30.72-46.08-74.24-56.32-97.28 20.48 17.92 51.2 43.52 76.8 48.64 0-2.56 0 0 0 0z" fill="currentColor"/>
                    <path d="M184.32 363.52c12.8 28.16 33.28 71.68 64 99.84-5.12 53.76 12.8 125.44 76.8 186.88-28.16 7.68-48.64 25.6-64 46.08-17.92-12.8-102.4-84.48-76.8-332.8z" fill="currentColor"/>
                    <path d="M189.44 622.08c17.92 43.52 38.4 66.56 51.2 79.36-133.12 15.36-238.08-66.56-240.64-66.56 25.6-5.12 87.04-15.36 189.44-12.8zM7.68 657.92c35.84 23.04 130.56 71.68 245.76 56.32-5.12 12.8-7.68 28.16-7.68 40.96 2.56 33.28 20.48 69.12 58.88 99.84-61.44 2.56-245.76-10.24-296.96-197.12zM261.12 757.76c-2.56-46.08 30.72-84.48 81.92-94.72 107.52-23.04 153.6-61.44 168.96-76.8 15.36 15.36 64 53.76 168.96 76.8 51.2 10.24 84.48 48.64 81.92 94.72-2.56 61.44-69.12 135.68-250.88 156.16-179.2-20.48-248.32-94.72-250.88-156.16z" fill="currentColor"/>
                    <path d="M719.36 857.6c38.4-30.72 56.32-66.56 58.88-99.84 0-15.36-2.56-28.16-7.68-40.96 115.2 15.36 207.36-33.28 243.2-56.32-51.2 186.88-230.4 199.68-294.4 197.12zM560.64 363.52c-2.56 0-5.12-2.56-7.68-2.56 0-15.36 2.56-28.16 5.12-33.28v12.8c0 2.56 2.56 7.68 5.12 7.68 15.36 7.68 15.36-23.04 15.36-23.04 0-20.48 10.24-53.76 12.8-66.56 5.12-15.36-10.24-12.8-10.24-12.8 10.24-64-35.84-79.36-35.84-79.36 0-15.36-12.8-17.92-12.8-17.92 0-7.68-12.8-12.8-12.8-12.8 0-17.92-7.68-23.04-10.24-23.04-2.56 0-12.8 5.12-10.24 23.04 0 0-12.8 5.12-12.8 12.8 0 0-12.8 5.12-12.8 17.92 0 0-46.08 12.8-35.84 79.36 0 0-12.8 0-10.24 12.8 5.12 15.36 12.8 46.08 12.8 66.56 0 0 0 30.72 15.36 23.04 2.56-2.56 5.12-5.12 5.12-7.68V332.8c2.56 7.68 2.56 17.92 5.12 30.72H460.8c-5.12 0-97.28 20.48-104.96 148.48l5.12 128c107.52-28.16 143.36-71.68 143.36-71.68l7.68-5.12 5.12 7.68s35.84 43.52 143.36 71.68l5.12-128c-5.12-130.56-99.84-148.48-104.96-151.04z" fill="currentColor"/>
                  </svg>
                  <!-- 求财：金光扫过元宝 SVG -->
                  <div v-else-if="cat.icon === 'sycee'" class="cyber-gold-container">
                    <svg class="cyber-gold-sycee" viewBox="0 0 1371 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em">
                      <path d="M290.981889 949.452725a411.654435 74.547275 0 1 0 823.308871 0 411.654435 74.547275 0 1 0-823.308871 0Z" fill="#EE9D00"/>
                      <path d="M445.557856 926.704844a258.448823 46.866117 0 1 0 516.897646 0 258.448823 46.866117 0 1 0-516.897646 0Z" fill="#D37813"/>
                      <path d="M298.381802 824.476412c38.643992 37.821779 246.663776 119.768967 423.987624 105.243211s347.795924-64.406653 438.51338-154.850037 283.115201-493.327552 180.338628-655.577502C1280.103631 22.81914 1143.0682 97.640485 1061.943225 153.550941s-409.461868 246.663776-751.776375-16.444251C167.101859 27.478345 8.688901 18.159935 0.466775 187.809799c-10.688764 242.552713 164.442517 506.208883 297.915027 636.666613z" fill="#EEBA1C"/>
                      <path d="M1362.873032 328.956293c-30.147795 177.049777-139.77614 385.069562-201.990226 447.009577-69.065857 68.791786-184.723761 114.013479-313.537066 137.035431a422.891341 422.891341 0 0 0 246.663776-184.723761C1151.564397 630.434242 1171.57157 569.59051 1226.933884 408.436843c45.221692-131.554014 154.027825-196.782879 135.939148-79.48055z" fill="#DF9B1A"/>
                      <path d="M1209.393349 365.681789s-51.799393 135.116935-75.643558 211.856776-88.250818 237.345367-251.04891 309.700075a763.287352 763.287352 0 0 0 210.486422-294.626177c62.214086-164.990659 116.206046-226.930674 116.206046-226.930674z" fill="#DF9B1A"/>
                      <path d="M722.369426 929.719623c-176.227564 14.525756-385.343632-67.421432-423.987624-105.243211C178.338765 706.900012 24.036869 481.065622 2.933413 259.890436c-10.414693-114.013479 72.354708-109.628345 135.665077 82.221259 71.532495 217.612265 161.427738 356.292121 250.226697 442.624442a448.10586 448.10586 0 0 0 333.544239 144.983486z" fill="#F6DA66"/>
                      <path d="M1290.244253 182.054311c30.970007-74.821345-10.962834-114.835691-77.836125-103.598786h-4.385134a511.416229 511.416229 0 0 0-145.805698 73.999133C978.077541 211.379893 652.481357 400.214717 310.16685 137.10669a434.950458 434.950458 0 0 0-114.013479-64.954795h-1.370354c-36.177354-4.111063-68.791786 8.496197-65.777007 51.525322 7.948055 118.124542 222.271469 328.885035 550.06022 372.736373 304.218657 38.918062 577.741378-234.056516 611.178023-314.359279z" fill="#E19B18"/>
                      <path d="M1051.802603 265.919995c3.014779-29.325582-15.89611-54.814172-48.510543-76.739842-118.672683 64.680724-356.292121 150.464903-613.64466 0a118.946754 118.946754 0 0 0-9.592481 12.059118c-24.392307 35.629212-3.014779 160.331454 97.843298 242.552713a871.819413 871.819413 0 0 0 200.619872 50.70311 527.860481 527.860481 0 0 0 250.226697-31.518149 275.989358 275.989358 0 0 0 123.057817-197.05695z" fill="#C27618"/>
                      <path d="M1290.244253 182.054311c30.970007-74.821345-10.962834-114.835691-77.836125-103.598786h-4.385134A456.053915 456.053915 0 0 0 1088.528099 137.10669c37.821779-18.636819 98.939581-42.480984 125.524454-17.540536 40.014346 37.547708 31.518149 134.020652-191.849603 277.359713-219.25669 140.324282-567.600756 69.88807-743.82832-98.939581-92.08781-88.524889-101.406219-155.124108-67.147362-176.227565 23.844165-14.525756 69.88807 1.918496 118.672684 29.599653L310.16685 137.10669a434.950458 434.950458 0 0 0-114.013479-64.954795h-1.370354c-36.177354-4.111063-68.791786 8.496197-65.777007 51.525322 7.948055 118.124542 222.271469 328.885035 550.06022 372.736373 304.218657 38.918062 577.741378-234.056516 611.178023-314.359279z" fill="#DA8B0F"/>
                      <path d="M724.287923 390.622237c160.057384 6.851772 331.625743-74.821345 328.885034-157.590746S959.714793 4.730463 713.051017 0.071258c-239.537934-4.385134-367.529026 194.864383-334.366452 251.04891 41.110629 69.88807 147.450124 131.005872 345.603358 139.502069z" fill="#EEBA1C"/>
                      <path d="M548.6085 32.137549c-131.279943 57.828952-194.590312 177.323848-170.198006 219.25669a224.738107 224.738107 0 0 0 90.443385 82.221259 159.783313 159.783313 0 0 1-41.932842-104.96914C429.661746 109.699603 509.416366 60.092777 548.6085 32.137549z" fill="#F8E288"/>
                      <path d="M763.205985 390.622237c147.724195-6.30363 292.159539-82.221259 289.692901-157.590746-1.918496-57.006739-46.317976-144.435344-154.575966-194.316241a184.175619 184.175619 0 0 1 64.680724 160.331454c-8.770268 115.383833-130.731801 168.279509-199.797659 191.575533z" fill="#D66100"/>
                      <path d="M1290.244253 182.054311c-33.162574 80.302763-306.685295 353.551412-611.178023 313.811137C351.277479 453.110394 137.502206 240.979546 129.00601 123.129076c-1.644425 120.317109 164.442517  360.129113 548.141724 396.580537S1278.185135 246.735034 1290.244253 182.054311z" fill="#F8E288"/>
                      <path d="M378.684565 251.120168c41.110629 69.88807 153.479683 134.568793 348.344066 133.746581 160.331454 0 312.166712-73.999133 325.870255-151.561187a85.78418 85.78418 0 0 1-17.540535 51.251251c-31.244078 44.39948-112.094983 107.435778-304.766799 115.383834C436.513517 411.177552 378.684565 251.120168 378.684565 251.120168z" fill="#F5CE2E"/>
                      <path d="M378.684565 251.120168s57.828952 160.057384 351.906987 148.820479c191.849604-7.948055 274.070862-69.88807 304.766799-115.657904 0 0-46.043905 117.5764-311.61857 130.183659-302.02609 14.525756-345.055216-163.346234-345.055216-163.346234z" fill="#B45221"/>
                      <path d="M1235.704152 74.070391a100.035865 100.035865 0 0 1 105.791352 45.221693c102.776573 164.442517-89.347101 564.860047-180.338627 655.577502a383.699207 383.699207 0 0 1-91.813739 65.777007 480.994363 480.994363 0 0 0 103.050644-95.102589 1190.837897 1190.837897 0 0 0 179.516415-475.787017c11.236905-98.39144-13.155401-191.575533-116.206045-195.686596z" fill="#F6DA66"/>
                    </svg>
                    <div class="gold-sweep-light"></div>
                  </div>
                  <!-- 求平安：粉红莲花 SVG -->
                  <svg v-else-if="cat.icon === 'lotus'" class="cyber-pink-lotus" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em">
                    <path d="M512 650.3zM802.8 557.4c-0.7 0.6-1.3 1.2-2 1.9-82.2 71.5-186.8 108-284.3 107.6 60.2 61.1 150.4 83.8 251.5 83.8 103.6 0 195.9-41.4 256-105.9-53.3-57.4-131.9-82.4-221.2-87.4zM223.2 559.2c-0.7-0.6-1.3-1.2-2-1.9-89.3 5-167.9 30.1-221.2 87.3 60.1 64.6 152.4 105.9 256 105.9 101.1 0 191.3-22.7 251.5-83.8-97.4 0.6-202.1-36-284.3-107.5z" fill="currentColor"/>
                    <path d="M211.4 398.6c61.8-0.9 126.8 21.6 181.8 59.2-7.3-19.5-10.5-42.3-11.3-64.1-79.6-61.4-186.8-102.7-276.6-101.2-1.8 84.6 39.7 176 122 247.6 82 71.3 180.3 107.4 277.3 106.1-71.6 0.8-142.5-24.4-203-74.3-60.9-50.1-91.6-114-90.2-173.3zM642.1 393.8c-1.4 23.4-5.2 43.2-10.8 63.5 54.9-36.9 120.3-59.6 181.3-58.7 1.3 59.2-29.4 123.2-90.2 173.3-60.6 49.9-131.3 75.2-203 74.3 97.1 1.4 195.2-34.8 277.3-106.1 82.3-71.5 123.8-162.9 122-247.6-88.5-1.4-197.5 41.4-276.6 101.3z" fill="currentColor"/>
                    <path d="M413.8 499.4c0 51.1 38.4 96.6 98.2 126.2 59.8-29.6 98.2-75.2 98.2-126.2 0-51.1-38.4-96.6-98.2-126.2-59.8 29.6-98.2 75.2-98.2 126.2z" fill="currentColor"/>
                    <path d="M395.7 498.8c0-9.1 1.1-17.9 3.1-26.7-49.7-33.7-104.6-53.4-160.4-52.6-1.2 53.9 26.7 112.1 82.1 157.7 53.4 44 121 66.7 184.5 67.4-66.8-35.1-109.3-87.3-109.3-145.8zM625.2 472.3c1.9 8.7 3.1 17.5 3.1 26.5 0 58.4-42.5 110.7-109.3 145.8 63.5-0.7 131.1-23.4 184.4-67.4 55.3-45.6 83.3-103.8 82-157.7-54.8-0.8-110.6 19.8-160.2 52.8zM641.7 764.1c-47.3-13.6-88.9-35.6-122.3-68.4h-0.1s-3.9-3.5-7.3-8.3c0 0-1.6 2.3-4.8 5.7-0.2 0.2-0.4 0.3-0.5 0.5-0.9 0.9-1.8 1.9-2.9 2.9-0.2 0.2-0.3 0.2-0.5 0.3-33.1 32.1-74.3 53.8-121 67.3-2.2 6.7-3.6 13.6-3.6 20.6C378.7 833 430.8 876 512 904c81.2-28 133.3-71 133.3-119.2 0-7.1-1.4-14-3.6-20.7zM408 448.4c15.4-40.8 52.7-76.4 104-101.8 51.2 25.4 88.6 61 104 101.8h1c4.8-23.6 7.2-47.7 7.2-71.8 0-103.8-43.8-196.3-112.2-256.5-68.4 60.2-112.2 152.7-112.2 256.5 0 24.7 2.6 48.7 7.3 71.8h0.9z" fill="currentColor"/>
                  </svg>
                  <!-- 求健康：禅意葫芦 SVG -->
                  <svg v-else-if="cat.icon === 'gourd'" class="cyber-gourd" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em">
                    <path d="M516.59 876.59c-54.74 0-111.18-15.53-162.57-45.21-64.6-37.3-113.83-92.66-138.62-155.89-12.26-31.27-17.91-62.82-16.78-93.78 1.18-32.49 9.78-62.83 25.56-90.17 20.34-35.22 51.75-63.2 90.85-80.9 37.21-16.85 80.69-24.12 125.71-21.04 11.02 0.75 19.34 10.3 18.59 21.32s-10.3 19.35-21.32 18.59c-38.46-2.63-75.28 3.45-106.48 17.57-31.44 14.23-56.58 36.52-72.71 64.46-52.21 90.44-0.53 218.38 115.21 285.2 56.78 32.78 120.12 45.99 178.34 37.19 56.55-8.54 101.39-36.96 126.25-80.02 16.13-27.94 22.86-60.86 19.47-95.2-3.37-34.09-16.52-69.02-38.02-101-6.16-9.17-3.73-21.59 5.44-27.76 9.17-6.16 21.59-3.73 27.76 5.44 25.18 37.46 40.62 78.74 44.63 119.39 4.22 42.71-4.3 83.91-24.63 119.13-15.78 27.34-37.76 49.95-65.31 67.22-26.25 16.45-56.4 27.34-89.61 32.35-13.73 2.07-27.68 3.1-41.75 3.1z" fill="currentColor"/>
                    <path d="M715.36 577.45c-1.46 0-2.95-0.16-4.43-0.5-48.49-10.97-108.49-36.23-168.94-71.13s-112.33-74.23-146.07-110.74c-7.5-8.11-7-20.77 1.11-28.26 8.11-7.5 20.77-7 28.26 1.11 30.64 33.15 80.46 70.78 136.7 103.25 56.24 32.47 113.74 56.8 157.77 66.76 10.77 2.44 17.53 13.15 15.1 23.92-2.1 9.29-10.35 15.59-19.49 15.59zM475.71 368.1c-10.06 0-18.73-7.58-19.85-17.81-3.54-32.08 2.83-63.31 18.43-90.31 14.47-25.07 36.26-45.24 63.02-58.34 25.53-12.5 54.95-18.29 85.09-16.74 11.03 0.57 19.51 9.97 18.94 21-0.57 11.03-9.95 19.52-21 18.94-23.36-1.2-45.99 3.19-65.44 12.72-19.59 9.59-35.48 24.26-45.97 42.41-11.3 19.58-15.91 42.38-13.31 65.93 1.21 10.98-6.71 20.86-17.69 22.07-0.74 0.08-1.48 0.12-2.22 0.12zM711.23 504.05c-7.7 0-15.03-4.47-18.32-11.96-4.44-10.11 0.16-21.91 10.27-26.35 21.7-9.53 39.14-24.91 50.44-44.49 13.87-24.02 17.57-52 10.71-80.92-6.86-28.92-24.12-56.27-48.58-77.01-7.37-6.25-9.22-16.88-4.39-25.25l22.98-39.79-22.67-13.09L693 217.53c-5.52 9.57-17.76 12.84-27.32 7.32-9.57-5.52-12.84-17.75-7.32-27.32l25.76-44.61c3.45-5.97 9.02-10.25 15.68-12.03 6.66-1.79 13.62-0.87 19.6 2.58l47.22 27.26c12.33 7.12 16.57 22.95 9.45 35.28l-22.08 38.24c24.39 24.54 41.66 54.86 49.26 86.85 9.13 38.48 3.81 77.6-14.98 110.15-15.59 27.01-39.45 48.14-69 61.12a19.937 19.937 0 0 1-8.03 1.69z" fill="currentColor"/>
                    <path d="M520.81 717.83c-8.12 0-15.75-4.98-18.75-13.03-3.85-10.35 1.42-21.87 11.77-25.72 37.4-13.91 66.49-39.64 86.46-76.47 15.37-28.33 19.34-52.97 19.38-53.21 1.64-10.92 11.81-18.42 22.74-16.79 10.92 1.64 18.45 11.85 16.81 22.77-0.18 1.23-4.73 30.61-22.98 64.84-24.36 45.7-61.87 79.02-108.46 96.35-2.3 0.85-4.65 1.26-6.97 1.26z" fill="currentColor"/>
                    <path d="M499.05 631.37c-10.16 0-18.85-7.71-19.88-18.03-1.09-10.99 6.94-20.79 17.93-21.88 28.25-2.8 52.43-14.29 71.86-34.15 15-15.33 21.53-30.2 21.59-30.34l-0.04 0.1 36.89 15.46c-1.36 3.25-34.37 79.61-126.36 88.74-0.67 0.07-1.34 0.1-2 0.1z" fill="currentColor"/>
                  </svg>
                  <!-- 其他分类：Emoji 图标 -->
                  <template v-else>{{ cat.icon }}</template>
                </span>
                <span class="tag-text">{{ cat.key }}</span>
                <span class="tag-desc">{{ getCategoryCount(cat.key) }} 座</span>
              </button>
            </div>
          </div>

          <!-- 热门城市 -->
          <div class="hot-cities">
            <div class="tags-label">🔥 热门祈福城市</div>
            <div class="city-chips">
              <button
                v-for="city in hotCities"
                :key="city"
                class="city-chip"
                @click="goToCity(city)"
              >
                {{ city }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 赛博风格展开/收起按钮（紧贴面板底部） -->
      <button class="toggle-btn-cyber" @click="isSearchCollapsed = !isSearchCollapsed">
        <span class="toggle-text">{{ isSearchCollapsed ? '展开' : '收起' }}</span>
        <span class="toggle-arrow" :class="{ rotated: !isSearchCollapsed }">▼</span>
      </button>
    </div>

    <!-- 搜索无结果提示 -->
    <transition name="fade">
      <div v-if="showNoResult" class="no-result-toast">
        <span class="no-result-icon">🙏</span>
        <span>暂未收录该寺庙，佛渡有缘人</span>
      </div>
    </transition>

    <!-- 底部统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-num">{{ store.stats.totalTemples }}</span>
        <span class="stat-label">收录寺庙</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ store.stats.totalCities }}</span>
        <span class="stat-label">覆盖城市</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ store.stats.totalCategories }}</span>
        <span class="stat-label">祈福类型</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBlessingStore } from '../store/blessing.js'
import { temples, categories, loadTemples } from '../data/temples.js'

// 防抖工具函数
const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
import { useTempleMap } from '../composables/useTempleMap.js'

const router = useRouter()
const store = useBlessingStore()
const mapRef = ref(null)
const showSuggestions = ref(false)

// ── Loading 祥云：动态随机生成 ──
const clouds = ref([])

const generateClouds = () => {
  const count = 5 + Math.floor(Math.random() * 4) // 5~8 朵
  const noFlyZone = { leftMin: 30, leftMax: 70, topMin: 35, topMax: 65 }
  const palettes = [
    { fill: 'rgba(255,215,0,0.15)', stroke: 'rgba(255,215,0,0.5)', dotFill: 'rgba(255,215,0,0.3)' },
    { fill: 'rgba(255,215,0,0.10)', stroke: 'rgba(255,215,0,0.4)', dotFill: 'rgba(255,215,0,0.25)' },
    { fill: 'rgba(230,57,39,0.12)', stroke: 'rgba(230,57,39,0.45)', dotFill: 'rgba(230,57,39,0.25)' },
    { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.35)', dotFill: 'rgba(255,255,255,0.2)' },
  ]

  const result = []
  for (let i = 0; i < count; i++) {
    let left, top
    // 碰撞避免：确保不落入中心禁飞区
    let attempts = 0
    do {
      left = Math.random() * 90 + 5  // 5%~95%
      top = Math.random() * 80 + 5   // 5%~85%
      attempts++
    } while (
      left >= noFlyZone.leftMin && left <= noFlyZone.leftMax &&
      top >= noFlyZone.topMin && top <= noFlyZone.topMax &&
      attempts < 50
    )

    const palette = palettes[Math.floor(Math.random() * palettes.length)]
    result.push({
      left,
      top,
      scale: 0.6 + Math.random() * 0.7,  // 0.6~1.3
      delay: Math.random() * 4,            // 0~4s 错开
      duration: 5 + Math.random() * 4,     // 5~9s 周期
      ...palette,
    })
  }
  clouds.value = result
}

// 组件挂载时生成祥云
generateClouds()
// 默认收起搜索面板
const isSearchCollapsed = ref(true)
const showNoResult = ref(false)
let noResultTimer = null

// 获取响应式缩放级别
const getInitialZoom = () => window.innerWidth < 768 ? 4 : 5

const {
  initMap,
  renderWithCluster,
  destroy: destroyMap,
} = useTempleMap({
  mapRef,
  temples: computed(() => store.filteredTemples),
  mapConfig: {
    // 黄金比例硬编码视角（中国大陆几何中心）
    center: [105.0, 36.0],
    zoom: getInitialZoom(),
  },
  onDetailClick: (templeId) => {
    // P0 修复：仅跳转，禁止操作地图实例（避免竞态崩溃）
    router.push(`/temple/${templeId}`)
  },
})

const hotCities = ['北京', '杭州', '成都', '西安', '上海', '广州', '南京', '厦门']

const getCategoryCount = (cat) => store.categoryCountMap[cat] || 0

const hideSuggestions = () => {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

const selectSuggestion = (item) => {
  showSuggestions.value = false
  if (item.type === 'city') {
    goToCity(item.value)
  } else if (item.type === 'temple') {
    const temple = temples.find(t => t.name === item.value)
    if (temple) {
      router.push(`/temple/${temple.id}`)
    }
  } else if (item.type === 'category') {
    store.selectedCategory = item.value
    store.selectedTag = ''
    store.selectedCity = ''
    store.searchKeyword = ''
    // watch 会自动触发 renderWithCluster + setFitView
  }
}

const toggleCategory = (key) => {
  const wasActive = store.selectedCategory === key
  store.selectedCategory = wasActive ? '' : key
  store.selectedTag = ''
  store.selectedCity = ''
  // watch 会自动触发 renderWithCluster + setFitView
}

// 防抖处理后的搜索函数（300ms 延迟）
const _doSearch = () => {
  const kw = store.searchKeyword.trim()
  if (!kw) return

  // 1. 精确匹配城市名 → 纯跳转
  const exactCity = temples.find(t => t.city === kw)
  if (exactCity) {
    goToCity(exactCity.city)
    return
  }

  // 2. 模糊匹配城市 → 纯跳转
  const matchedCity = temples.find(t =>
    t.city.includes(kw) || t.province.includes(kw)
  )
  if (matchedCity) {
    goToCity(matchedCity.city)
    return
  }

  // 3. 模糊匹配寺庙名 → 纯跳转详情页
  const matchedTemple = temples.find(t => t.name.includes(kw))
  if (matchedTemple) {
    router.push(`/temple/${matchedTemple.id}`)
    return
  }

  // 4. 模糊匹配分类名 → 不跳转，原地筛选
  const matchedCat = categories.find(c => c.key.includes(kw))
  if (matchedCat) {
    store.selectedCategory = matchedCat.key
    store.selectedTag = ''
    store.selectedCity = ''
    store.searchKeyword = ''
    isSearchCollapsed.value = true
    return
  }

  // 5. 模糊匹配标签 → 不跳转，原地筛选
  const matchedTag = temples.some(t => t.tags.some(tag => tag.includes(kw)))
  if (matchedTag) {
    store.selectedTag = kw
    store.selectedCategory = ''
    store.selectedCity = ''
    store.searchKeyword = ''
    isSearchCollapsed.value = true
    return
  }

  // 6. 未找到任何匹配结果
  showNoResult.value = true
  clearTimeout(noResultTimer)
  noResultTimer = setTimeout(() => { showNoResult.value = false }, 3000)
}

const handleSearch = debounce(_doSearch, 300)

// 城市跳转：纯路由跳转，不操作 store 状态，不操作地图
// 渲染任务交给 CityMapPage 自己处理
const goToCity = (city) => {
  router.push(`/city/${encodeURIComponent(city)}`)
}

// 重置所有筛选条件
const goHome = () => {
  store.searchKeyword = ''
  store.selectedCity = ''
  store.selectedCategory = ''
  store.selectedTag = ''
  // watch 会自动触发 renderWithCluster + setFitView
}

onMounted(async () => {
  // 等待 Noto Serif SC 字体就绪（异步加载的中文字体），避免 FOUT 闪烁
  const fontReady = document.fonts ? document.fonts.ready : Promise.resolve()

  try {
    // 数据加载、字体就绪、最小等待三者并行，取最慢的那个
    await Promise.all([loadTemples(), fontReady])

    // 初始化地图（带重试机制）
    const mapInstance = initMap()

    if (mapInstance) {
      renderWithCluster(store.filteredTemples)
    } else {
      console.warn('[HomePage] 地图初始化返回 null，1秒后重试...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      const retryMap = initMap()
      if (retryMap) {
        renderWithCluster(store.filteredTemples)
      }
    }
  } catch (e) {
    console.error('[HomePage] onMounted 出错:', e)
  } finally {
      }
})

onBeforeUnmount(() => {
  clearTimeout(noResultTimer)
  destroyMap()
})

// 监听筛选条件变化 → 重新渲染聚合点 + 自动缩放
// 防御：路由跳转时组件卸载，map 可能为 null
watch(
  () => [store.selectedCity, store.selectedCategory, store.selectedTag, store.searchKeyword],
  () => {
    if (!mapRef.value) return // DOM 已卸载，跳过
    renderWithCluster(store.filteredTemples)
  }
)
</script>

<style scoped>
/* ═══════════════════════════════════════════
   1-BIT PIXEL ART — 纯黑白像素艺术风格
   Background: #000000 | Foreground: #FFFFFF
   Accent Red: #E63927 (仅灯笼/极少数强调)
   ═══════════════════════════════════════════ */

.search-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000000;
}

.map-container {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

/* ── 搜索面板 ── */
.search-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  padding: 20px 24px 0;
  transition: all 0.4s var(--ease-out);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-panel.collapsed {
  padding-bottom: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-link {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  transition: opacity 0.3s;
  border: none;
  cursor: pointer;
}
.home-link:hover {
  opacity: 0.8;
}
.home-link span:first-child {
  font-size: 28px;
  animation: lanternSwing 3s ease-in-out infinite;
}

.brand-icon {
  font-size: 32px;
  animation: lanternSwing 3s ease-in-out infinite;
}

.brand-title {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 900;
  color: #FFFFFF;
  letter-spacing: 4px;
  text-shadow: 2px 2px 0px #000000;
}

.brand-sub {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #999999;
  margin-left: 8px;
  padding-left: 12px;
  border-left: 2px solid #333333;
}

/* ═══════════════════════════════════════════
   赛博风格展开/收起按钮（梯形拉手）
   ═══════════════════════════════════════════ */
.toggle-btn-cyber {
  position: absolute;
  left: 50%;
  bottom: -28px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 32px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-top: none;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  color: #FFFFFF;
  font-family: var(--font-sans);
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 255, 204, 0.1);
}

.toggle-btn-cyber:hover {
  background: rgba(0, 255, 204, 0.1);
  border-color: rgba(0, 255, 204, 0.5);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 2px 12px rgba(0, 255, 204, 0.3);
}

.toggle-btn-cyber::before {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 204, 0.6), transparent);
  opacity: 0.6;
}

.toggle-text {
  font-weight: 500;
}

.toggle-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
  color: #00FFCC;
}

.toggle-arrow.rotated {
  transform: rotate(180deg);
}

.search-body {
  max-width: 800px;
  margin: 16px auto 0;
  padding-bottom: 20px;
  overflow: hidden;
}

/* ── 搜索面板折叠/展开过渡 ── */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s var(--ease-out);
  max-height: 600px;
  opacity: 1;
}
.slide-up-enter-from,
.slide-up-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

/* ── 搜索框 ── */
.search-box {
  display: flex;
  align-items: center;
  background: transparent;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  padding: 4px 4px 4px 20px;
  transition: border-color 0.3s;
  position: relative;
}
.search-box:focus-within {
  border-color: var(--c-red);
}

.search-icon {
  font-size: 18px;
  margin-right: 10px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-family: var(--font-sans);
  font-size: 15px;
  padding: 12px 0;
  outline: none;
}
.search-box input::placeholder {
  color: #666666;
}

.search-btn {
  background: #FFFFFF;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  color: #000000;
  font-family: var(--font-sans);
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  transition: background 0.3s, color 0.3s;
  white-space: nowrap;
  cursor: pointer;
}
.search-btn:hover {
  background: transparent;
  color: #FFFFFF;
}

/* ── 搜索建议 ── */
.suggestions {
  background: #000000;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  margin-top: 8px;
  overflow: hidden;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-family: var(--font-sans);
  font-size: 14px;
  color: #FFFFFF;
}
.suggestion-item:hover {
  background: #111111;
}

.suggestion-count {
  margin-left: auto;
  font-family: var(--font-pixel);
  font-size: 10px;
  color: #999999;
  background: transparent;
  padding: 2px 8px;
  border-radius: 0;
}

/* ── 签文标签 ── */
.tags-section {
  margin-top: 16px;
}

.tags-label {
  font-family: var(--font-serif);
  font-size: 14px;
  color: #FFFFFF;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  color: #FFFFFF;
  font-family: var(--font-sans);
  font-size: 14px;
  transition: border-color 0.3s, background 0.3s, color 0.3s;
  position: relative;
  cursor: pointer;
}
.tag-btn:hover {
  border-color: var(--c-red);
}
.tag-btn.active {
  background: #FFFFFF;
  color: #000000;
  border-color: #FFFFFF;
}

.tag-icon {
  font-size: 18px;
}
.tag-text {
  font-weight: 600;
}
.tag-desc {
  font-family: var(--font-pixel);
  font-size: 9px;
  color: #999999;
}

/* ── 热门城市 ── */
.hot-cities {
  margin-top: 16px;
}

.city-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-chip {
  padding: 8px 16px;
  background: transparent;
  border: 2px solid #FFFFFF;
  border-radius: 0;
  color: #FFFFFF;
  font-family: var(--font-sans);
  font-size: 13px;
  transition: background 0.3s, color 0.3s;
  cursor: pointer;
}
.city-chip:hover {
  background: #FFFFFF;
  color: #000000;
}

/* ── 搜索无结果提示 ── */
.no-result-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #FFF;
  padding: 12px 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  white-space: nowrap;
}

.no-result-icon {
  font-size: 20px;
}

.no-result-toast span:last-child {
  font-family: var(--font-serif);
  font-size: 14px;
  color: #FFD700;
  letter-spacing: 2px;
}

/* ═══════════════════════════════════════════
   底部统计面板（毛玻璃悬浮优化）
   ═══════════════════════════════════════════ */
.stats-bar {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px 36px;
  animation: slideUp 0.6s var(--ease-out);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 204, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-family: var(--font-pixel);
  font-size: 22px;
  font-weight: 900;
  color: #00FFCC;
  text-shadow: 0 0 10px rgba(0, 255, 204, 0.4);
}

.stat-label {
  font-family: var(--font-sans);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
}

/* ── 响应式 ── */
@media (max-width: 640px) {
  .search-panel {
    padding: 12px 16px 0;
  }
  .brand-title {
    font-size: 20px;
    letter-spacing: 2px;
  }
  .brand-sub {
    display: none;
  }
  .tag-desc {
    display: none;
  }
  .stats-bar {
    padding: 12px 24px;
    gap: 16px;
    bottom: 20px;
  }
  .stat-num {
    font-size: 18px;
  }
  .toggle-btn-cyber {
    padding: 6px 24px;
    bottom: -24px;
  }
}



@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes lanternSwing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

/* ═══════════════════════════════════════════════════════════════
   灯笼 Marker 样式（赛博呼吸灯 · GPU 加速）
   ═══════════════════════════════════════════════════════════════ */
:global(.lantern-marker) {
  width: 36px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

:global(.lantern-marker:hover) {
  transform: scale(1.2);
}

:global(.lantern-marker .lantern-icon) {
  font-size: 28px;
  /* 赛博呼吸灯：仅使用 transform + filter，GPU 硬件加速 */
  animation: floatAndBreathe 3s ease-in-out infinite;
  will-change: transform, filter;
}

/* 赛博呼吸灯关键帧：上浮 + 光晕明暗交替 */
@keyframes floatAndBreathe {
  0%, 100% {
    transform: translateY(0) scale(1);
    filter: drop-shadow(0 2px 6px rgba(255, 80, 0, 0.4));
  }
  50% {
    transform: translateY(-6px) scale(1.05);
    filter: drop-shadow(0 8px 18px rgba(255, 120, 0, 0.9));
  }
}

/* 点聚合样式 */
:global(.cluster-marker) {
  transition: transform 0.2s ease;
}

:global(.cluster-marker:hover) {
  transform: scale(1.15) !important;
}

/* ── 粉红发光赛博莲花 SVG 样式（求平安） ── */
.cyber-pink-lotus {
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
  color: #FF5E6D;
  animation: cyber-breathe-pink 3s ease-in-out infinite;
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
  color: #d4af37;
  animation: cyber-breathe-gold 3s ease-in-out infinite;
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
  0% { transform: translateX(-100%) skewX(-25deg); }
  20% { transform: translateX(300%) skewX(-25deg); }
  100% { transform: translateX(300%) skewX(-25deg); }
}

/* 粉红呼吸光动画（求平安莲花） */
@keyframes cyber-breathe-pink {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 94, 109, 0.4)) drop-shadow(0 0 10px rgba(255, 94, 109, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 94, 109, 0.8)) drop-shadow(0 0 30px rgba(255, 94, 109, 0.6));
  }
}

/* 金色呼吸光动画（求财元宝） */
@keyframes cyber-breathe-gold {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.4)) drop-shadow(0 0 10px rgba(212, 175, 55, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 30px rgba(212, 175, 55, 0.7));
  }
}

/* 综合祈福：福寿双全 - 暗金发光 */
.cyber-shou {
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
  color: #d4af37;
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
}

/* 求健康：禅意葫芦 - 赛博翠绿发光 */
.cyber-gourd {
  display: block;
  color: #4ade80;
  filter: drop-shadow(0 0 12px rgba(74, 222, 128, 0.6));
  animation: gourdGlow 3s ease-in-out infinite alternate;
}

@keyframes gourdGlow {
  0% {
    filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.5));
  }
  100% {
    filter: drop-shadow(0 0 16px rgba(74, 222, 128, 0.9));
  }
}
</style>
