// composables/usePremiereCountdown.ts
import { ref, computed } from 'vue'

export function usePremiereCountdown(premiereDate: string) {
  const now = ref(new Date())
  const countdown = computed(() => {
    const diff = new Date(premiereDate).getTime() - now.value.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  })

  // Update every second
  const timer = setInterval(() => {
    now.value = new Date()
  }, 1000)

  onUnmounted(() => clearInterval(timer))

  return { countdown }
}
