// stores/useSnackMessage.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SnackSeverity = 'success' | 'error' | 'warning' | 'info' | 'black'

interface SnackOptions {
  color?: SnackSeverity
  timeout?: number
  closable?: boolean
}

const DEFAULT_TIMEOUT = 3000

export const useSnackMessageStore = defineStore('snackMessage', () => {
  // State
  const show = ref(false)
  const message = ref('')
  const color = ref<SnackSeverity>('black')
  const timeout = ref(DEFAULT_TIMEOUT)
  const closable = ref(true)

  // Methods
  function triggerSnack(msg: string, options?: SnackOptions) {
    message.value = msg
    color.value = options?.color || 'black'
    timeout.value = options?.timeout || DEFAULT_TIMEOUT
    closable.value = options?.closable ?? true
    show.value = true
  }

  function closeSnack() {
    show.value = false
  }

  // Convenience methods
  const success = (msg: string, options?: Omit<SnackOptions, 'color'>) =>
    triggerSnack(msg, { ...options, color: 'success' })

  const error = (msg: string, options?: Omit<SnackOptions, 'color'>) =>
    triggerSnack(msg, { ...options, color: 'error' })

  const warning = (msg: string, options?: Omit<SnackOptions, 'color'>) =>
    triggerSnack(msg, { ...options, color: 'warning' })

  const info = (msg: string, options?: Omit<SnackOptions, 'color'>) =>
    triggerSnack(msg, { ...options, color: 'info' })

  return {
    show,
    message,
    color,
    timeout,
    closable,
    triggerSnack,
    closeSnack,
    success,
    error,
    warning,
    info,
  }
})
