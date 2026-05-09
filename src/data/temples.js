import templesDataRaw from './temples-final.json'
import { pinyin } from 'pinyin-pro'

// ═══════════════════════════════════════════════════════════════
// 中国祈福地图 — 配置与数据加载
// category: 综合祈福 | 求财 | 求学 | 求姻缘 | 求平安 | 化太岁 | 求事业 | 求健康 | 求子
// level: 极度灵验 | 非常灵验 | 颇为灵验
// ═══════════════════════════════════════════════════════════════

// 预计算拼音工具函数
const getPinyin = (str) => {
  if (!str) return { full: '', first: '' }
  const arr = pinyin(str, { toneType: 'none', type: 'array' })
  const full = arr.join('').toLowerCase()
  const first = arr.map(c => c[0]).join('').toLowerCase()
  return { full, first }
}

// 签文标签配置
export const blessingTags = [
  { key: '求财', icon: '💰', color: '#FFD700', desc: '求财运亨通' },
  { key: '求学', icon: '📚', color: '#4FC3F7', desc: '求学业有成' },
  { key: '求姻缘', icon: '💕', color: '#F48FB1', desc: '求良缘美满' },
  { key: '求平安', icon: '🙏', color: '#81C784', desc: '求出入平安' },
  { key: '化太岁', icon: '🔥', color: '#FF7043', desc: '化解太岁厄运' },
]

// 分类配置
export const categories = [
  { key: '综合祈福', icon: 'shou', color: '#FFD700' },
  { key: '求财', icon: 'sycee', color: '#FFD700' },
  { key: '求学', icon: '📚', color: '#4FC3F7' },
  { key: '求姻缘', icon: '💕', color: '#F48FB1' },
  { key: '求平安', icon: 'lotus', color: '#38bdf8' },
  { key: '求健康', icon: 'gourd', color: '#4ade80' },
  { key: '求事业', icon: '💼', color: '#FFA726' },
  { key: '化太岁', icon: '☯️', color: '#FF7043' },
  { key: '求子', icon: '👶', color: '#CE93D8' },
]

// 灵验等级配置
export const levelConfig = {
  '极度灵验': { color: '#FFD700', bg: 'linear-gradient(135deg, #FFD700, #FFA000)', icon: '⭐' },
  '非常灵验': { color: '#FF6B6B', bg: 'linear-gradient(135deg, #FF6B6B, #EE5A24)', icon: '🔥' },
  '颇为灵验': { color: '#4FC3F7', bg: 'linear-gradient(135deg, #4FC3F7, #0288D1)', icon: '✨' },
}

// ═══════════════════════════════════════════════════════════════
// 数据转换：适配合并后的数据格式
// ═══════════════════════════════════════════════════════════════

const templesData = templesDataRaw.map((item) => {
  // 解析坐标（优先 lat/lng，fallback 到 coordinates）
  let lat = item.lat
  let lng = item.lng
  if ((!lat || !lng) && item.coordinates) {
    lng = item.coordinates[0]
    lat = item.coordinates[1]
  }

  // 预计算拼音
  const namePinyin = getPinyin(item.name || '')
  const cityPinyin = getPinyin(item.city || '')

  // 构建 highlights 对象（优先使用已有的，否则从 category 推导）
  let highlights = item.highlights
  if (!highlights || Object.keys(highlights).length === 0) {
    highlights = item.category ? {
      [item.category]: {
        level: '颇为灵验',
        desc: item.reason || item.tips || ''
      }
    } : {}
  }

  return {
    id: item.id,
    name: item.name || '',
    city: item.city || '',
    province: item.province || '',
    lat,
    lng,
    image: item.image || '',
    category: item.category || '综合祈福',
    brief: item.desc || item.brief || '',
    history: item.historyStory || '',
    openTime: item.openTime || '',
    ticket: item.ticket || '',
    tags: item.tags || [],
    highlights,
    tips: item.tips || '',
    reason: item.reason || '',
    namePinyin: namePinyin.full,
    namePinyinFirst: namePinyin.first,
    cityPinyin: cityPinyin.full,
    cityPinyinFirst: cityPinyin.first,
  }
})

// 标签配置字典
export const tagConfig = Object.fromEntries(
  blessingTags.map(t => [t.key, { icon: t.icon, color: t.color }])
)

// 分类配置字典
export const categoryConfig = Object.fromEntries(
  categories.map(c => [c.key, { icon: c.icon, color: c.color }])
)

// 分类计数缓存
export const categoryCountMap = (() => {
  const map = {}
  templesData.forEach(t => {
    map[t.category] = (map[t.category] || 0) + 1
  })
  return map
})()

// 搜索倒排索引（包含拼音支持）
const _cityIndex = new Map()
const _templeIndex = new Map()
const _categoryIndex = new Map()
// 额外拼音索引
const _cityPinyinIndex = new Map()
const _templePinyinIndex = new Map()

