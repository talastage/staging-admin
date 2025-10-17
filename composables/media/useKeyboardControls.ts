// composables/media/useKeyboardControls.ts
import { onMounted, onUnmounted, Ref } from 'vue'

export const useKeyboardControls = (
  videoElement: Ref<HTMLVideoElement | null>,
  isPlaying: Ref<boolean>,
  currentTime: Ref<number>,
  duration: Ref<number>,
  volume: Ref<number>,
  isMuted?: Ref<boolean>
) => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (!videoElement.value) return
    
    // Don't handle keyboard events if user is typing in an input field
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement
    ) {
      return
    }

    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k': // YouTube-style play/pause with K
        event.preventDefault()
        isPlaying.value = !isPlaying.value
        isPlaying.value ? videoElement.value.play() : videoElement.value.pause()
        break
      case 'f':
        event.preventDefault()
        // Trigger fullscreen event - handled by parent component
        const fullscreenEvent = new CustomEvent('requestfullscreen')
        videoElement.value.dispatchEvent(fullscreenEvent)
        break
      case 'm':
        event.preventDefault()
        if (isMuted) {
          isMuted.value = !isMuted.value
        } else {
          videoElement.value.muted = !videoElement.value.muted
        }
        break
      case 'arrowleft':
      case 'j': // YouTube-style rewind with J
        event.preventDefault()
        videoElement.value.currentTime = Math.max(currentTime.value - 10, 0)
        break
      case 'arrowright':
      case 'l': // YouTube-style forward with L
        event.preventDefault()
        videoElement.value.currentTime = Math.min(
          currentTime.value + 10,
          duration.value
        )
        break
      case 'arrowup':
        event.preventDefault()
        volume.value = Math.min(volume.value + 0.05, 1)
        videoElement.value.volume = volume.value
        if (isMuted && isMuted.value && volume.value > 0) {
          isMuted.value = false
        }
        break
      case 'arrowdown':
        event.preventDefault()
        volume.value = Math.max(volume.value - 0.05, 0)
        videoElement.value.volume = volume.value
        if (isMuted && volume.value === 0) {
          isMuted.value = true
        }
        break
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        // Jump to percentage of video (0 = 0%, 1 = 10%, ..., 9 = 90%)
        event.preventDefault()
        const percent = parseInt(event.key) * 0.1
        videoElement.value.currentTime = duration.value * percent
        break
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyPress)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
  })
}