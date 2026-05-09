// 图片错误处理工具
// 统一处理图片 403/404 等错误，显示默认占位图

// 禅意占位图 SVG（Base64）- 金色莲花图案
const DEFAULT_PLACEHOLDER_SVG = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="#1a1a2e" width="200" height="200"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="80" fill="#FFD700" opacity="0.6">禅</text><circle cx="100" cy="100" r="80" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.3"/><circle cx="100" cy="100" r="60" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.2"/></svg>`)}`

// 寺庙默认图片
export const DEFAULT_TEMPLE_IMAGE = DEFAULT_PLACEHOLDER_SVG

// 处理图片错误
export const handleImageError = (event) => {
  const img = event.target
  if (img) {
    img.src = DEFAULT_PLACEHOLDER_SVG
    img.onerror = null // 防止循环触发
  }
}

// 在 Vue 模板中使用的错误处理器
export const useImageErrorHandler = () => {
  return {
    onImageError: handleImageError,
    defaultImage: DEFAULT_PLACEHOLDER_SVG
  }
}
