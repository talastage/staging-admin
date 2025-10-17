<template>
  <div class="social-success-container">
    <div class="content-wrapper text-center">
      <v-icon
        icon="mdi-check-circle"
        color="success"
        size="48"
        class="mb-3"
      />

      <h2 class="success-title">Login Successful!</h2>
      
      <p class="success-message">
        You have been successfully logged in with {{ provider }}. Redirecting to home...
      </p>

      <div class="progress-container">
        <v-progress-linear 
          indeterminate 
          color="primary" 
          height="3"
          rounded
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth-layout',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const provider = ref('')

onMounted(async () => {
  try {
    const token = route.query.token as string
    const providerName = route.query.provider as string
    const socialAuth = route.query.social_auth as string

    provider.value = providerName || 'social provider'

    if (socialAuth === 'success' && token) {
      // Set token directly in state and axios headers
      authStore.state.token = token
      const { $axios } = useNuxtApp()
      $axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Store in localStorage
      if (process.client) {
        localStorage.setItem('token', token)
      }
      
      // Fetch user data
      await authStore.fetchUser()
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      throw new Error('Invalid authentication data')
    }
  } catch (error: any) {
    console.error('Social auth success error:', error)
    router.push('/login?error=social_auth_failed')
  }
})
</script>

<style scoped>
.social-success-container {
  width: 100%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.content-wrapper {
  max-width: 360px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.5rem 0 0.75rem 0;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.success-message {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.progress-container {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .content-wrapper {
    padding: 1.5rem 0.75rem;
  }
  
  .success-title {
    font-size: 1.125rem;
  }
  
  .success-message {
    font-size: 0.8125rem;
    margin-bottom: 1.25rem;
  }
}
</style>