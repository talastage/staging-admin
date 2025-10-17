<template>
  <div class="social-complete-container">
    <div class="content-wrapper">
      <div class="text-center header-section">
        <v-icon
          icon="mdi-account-plus"
          color="primary"
          size="48"
          class="mb-3"
        />
        <h2 class="page-title">Complete Your Profile</h2>
        <p class="page-subtitle">
          Please provide additional information to complete your registration.
        </p>
      </div>

      <SocialPersonalInfoForm
        v-if="socialData"
        :user-id="userId"
        :social-data="socialData"
        :provider="provider"
        @success="handleSuccess"
        @error="handleError"
        class="form-section"
      />

      <div v-else class="text-center loading-section">
        <v-progress-circular indeterminate color="primary" size="32" />
        <p class="loading-text">Loading...</p>
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

const userId = ref<number | null>(null)
const socialData = ref<any>(null)
const provider = ref('')

const handleSuccess = async (data: any) => {
  try {
    // Use the handleRegistrationSuccess method
    await authStore.handleRegistrationSuccess({
      user: data.user,
      token: data.token
    })
  } catch (error) {
    console.error('Registration completion error:', error)
    handleError('Failed to complete registration')
  }
}

const handleError = (error: string) => {
  console.error('Social registration error:', error)
  router.push('/login?error=registration_failed')
}

onMounted(() => {
  try {
    const socialAuth = route.query.social_auth as string
    const userIdParam = route.query.user_id as string
    const providerParam = route.query.provider as string
    const firstName = route.query.first_name as string
    const lastName = route.query.last_name as string

    if (socialAuth === 'register' || socialAuth === 'incomplete') {
      userId.value = parseInt(userIdParam)
      provider.value = providerParam
      
      socialData.value = {
        first_name: firstName || '',
        last_name: lastName || '',
        provider: providerParam
      }
    } else {
      throw new Error('Invalid social authentication data')
    }
  } catch (error: any) {
    console.error('Social complete page error:', error)
    router.push('/login?error=invalid_social_data')
  }
})
</script>

<style scoped>
.social-complete-container {
  width: 100%;
  padding: 0;
}

.content-wrapper {
  max-width: 420px;
  margin: 0 auto;
  padding: 0;
}

.header-section {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem 0;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.page-subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.4;
}

.form-section {
  margin-top: 0.5rem;
}

.loading-section {
  padding: 2rem 0;
}

.loading-text {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 0.75rem;
  margin-bottom: 0;
}

@media (max-width: 600px) {
  .header-section {
    margin-bottom: 1rem;
  }
  
  .page-title {
    font-size: 1.125rem;
  }
  
  .page-subtitle {
    font-size: 0.8125rem;
  }
}
</style>