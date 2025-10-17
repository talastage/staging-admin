<!-- views/auth/LoginPage.vue -->
<template>
  <div class="login-container">
    <div class="login-content">
      <!-- Compact Logo & Welcome -->
      <div class="text-center welcome-section">
        <AppLogo
          size="md"
          layout="horizontal"
          :show-slogan="false"
          :is-heading="true"
          text-align="center"
        />
        <p class="welcome-text">
          Welcome back! Sign in to your account
        </p>
      </div>

      <!-- Login Form -->
      <LoginForm @login-success="handleLoginSuccess" />

      <!-- Registration Link -->
      <div class="text-center registration-section">
        <span class="text-body-2">New to {{ appName }}?</span>
        <NuxtLink to="/register" class="text-decoration-none">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            class="ml-1 text-capitalize"
          >
            Create Account
          </v-btn>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppsStore } from '@/stores/useApps'

const router = useRouter()
const appsStore = useAppsStore()
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')

const handleLoginSuccess = () => {
  router.push('/')
}
</script>

<style scoped>
.login-container {
  width: 100%;
  padding: 0;
}

.login-content {
  width: 100%;
  animation: fadeIn 0.4s ease-out;
}

.welcome-section {
  margin-bottom: 1rem;
}

.welcome-text {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.registration-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .welcome-section {
    margin-bottom: 0.75rem;
  }
  
  .registration-section {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }
}
</style>
