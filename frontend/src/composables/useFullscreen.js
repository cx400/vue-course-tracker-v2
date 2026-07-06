import { ref, onMounted, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement
  }

  async function toggleFullscreen() {
    try {
      if (!isFullscreen.value) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // 全屏 API 可能因浏览器限制而失败，忽略即可
    }
  }

  onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
  onUnmounted(() => document.removeEventListener('fullscreenchange', onFullscreenChange))

  return { isFullscreen, toggleFullscreen }
}
