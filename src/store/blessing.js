import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  temples, blessingTags, categories, loadTemples,
  searchByKeyword, categoryCountMap, tagConfig, categoryConfig,
} from '../data/temples.js'

export const useBlessingStore = defineStore('blessing', () => {
  // ═══════════════════════════════════════════════════════════════
  // 搜索与筛选状态
  // ═══════════════════════════════════════════════════════════════

  const searchKeyword = ref('')
  const selectedCity = ref('')      // 新增：城市筛选
  const selectedCategory = ref('')
  const selectedTag = ref('')

  // ═══════════════════════════════════════════════════════════════
  // 搜索建议（带防抖，避免每次按键都触发搜索计算）
  // ═══════════════════════════════════════════════════════════════
  const _debouncedKeyword = ref('')
  let _debounceTimer = null
  watch(searchKeyword, (val) => {
    if (_debounceTimer) clearTimeout(_debounceTimer)
    _debounceTimer = setTimeout(() => {
      _debouncedKeyword.value = val
    }, 200)
  })

  const searchSuggestions = computed(() => {
    return searchByKeyword(_debouncedKeyword.value)
  })

  // ═══════════════════════════════════════════════════════════════
  // 多条件交集过滤（AND 逻辑）
  // 必须同时满足：城市 + 分类 + 标签 + 关键字
  // ═══════════════════════════════════════════════════════════════
  const filteredTemples = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase()
    
    return temples.filter(temple => {
      // 城市筛选（精确匹配）
      const matchCity = !selectedCity.value || temple.city === selectedCity.value
      
      // 分类筛选（精确匹配）
      const matchCategory = !selectedCategory.value || temple.category === selectedCategory.value
      
      // 标签筛选（包含匹配）
      const matchTag = !selectedTag.value || temple.tags.includes(selectedTag.value)
      
      // 关键字筛选（模糊匹配：名称/城市/拼音）
      const matchKeyword = !kw || 
        temple.name.toLowerCase().includes(kw) ||
        temple.city.toLowerCase().includes(kw) ||
        (temple.namePinyin && temple.namePinyin.includes(kw)) ||
        (temple.namePinyinFirst && temple.namePinyinFirst.includes(kw)) ||
        (temple.cityPinyin && temple.cityPinyin.includes(kw)) ||
        (temple.cityPinyinFirst && temple.cityPinyinFirst.includes(kw))
      
      // AND 逻辑：必须同时满足所有条件
      return matchCity && matchCategory && matchTag && matchKeyword
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // 基础方法
  // ═══════════════════════════════════════════════════════════════
  const getTempleById = (id) => {
    return temples.find(t => t.id === Number(id))
  }

  // 统计数据（预计算，避免每次 computed 重新遍历）
  const _totalCities = new Set(temples.map(t => t.city)).size
  const stats = computed(() => ({
    totalTemples: temples.length,
    totalCities: _totalCities,
    totalCategories: categories.length,
  }))

  // 清除所有筛选
  const clearFilters = () => {
    searchKeyword.value = ''
    selectedCity.value = ''
    selectedCategory.value = ''
    selectedTag.value = ''
  }

  return {
    // 状态
    searchKeyword,
    selectedCity,
    selectedCategory,
    selectedTag,
    // 计算属性
    searchSuggestions,
    filteredTemples,
    stats,
    // 配置
    blessingTags,
    categories,
    // 预构建索引（O(1) 查找）
    categoryCountMap,
    tagConfig,
    categoryConfig,
    // 方法
    getTempleById,
    clearFilters,
  }
})
