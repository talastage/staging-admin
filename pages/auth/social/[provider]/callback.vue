<template>
  <div class="social-callback-page">
    <v-container class="d-flex justify-center align-center min-vh-100">
      <v-card class="pa-8 text-center" max-width="400" elevation="2">
        <v-progress-circular
          v-if="isProcessing"
          indeterminate
          color="primary"
          size="64"
          class="mb-4"
        />
        
        <v-icon
          v-else-if="hasError"
          icon="mdi-alert-circle"
          color="error"
          size="64"
          class="mb-4"
        />
        
        <v-icon
          v-else
          icon="mdi-check-circle"
          color="success"
          size="64"
          class="mb-4"
        />

        <h2 class="text-h6 mb-2">
          {{ isProcessing ? 'Processing...' : hasError ? 'Authentication Failed' : 'Success!' }}
        </h2>
        
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ statusMessage }}
        </p>

        <v-btn
          v-if="hasError"
          color="primary"
          variant="outlined"
          @click="redirectToLogin"
        >
          Try Again
        </v-btn>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useRegisterStore } from '~/stores/useRegister'

definePageMeta({
  layout: 'auth-layout',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const registerStore = useRegisterStore()

const isProcessing = ref(true)
const hasError = ref(false)
const statusMessage = ref('Processing your authentication...')

const redirectToLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  try {
    const provider = route.params.provider as string
    const code = route.query.code as string
    const state = route.query.state as string
    const error = route.query.error as string

    if (error) {
      throw new Error(`Authentication failed: ${error}`)
    }

    if (!code) {
      throw new Error('No authorization code received')
    }

    // Call backend to handle the callback
    const { $axios } = useNuxtApp()
    const response = await $axios.get(`/auth/social/${provider}/callback`, {
      params: { code, state }
    })

    const data = response.data

    if (data.requires_personal_info) {
      // User needs to complete registration
      statusMessage.value = 'Please complete your profile information'
      
      registerStore.setSocialRegistration({
        userId: data.user_id,
        socialData: data.social_data,
        isSocial: true
      })
      
      // Redirect to registration page
      setTimeout(() => {
        router.push('/register')
      }, 2000)
    } else if (data.user && data.token) {
      // Complete login
      statusMessage.value = 'Login successful! Redirecting...'
      
      await authStore.handleRegistrationSuccess({
        user: data.user,
        token: data.token
      })
      
      // Redirect to home
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      throw new Error('Unexpected response from server')
    }
  } catch (error: any) {
    console.error('Social auth callback error:', error)
    hasError.value = true
    statusMessage.value = error.message || 'Authentication failed. Please try again.'
  } finally {
    isProcessing.value = false
  }
})
</script>

<style scoped>
.social-callback-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.min-vh-100 {
  min-height: 100vh;
}
</style>