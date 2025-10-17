<!-- pages/wallet/reset-pin.vue -->
<template>
    <v-container
      class="d-flex align-center justify-center"
      style="min-height: 80vh"
    >
      <v-card class="mx-auto wallet-reset-card" elevation="10" max-width="500">
        <!-- Header Section -->
        <v-card-item>
          <v-card-title class="text-h4 font-weight-bold text-center mb-2">
            <v-icon
              icon="mdi-lock-reset"
              size="36"
              color="primary"
              class="mb-2"
            />
            <div>Reset Wallet PIN</div>
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            Follow the steps to reset your wallet security PIN
          </v-card-subtitle>
        </v-card-item>
  
        <!-- Main Content -->
        <v-card-text>
          <v-window v-model="step" :touch="false">
            <!-- Step 1: Request Reset Code -->
            <v-window-item :value="1">
              <v-form @submit.prevent="requestReset" ref="resetForm">
                <p class="text-h6 text-center mb-4">Request Reset Code</p>
                <p class="text-body-1 text-center mb-6">
                  Enter your email address to receive a PIN reset code
                </p>
  
                <v-text-field
                  v-model="email"
                  label="Email Address"
                  type="email"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  placeholder="Enter your email"
                  class="mb-4"
                  :disabled="walletAuthStore.isLoading"
                ></v-text-field>
  
                <div class="d-flex justify-center">
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="walletAuthStore.isLoading"
                    :disabled="!email || walletAuthStore.isLoading"
                    size="large"
                    class="px-8"
                  >
                    <v-icon start>mdi-email-outline</v-icon>
                    Send Reset Code
                  </v-btn>
                </div>
              </v-form>
            </v-window-item>
  
            <!-- Step 2: Enter Reset Code -->
            <v-window-item :value="2">
              <v-form @submit.prevent="verifyResetCode" ref="codeForm">
                <p class="text-h6 text-center mb-4">Enter Reset Code</p>
                <p class="text-body-1 text-center mb-6">
                  We've sent a 6-digit code to your email ({{ maskedEmail }})
                </p>
  
                <v-otp-input
                  v-model="resetCode"
                  :length="6"
                  type="number"
                  @finish="verifyResetCode"
                  class="mb-4"
                  aria-label="Reset code input"
                  :disabled="walletAuthStore.isLoading"
                  autofocus
                ></v-otp-input>
  
                <div class="text-center mb-4">
                  <v-chip color="info" variant="outlined">
                    <v-icon start>mdi-clock-outline</v-icon>
                    Code expires in
                    <CountdownDateTimer
                      :key="countdownKey"
                      :seconds="180"
                      @finished="handleCountdownFinished"
                    />
                  </v-chip>
                </div>
  
                <div class="d-flex justify-center">
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="walletAuthStore.isLoading"
                    :disabled="!isValidResetCode || walletAuthStore.isLoading"
                    size="large"
                    class="px-8"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    Verify Code
                  </v-btn>
                </div>
  
                <div class="text-center mt-6">
                  <v-btn
                    variant="text"
                    @click="step = 1"
                    :disabled="walletAuthStore.isLoading || isCountingDown"
                  >
                    Back
                  </v-btn>
                  <v-btn
                    variant="text"
                    @click="requestReset"
                    :disabled="walletAuthStore.isLoading || isCountingDown"
                    class="ms-4"
                  >
                    Resend Code
                  </v-btn>
                </div>
              </v-form>
            </v-window-item>
  
            <!-- Step 3: Set New PIN -->
            <v-window-item :value="3">
              <v-form @submit.prevent="resetPin" ref="newPinForm">
                <p class="text-h6 text-center mb-4">Set New PIN</p>
                <p class="text-body-1 text-center mb-6">
                  Enter a new 6-digit security PIN for your wallet
                </p>
  
                <p class="text-subtitle-2 mb-2">New PIN</p>
                <v-otp-input
                  v-model="newPin"
                  :length="6"
                  type="number"
                  class="mb-4"
                  aria-label="New PIN input"
                  :disabled="walletAuthStore.isLoading"
                  autofocus
                ></v-otp-input>
  
                <p class="text-subtitle-2 mb-2">Confirm New PIN</p>
                <v-otp-input
                  v-model="confirmPin"
                  :length="6"
                  type="number"
                  class="mb-6"
                  aria-label="Confirm PIN input"
                  :disabled="walletAuthStore.isLoading"
                ></v-otp-input>
  
                <div v-if="pinMismatch" class="text-error text-center mb-4">
                  PINs do not match. Please try again.
                </div>
  
                <div class="d-flex justify-center">
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="walletAuthStore.isLoading"
                    :disabled="!isValidNewPin || walletAuthStore.isLoading"
                    size="large"
                    class="px-8"
                  >
                    <v-icon start>mdi-lock-reset</v-icon>
                    Reset PIN
                  </v-btn>
                </div>
              </v-form>
            </v-window-item>
          </v-window>
  
          <!-- Status Messages -->
          <v-slide-y-transition>
            <v-alert
              v-if="walletAuthStore.authError"
              type="error"
              variant="tonal"
              class="mt-4"
              density="comfortable"
              border="start"
              closable
              @click:close="walletAuthStore.authError = ''"
            >
              {{ walletAuthStore.authError }}
            </v-alert>
          </v-slide-y-transition>
  
          <v-slide-y-transition>
            <v-alert
              v-if="statusMessage"
              :type="statusType"
              variant="tonal"
              class="mt-4"
              density="comfortable"
              border="start"
              closable
              @click:close="statusMessage = ''"
            >
              {{ statusMessage }}
            </v-alert>
          </v-slide-y-transition>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter } from '#app'
  import { useWalletAuthStore } from '~/stores/useWalletAuthStore'
  import { useAuthStore } from '~/stores/auth'
  import { maskEmail } from '~/utils/masking'
  
  
  // Router and stores
  const router = useRouter()
  const walletAuthStore = useWalletAuthStore()
  const authStore = useAuthStore()
  
  // Form references
  const resetForm = ref(null)
  const codeForm = ref(null)
  const newPinForm = ref(null)
  
  // Reactive references
  const step = ref(1)
  const email = ref('')
  const resetCode = ref('')
  const newPin = ref('')
  const confirmPin = ref('')
  const countdownKey = ref(0)
  const isCountingDown = ref(false)
  const statusMessage = ref('')
  const statusType = ref('info')
  
  // Computed properties
  const isValidResetCode = computed(() => resetCode.value.length === 6)
  const isValidNewPin = computed(
    () => newPin.value.length === 6 && confirmPin.value.length === 6
  )
  const pinMismatch = computed(
    () => newPin.value && confirmPin.value && newPin.value !== confirmPin.value
  )
  const maskedEmail = computed(() => maskEmail(email.value || ''))
  
  // Status message helper
  const showStatus = (message, type = 'info') => {
    statusMessage.value = message
    statusType.value = type
  
    if (type === 'success') {
      setTimeout(() => {
        if (statusMessage.value === message) {
          statusMessage.value = ''
        }
      }, 5000)
    }
  }
  
  // Methods
  const requestReset = async () => {
    walletAuthStore.authError = ''
    statusMessage.value = ''
  
    const normalizedEmail = email.value.trim().toLowerCase()
  
    if (!normalizedEmail) {
      showStatus('Email address is required', 'error')
      return
    }
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(normalizedEmail)) {
      showStatus('Please enter a valid email address', 'error')
      return
    }
  
    try {
      await walletAuthStore.requestPinReset(normalizedEmail)
      email.value = normalizedEmail
      step.value = 2
      countdownKey.value++
      isCountingDown.value = true
      resetCode.value = ''
      showStatus('Reset code sent to your email', 'success')
    } catch (error) {
      showStatus(error.message || 'Failed to send reset code', 'error')
    }
  }
  
  const verifyResetCode = async () => {
    if (!isValidResetCode.value) return
  
    try {
      await walletAuthStore.verifyResetCode(email.value, resetCode.value)
      step.value = 3
      showStatus('Code verified successfully. Please set a new PIN.', 'success')
    } catch (error) {
      resetCode.value = ''
      showStatus(error.message || 'Invalid reset code', 'error')
    }
  }
  
  const resetPin = async () => {
    if (!isValidNewPin.value) return
  
    if (pinMismatch.value) {
      showStatus('PINs do not match. Please try again.', 'error')
      return
    }
  
    try {
      await walletAuthStore.resetPin(email.value, resetCode.value, newPin.value)
      showStatus('Your PIN has been reset successfully', 'success')
      setTimeout(() => {
        router.push('/wallet')
      }, 2000)
    } catch (error) {
      showStatus(error.message || 'Failed to reset PIN', 'error')
    }
  }
  
  const handleCountdownFinished = () => {
    isCountingDown.value = false
    showStatus('Reset code has expired. Please request a new one.', 'warning')
  }
  
  // Pre-fill email if user is logged in
  if (authStore.user?.value?.email) {
    email.value = authStore.user.value.email
  }
  </script>
  
  <style scoped>
  .wallet-reset-card {
    width: 100%;
    padding: 2rem 1rem;
    border-radius: 16px;
  }
  
  @media (min-width: 600px) {
    .wallet-reset-card {
      padding: 2rem;
    }
  }
  
  .v-window-item {
    transition: all 0.3s ease;
  }
  
  :deep(.v-otp-input input) {
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: 8px;
  }
  </style>
  