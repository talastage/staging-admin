// composables/useLoadingState.ts
import { ref } from 'vue'

export function useLoadingState(minimumLoadingTime = 500) {
  const loading = ref(false)
  const startTime = ref<number | null>(null)

  const startLoading = () => {
    loading.value = true
    startTime.value = Date.now()
  }

  const stopLoading = async () => {
    if (startTime.value) {
      const elapsedTime = Date.now() - startTime.value
      if (elapsedTime < minimumLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minimumLoadingTime - elapsedTime)
        )
      }
    }
    loading.value = false
    startTime.value = null
  }

  return {
    loading,
    startLoading,
    stopLoading,
  }
}