templesData.forEach(t => {
  if (!_cityIndex.has(t.city)) {
    _cityIndex.set(t.city, { type: 'city', label: `${t.city}`, value: t.city })
  }
  if (!_templeIndex.has(t.name)) {
    _templeIndex.set(t.name, { type: 'temple', label: `${t.name}（${t.city}）`, value: t.name })
  }
  // 拼音索引
  if (t.cityPinyin) {
    if (!_cityPinyinIndex.has(t.cityPinyin)) {
      _cityPinyinIndex.set(t.cityPinyin, { type: 'city', label: `${t.city}`, value: t.city })
    }
    if (t.cityPinyinFirst && !_cityPinyinIndex.has(t.cityPinyinFirst)) {
      _cityPinyinIndex.set(t.cityPinyinFirst, { type: 'city', label: `${t.city}`, value: t.city })
    }
  }
  if (t.namePinyin) {
    if (!_templePinyinIndex.has(t.namePinyin)) {
      _templePinyinIndex.set(t.namePinyin, { type: 'temple', label: `${t.name}（${t.city}）`, value: t.name })
    }
    if (t.namePinyinFirst && !_templePinyinIndex.has(t.namePinyinFirst)) {
      _templePinyinIndex.set(t.namePinyinFirst, { type: 'temple', label: `${t.name}（${t.city}）`, value: t.name })
    }
  }
})

categories.forEach(c => {
  _categoryIndex.set(c.key, { type: 'category', label: `${c.icon} ${c.key}`, value: c.key })
})

// 高性能搜索建议（支持汉字、全拼、首字母）
export function searchByKeyword(keyword) {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return []

  const results = []
  const seen = new Set()

  // 1. 优先匹配拼音（全拼和首字母）
  for (const [key, entry] of _cityPinyinIndex) {
    if (key.includes(kw) && !seen.has(entry.value)) {
      seen.add(entry.value)
      results.push(entry)
    }
  }
  for (const [key, entry] of _templePinyinIndex) {
    if (key.includes(kw) && !seen.has(entry.value)) {
      seen.add(entry.value)
      results.push(entry)
    }
  }
  if (results.length >= 10) return results.slice(0, 10)

  // 2. 再匹配汉字
  for (const [key, entry] of _cityIndex) {
    if (key.includes(kw) && !seen.has(entry.value)) {
      seen.add(entry.value)
      results.push(entry)
      if (results.length >= 10) return results
    }
  }

  for (const [key, entry] of _templeIndex) {
    if (key.includes(kw) && !seen.has(entry.value)) {
      seen.add(entry.value)
      results.push(entry)
      if (results.length >= 10) return results
    }
  }

  for (const [key, entry] of _categoryIndex) {
    if (key.toLowerCase().includes(kw) && !seen.has(entry.value)) {
      seen.add(entry.value)
      results.push(entry)
      if (results.length >= 10) return results
    }
  }

  return results
}

// 首页背景 Marker：预选 20 个高优寺庙
export const featuredTemples = (() => {
  const scored = templesData.map(t => {
    let score = 0
    const h = t.highlights || {}
    Object.values(h).forEach(v => {
      if (v.level === '极度灵验') score += 3
      else if (v.level === '非常灵验') score += 2
      else score += 1
    })
    return { ...t, _score: score }
  })
  scored.sort((a, b) => b._score - a._score)
  return scored.slice(0, 20)
})()

// ═══════════════════════════════════════════════════════════════════════════
// 寺庙数据校验 + 清洗 + 导出
// ═══════════════════════════════════════════════════════════════════════════

function validateTempleData(rawData) {
  const REQUIRED_FIELDS = [
    { key: 'id', check: v => typeof v === 'number' && v > 0, label: 'ID' },
    { key: 'name', check: v => typeof v === 'string' && v.trim(), label: '寺庙名' },
    { key: 'city', check: v => typeof v === 'string' && v.trim(), label: '城市' },
    { key: 'lat', check: v => typeof v === 'number' && v >= -90 && v <= 90, label: '纬度' },
    { key: 'lng', check: v => typeof v === 'number' && v >= -180 && v <= 180, label: '经度' },
    { key: 'category', check: v => typeof v === 'string' && v.trim(), label: '分类' },
    { key: 'brief', check: v => typeof v === 'string', label: '简介' },
  ]

  const valid = []
  let warnings = 0

  rawData.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      console.warn(`[Data Warning] 第 ${index + 1} 条数据不是有效对象，已跳过`)
      warnings++
      return
    }

    const missingFields = REQUIRED_FIELDS.filter(f => !f.check(item[f.key]))

    if (missingFields.length > 0) {
      console.warn(
        `[Data Warning] 第 ${index + 1} 条数据（${item.name || '无名'}）缺失字段：${missingFields.map(f => f.label).join('、')}，已跳过`
      )
      warnings++
      return
    }

    valid.push(item)
  })

  if (warnings > 0) {
    console.warn(`[Data] 共 ${warnings} 条数据异常，已自动过滤。有效数据：${valid.length} 条`)
  }

  return { valid, warnings }
}

const { valid: _validatedTemples, warnings: _validationWarnings } = validateTempleData(templesData)

// 导出清洗后的数据
export const temples = _validatedTemples

// ID → Temple 快速查找 Map
const _templeByIdMap = new Map(_validatedTemples.map(t => [t.id, t]))

// 按城市分组的寺庙列表
export const templesByCity = _validatedTemples.reduce((acc, t) => {
  if (!acc[t.city]) acc[t.city] = []
  acc[t.city].push(t)
  return acc
}, {})

// ═══════════════════════════════════════════════════════════════════════════
// 数据加载 API（模拟异步加载，实际为同步）
// ═══════════════════════════════════════════════════════════════

export function loadTemples() {
  return Promise.resolve(_validatedTemples)
}

export function getTempleById(id) {
  return _templeByIdMap.get(id)
}

export function getTemplesByCity(city) {
  return templesByCity[city] || []
}

export function getAllCities() {
  return Object.keys(templesByCity).sort()
}
