// composables/media/useFullscreen.ts
import { ref, onMounted, onUnmounted, Ref } from 'vue'

export const useFullscreen = (container: Ref<HTMLElement | null>) => {
  const isFullscreen = ref(false)

  const toggle = async () => {
    if (!container.value) return

    try {
      if (!document.fullscreenElement) {
        await container.value.requestFullscreen()
        isFullscreen.value = true
      } else {
        await document.exitFullscreen()
        isFullscreen.value = false
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange)
  })

  return { isFullscreen, toggle }
}
