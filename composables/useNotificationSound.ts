// composables/useNotificationSound.ts
export function useNotificationSound() {
  const audio = ref(null)
  const isPlaying = ref(false)

  const initializeAudio = () => {
    if (!audio.value) {
      audio.value = new Audio('/sounds/notification.mp3')
      audio.value.addEventListener('ended', () => {
        isPlaying.value = false
      })
    }
  }

  const play = async () => {
    if (isPlaying.value) return

    try {
      initializeAudio()
      isPlaying.value = true
      await audio.value.play()
    } catch (error) {
      console.log('Audio playback prevented:', error)
      isPlaying.value = false
    }
  }

  onBeforeUnmount(() => {
    if (audio.value) {
      audio.value.remove()
      audio.value = null
    }
  })

  return {
    play,
    isPlaying,
  }
}
