<!-- views/auth/RegisterPage.vue -->
<template>
  <div class="register-container">
    <!-- Compact Header -->
    <div class="text-center welcome-section">
      <AppLogo
        size="md"
        layout="horizontal"
        :show-slogan="false"
        :is-heading="true"
        text-align="center"
      />
      <h1 class="register-title">Create Your Account</h1>
      <p class="register-subtitle">
        Join {{ appName }} and start your journey
      </p>
    </div>

    <!-- Compact Progress Indicator -->
    <v-progress-linear
      :model-value="progressValue"
      color="primary"
      height="3"
      rounded
      class="mb-3"
    ></v-progress-linear>

    <!-- Form Container -->
    <div class="form-container">
      <RegisterForm />
    </div>

    <!-- Compact Footer -->
    <div class="login-section">
      <v-divider class="mb-2"></v-divider>
      <span class="text-body-2">Already have an account?</span>
      <NuxtLink to="/login" class="text-decoration-none">
        <v-btn
          variant="text"
          color="primary"
          class="ml-1 text-capitalize"
          size="small"
        >
          Sign In
        </v-btn>
      </NuxtLink>
    </div>

    <!-- Compact Terms Footer -->
    <div class="terms-footer">
      <p class="text-caption text-medium-emphasis">
        By creating an account, you agree to our
        <NuxtLink to="/policies/terms-of-service" class="policy-link">
          Terms of Service
        </NuxtLink>
        and
        <NuxtLink to="/policies/privacy-policy" class="policy-link">
          Privacy Policy
        </NuxtLink>
      </p>
    </div>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showErrorSnackbar"
      :timeout="5000"
      color="error"
      location="top"
    >
      {{ errorMessage }}
      <template #actions>
        <v-btn color="white" variant="text" @click="handleRefresh" size="small">
          Retry
        </v-btn>
        <v-btn
          color="white"
          variant="text"
          @click="showErrorSnackbar = false"
          size="small"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppsStore } from '@/stores/useApps'
import { useRegisterStore } from '~/stores/useRegister'

const router = useRouter()
const appsStore = useAppsStore()
const registerStore = useRegisterStore()
const talastageApp = computed(() => appsStore.talastageApp)

// Local state for error display
const showErrorSnackbar = ref(false)
const errorMessage = ref('')

// Computed: app name or fallback
const appName = computed(() => talastageApp.value?.name || 'TalaStage')

// Progress value based on current step
const progressValue = computed(() => {
  switch (registerStore.step) {
    case 'contact-info':
      return 33.33
    case 'verification':
      return 66.66
    case 'personal-info':
      return 100
    default:
      return 33.33
  }
})

// Retry action for error snackbar
const handleRefresh = async () => {
  showErrorSnackbar.value = false
  errorMessage.value = ''
  try {
    await appsStore.refreshData()
  } catch (error) {
    errorMessage.value = 'Failed to refresh data. Please try again.'
    showErrorSnackbar.value = true
  }
}

// Watch for store errors
watch(
  () => appsStore.error,
  (newError) => {
    if (newError) {
      errorMessage.value = newError
      showErrorSnackbar.value = true
    }
  }
)

// On mount, ensure app data is loaded
onMounted(async () => {
  try {
    if (!appsStore.talastageApp) {
      await appsStore.fetchTalaStageApp()
    }
  } catch (error) {
    errorMessage.value =
      'Failed to load application data. Please refresh the page.'
    showErrorSnackbar.value = true
  }
})
</script>

<style scoped>
.register-container {
  width: 100%;
  padding: 0;
}

.welcome-section {
  margin-bottom: 1rem;
}

.register-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem 0;
}

.register-subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0;
}

.form-container {
  margin-bottom: 0.75rem;
}

.login-section {
  text-align: center;
  margin-bottom: 0.75rem;
}

.terms-footer {
  text-align: center;
  margin-top: 0.5rem;
}

.policy-link {
  color: var(--v-primary-base);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.policy-link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .welcome-section {
    margin-bottom: 0.75rem;
  }
  
  .register-title {
    font-size: 1rem;
  }
  
  .register-subtitle {
    font-size: 0.8125rem;
  }
}
</style>
