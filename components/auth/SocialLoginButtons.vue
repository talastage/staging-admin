<template>
  <div class="social-login-section">
    <v-divider class="my-3">
      <span class="text-caption text-medium-emphasis px-2">Or continue with</span>
    </v-divider>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="social-buttons-container">
      <v-skeleton-loader
        v-for="n in 2"
        :key="n"
        type="button"
        class="mb-1"
        height="36"
      />
    </div>

    <!-- Social buttons -->
    <div v-else-if="socialProviders.length > 0" class="social-buttons-container">
      <v-btn
        v-for="provider in socialProviders"
        :key="provider.name"
        :color="provider.color"
        variant="outlined"
        :loading="loadingProvider === provider.name"
        @click="handleSocialLogin(provider.name)"
        class="social-btn"
        :prepend-icon="provider.icon"
        block
      >
        {{ getProviderText(provider.name) }}
      </v-btn>
    </div>

    <!-- Fallback for no providers -->
    <div v-else class="text-center text-caption text-medium-emphasis py-2">
      No social providers available
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useSocialProvidersStore } from '~/stores/useSocialProviders'

const authStore = useAuthStore()
const snackStore = useSnackMessageStore()
const socialStore = useSocialProvidersStore()
const loadingProvider = ref<string | null>(null)

interface Props {
  mode?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'login'
})

// Use store data with fallback
const socialProviders = computed(() => socialStore.activeProviders)
const isLoading = computed(() => socialStore.isLoading)

const getProviderText = (provider: string) => {
  const action = props.mode === 'register' ? 'Continue with' : 'Login with'
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)
  return `${action} ${providerName}`
}

onMounted(() => {
  // Only fetch if not already loaded
  if (!socialStore.isLoaded) {
    socialStore.fetchActiveProviders()
  }
})

const emit = defineEmits<{
  (e: 'social-success', data: any): void
  (e: 'social-error', error: string): void
}>()

const handleSocialLogin = async (provider: string) => {
  try {
    loadingProvider.value = provider
    
    const result = await authStore.initiateSocialLogin(provider)
    
    if (result.redirect_url) {
      // Redirect to social provider
      window.location.href = result.redirect_url
    }
  } catch (error: any) {
    console.error(`${provider} login error:`, error)
    snackStore.error(error.message || `Failed to login with ${provider}`)
    emit('social-error', error.message)
  } finally {
    loadingProvider.value = null
  }
}
</script>

<style scoped>
.social-login-section {
  width: 100%;
}

.social-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.social-btn {
  text-transform: none;
  font-weight: 500;
  height: 36px;
  font-size: 0.875rem;
}
</style>