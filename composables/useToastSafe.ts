/**
 * SSR-safe wrapper for vue-toastification's useToast
 * Returns a safe interface that works on both server and client
 */
export const useToastSafe = () => {
  // Check if we're on the client side
  if (process.client) {
    try {
      // Dynamically import useToast only on client
      const { useToast } = require('vue-toastification')
      return useToast()
    } catch (error) {
      console.warn('vue-toastification not available:', error)
    }
  }

  // Return a no-op interface for SSR
  return {
    success: (message: string) => {
      if (process.server) console.log('[Toast] Success:', message)
    },
    error: (message: string) => {
      if (process.server) console.log('[Toast] Error:', message)
    },
    info: (message: string) => {
      if (process.server) console.log('[Toast] Info:', message)
    },
    warning: (message: string) => {
      if (process.server) console.log('[Toast] Warning:', message)
    },
    clear: () => {},
    clearAll: () => {},
  }
}
