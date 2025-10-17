// composables/useDebounce.ts

import { ref, onUnmounted } from 'vue'

/**
 * A composable for creating debounced functions
 */
export function useDebounce() {
  const timeoutIds = ref<Record<string, number>>({})

  /**
   * Debounce a function call
   *
   * @param fn The function to debounce
   * @param delay The delay in milliseconds
   * @param key Optional key to identify different debounced functions
   * @returns A debounced version of the function
   */
  const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300,
    key: string = 'default'
  ) => {
    return (...args: Parameters<T>) => {
      // Clear existing timeout for this key
      if (timeoutIds.value[key]) {
        clearTimeout(timeoutIds.value[key])
      }

      // Set new timeout
      timeoutIds.value[key] = window.setTimeout(() => {
        fn(...args)
        delete timeoutIds.value[key]
      }, delay)
    }
  }

  /**
   * Cancel all pending debounced calls
   */
  const cancelAll = () => {
    Object.values(timeoutIds.value).forEach((id) => clearTimeout(id))
    timeoutIds.value = {}
  }

  /**
   * Cancel a specific debounced call by key
   *
   * @param key The key of the debounced function to cancel
   */
  const cancel = (key: string = 'default') => {
    if (timeoutIds.value[key]) {
      clearTimeout(timeoutIds.value[key])
      delete timeoutIds.value[key]
    }
  }

  // Cleanup all timeouts when component is unmounted
  onUnmounted(() => {
    cancelAll()
  })

  return {
    debounce,
    cancel,
    cancelAll,
  }
}
