<!-- components/LoginDialog.vue -->
<template>
  <v-dialog
    v-model="loginDialogStore.isVisible"
    max-width="480px"
    persistent
    :scrim="scrimColor"
    transition="dialog-bottom-transition"
  >
    <v-card class="login-dialog" :rounded="rounded">
      <!-- Dialog Header -->
      <v-card-title class="dialog-header pa-4">
        <div class="d-flex justify-space-between align-center w-100">
          <AppLogo
            size="sm"
            :show-text="true"
            :show-slogan="false"
            layout="horizontal"
          />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="handleClose"
          />
        </div>
      </v-card-title>

      <!-- Dialog Content -->
      <v-card-text class="pa-4 pt-6">
        <!-- Welcome Message -->
        <div class="text-center mb-6">
          <h2 class="text-h6 font-weight-medium mb-2">Welcome Back</h2>
          <p class="text-body-1 text-medium-emphasis">
            Sign in to continue to your account
          </p>
        </div>

        <!-- Error Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="authStore.loginError"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="authStore.clearLoginError"
          >
            {{ authStore.loginError }}
          </v-alert>
        </v-slide-y-transition>

        <!-- Login Form -->
        <LoginForm @login-success="handleLoginSuccess" class="login-form" />

        <!-- Registration Link -->
        <div class="text-center mt-4">
          <span class="text-body-2">Don't have an account?</span>
          <v-btn
            variant="text"
            color="primary"
            class="ml-2"
            @click="handleRegisterClick"
          >
            Create Account
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLoginDialogStore } from '~/stores/loginDialog'
import { useAuthStore } from '~/stores/auth'

const loginDialogStore = useLoginDialogStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const rounded = computed(() => ({ lg: true }))
const scrimColor = computed(() => 'rgba(0, 0, 0, 0.7)')

const handleLoginSuccess = () => {
  loginDialogStore.hide()
  authStore.clearLoginError()
}

const handleClose = () => {
  if (!loginDialogStore.loading) {
    loginDialogStore.hide()
    authStore.clearLoginError()
  }
}

const handleRegisterClick = () => {
  loginDialogStore.hide()
  router.push('/register')
}

// Whenever the route changes, hide the dialog
watch(
  () => route.fullPath,
  () => {
    if (loginDialogStore.isVisible) {
      loginDialogStore.hide()
      authStore.clearLoginError()
    }
  }
)

onUnmounted(() => {
  authStore.clearLoginError()
})
</script>

<style scoped>
.login-dialog {
  overflow: hidden;
}

.dialog-header {
  border-bottom: 1px solid var(--v-border-opacity-variant-base);
  background: var(--v-surface-variant-base);
}

.login-form {
  margin: 0 auto;
  max-width: 100%;
}

/* Animation for error alert */
.v-alert {
  transition: all 0.3s ease;
}

/* Dialog transition */
:deep(.dialog-bottom-transition-enter-active),
:deep(.dialog-bottom-transition-leave-active) {
  transition: transform 0.3s ease-in-out;
}

:deep(.dialog-bottom-transition-enter-from),
:deep(.dialog-bottom-transition-leave-to) {
  transform: translateY(100%);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-dialog {
    margin: 0;
    position: fixed;
    bottom: 0;
    width: 100%;
    max-width: none !important;
  }

  .login-dialog {
    border-radius: 16px 16px 0 0 !important;
  }

  .v-card-text {
    padding: 1.5rem !important;
  }
}

/* Optional: Add loading overlay */
:deep(.v-overlay__scrim) {
  backdrop-filter: blur(4px);
}
</style>
