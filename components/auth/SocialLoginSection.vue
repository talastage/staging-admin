<template>
  <div class="social-login-section">
    <v-divider class="mb-4">
      <span class="text-caption text-medium-emphasis px-3">Or continue with</span>
    </v-divider>

    <div class="social-buttons">
      <SocialLoginButton
        v-for="provider in providers"
        :key="provider"
        :provider="provider"
        :loading="loadingProvider === provider"
        @login="handleSocialLogin"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

interface Props {
  mode?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'login'
})

const emit = defineEmits<{
  (e: 'social-success', data: any): void
  (e: 'social-registration-required', data: any): void
}>()

const authStore = useAuthStore()
const snackStore = useSnackMessageStore()
const loadingProvider = ref<string | null>(null)

const providers = ['google', 'facebook', 'twitter', 'instagram', 'tiktok', 'linkedin'] as const

const handleSocialLogin = async (provider: string) => {
  try {
    loadingProvider.value = provider
    
    // For now, we'll use a popup-based approach
    // In production, you might want to use redirect-based flow
    const popup = await openSocialLoginPopup(provider)
    const result = await waitForPopupResult(popup)
    
    if (result.success) {
      if (result.requires_completion) {
        emit('social-registration-required', result)
      } else {
        emit('social-success', result)
      }
    }
  } catch (error: any) {
    snackStore.error(error.message || `Failed to login with ${provider}`)
  } finally {
    loadingProvider.value = null
  }
}

const openSocialLoginPopup = (provider: string): Promise<Window> => {
  return new Promise((resolve, reject) => {
    const width = 500
    const height = 600
    const left = (screen.width - width) / 2
    const top = (screen.height - height) / 2
    
    const popup = window.open(
      `${authStore.apiUrl}/auth/social/${provider}/redirect`,
      'social-login',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    )
    
    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'))
      return
    }
    
    resolve(popup)
  })
}

const waitForPopupResult = (popup: Window): Promise<any> => {
  return new Promise((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        reject(new Error('Login cancelled'))
      }
    }, 1000)
    
    // Listen for message from popup
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'SOCIAL_LOGIN_SUCCESS') {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        popup.close()
        resolve(event.data.payload)
      } else if (event.data.type === 'SOCIAL_LOGIN_ERROR') {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        popup.close()
        reject(new Error(event.data.error))
      }
    }
    
    window.addEventListener('message', messageHandler)
    
    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed)
      window.removeEventListener('message', messageHandler)
      if (!popup.closed) {
        popup.close()
      }
      reject(new Error('Login timeout'))
    }, 300000)
  })
}
</script>

<style scoped>
.social-login-section {
  margin: 1rem 0;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>