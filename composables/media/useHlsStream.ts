// composables/media/useHlsStream.ts
import { ref, onUnmounted, Ref } from 'vue'
import Hls from 'hls.js'

export const useHlsStream = (
  videoElement: Ref<HTMLVideoElement | null>,
  sourceUrl: string
) => {
  const hls = ref<Hls | null>(null)
  const availableQualities = ref<string[]>([])
  const currentQuality = ref('auto')
  const error = ref('')

  const initialize = () => {
    if (!videoElement.value) return

    if (Hls.isSupported()) {
      hls.value = new Hls({ autoStartLoad: true })
      hls.value.attachMedia(videoElement.value)
      hls.value.loadSource(sourceUrl)

      hls.value.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        availableQualities.value = [
          'auto',
          ...data.levels.map((level) => `${level.height}p`),
        ]
      })

      hls.value.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              error.value = 'Network error'
              hls.value?.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              error.value = 'Media error'
              hls.value?.recoverMediaError()
              break
            default:
              error.value = 'Unknown error'
              hls.value?.destroy()
          }
        }
      })
    } else if (
      videoElement.value.canPlayType('application/vnd.apple.mpegurl')
    ) {
      videoElement.value.src = sourceUrl
    }
  }

  const changeQuality = (quality: string) => {
    if (!hls.value) return
    currentQuality.value = quality
    if (quality === 'auto') {
      hls.value.currentLevel = -1
    } else {
      const level = hls.value.levels.findIndex(
        (l) => `${l.height}p` === quality
      )
      if (level > -1) hls.value.currentLevel = level
    }
  }

  onUnmounted(() => {
    hls.value?.destroy()
  })

  return {
    hls,
    availableQualities,
    currentQuality,
    error,
    initialize,
    changeQuality,
  }
}
