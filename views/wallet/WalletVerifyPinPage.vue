<!-- pages/wallet/verify-pin.vue -->
<template>
  <v-container
    class="d-flex align-center justify-center"
    style="min-height: 80vh"
  >
    <v-card class="mx-auto wallet-pin-card" elevation="10" max-width="500">
      <!-- Header Section -->
      <v-card-item>
        <v-card-title class="text-h4 font-weight-bold text-center mb-2">
          <v-icon
            icon="mdi-wallet-outline"
            size="36"
            color="primary"
            class="mb-2"
          />
          <div>Wallet Access</div>
        </v-card-title>
        <v-card-subtitle class="text-center mb-6">
          Enter your security PIN to access your wallet
        </v-card-subtitle>
      </v-card-item>

      <!-- Main Content -->
      <v-card-text>
        <v-window v-model="step" :touch="false">
          <!-- Step 1: PIN Entry -->
          <v-window-item :value="1">
            <v-form @submit.prevent="verifyPin" ref="pinForm">
              <p class="text-body-1 text-center mb-4">
                Please enter your 6-digit wallet security PIN
              </p>

              <v-otp-input
                v-model="pin"
                :length="6"
                type="number"
                @finish="verifyPin"
                class="mb-6"
                aria-label="Security PIN input"
                :disabled="walletAuthStore.isLoading"
                autofocus
                hide-details
              ></v-otp-input>

              <div class="d-flex justify-center">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="walletAuthStore.isLoading"
                  :disabled="!isValidPin || walletAuthStore.isLoading"
                  size="large"
                  class="px-8"
                >
                  <v-icon start>mdi-lock-open</v-icon>
                  Access Wallet
                </v-btn>
              </div>

              <div class="text-center mt-6">
                <v-btn
                  variant="text"
                  color="primary"
                  @click="step = 2"
                  :disabled="walletAuthStore.isLoading"
                >
                  Forgot PIN?
                </v-btn>
              </div>
            </v-form>
          </v-window-item>

          <!-- Step 2: Request PIN Reset -->
          <v-window-item :value="2">
            <v-form @submit.prevent="requestReset" ref="resetForm">
              <p class="text-h6 text-center mb-4">Reset Your Wallet PIN</p>
              <p class="text-body-1 text-center mb-6">
                Enter your email address to receive a PIN reset code
              </p>

              <v-radio-group v-model="activationMethod" class="mb-6" row>
                <v-radio
                  :label="`Email (${maskedEmail})`"
                  value="email"
                  color="primary"
                  aria-label="Verify with email"
                ></v-radio>
              </v-radio-group>

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

              <div class="text-center mt-6">
                <v-btn
                  variant="text"
                  @click="step = 1"
                  :disabled="walletAuthStore.isLoading"
                >
                  Back to PIN Entry
                </v-btn>
              </div>
            </v-form>
          </v-window-item>

          <!-- Step 3: Enter Reset Code -->
          <v-window-item :value="3">
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
                  @click="step = 2"
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

          <!-- Step 4: Set New PIN -->
          <v-window-item :value="4">
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
import { useRoute, useRouter } from '#app'
import { useWalletAuthStore } from '~/stores/useWalletAuthStore'
import { useAuthStore } from '~/stores/auth'
import { maskEmail } from '~/utils/masking'

// Route and router
const route = useRoute()
const router = useRouter()

// Store instantiation
const walletAuthStore = useWalletAuthStore()
const authStore = useAuthStore()

// Form references
const pinForm = ref(null)
const resetForm = ref(null)
const codeForm = ref(null)
const newPinForm = ref(null)

// Reactive references
const step = ref(1)
const pin = ref('')
const email = ref('')
const resetCode = ref('')
const newPin = ref('')
const confirmPin = ref('')
const countdownKey = ref(0)
const isCountingDown = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

// Computed properties
const isValidPin = computed(() => pin.value.length === 6)
const isValidResetCode = computed(() => resetCode.value.length === 6)
const isValidNewPin = computed(
  () => newPin.value.length === 6 && confirmPin.value.length === 6
)
const pinMismatch = computed(
  () => newPin.value && confirmPin.value && newPin.value !== confirmPin.value
)
const maskedEmail = computed(() =>
  maskEmail(email.value || authStore.user?.value?.email || '')
)

// Status message helper
const showStatus = (message, type = 'info') => {
  statusMessage.value = message
  statusType.value = type

  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      if (statusMessage.value === message) {
        statusMessage.value = ''
      }
    }, 5000)
  }
}

// Methods
const verifyPin = async () => {
  if (!isValidPin.value) return

  try {
    await walletAuthStore.verifyPin(pin.value)

    // Redirect to wallet page and force a reload to get updated wallet status
    const redirectPath = '/wallet'
    window.location.href = redirectPath // Using window.location.href to force a full page reload
  } catch (error) {
    console.error('PIN verification error:', error)
    pin.value = '' // Clear invalid PIN
  }
}

const requestReset = async () => {
  // Clear previous errors
  walletAuthStore.authError = ''
  statusMessage.value = ''

  // Trim and normalize the email
  const normalizedEmail = email.value.trim().toLowerCase()

  console.log('Requesting reset for email:', normalizedEmail)

  if (!normalizedEmail) {
    showStatus('Email address is required', 'error')
    return
  }

  // Simple email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(normalizedEmail)) {
    showStatus('Please enter a valid email address', 'error')
    return
  }

  try {
    // Use the normalized email
    const result = await walletAuthStore.requestPinReset(normalizedEmail)

    console.log('Reset request successful:', result)

    // Update the email value with the normalized version
    email.value = normalizedEmail

    // Move to the verification code step
    step.value = 3
    countdownKey.value++ // Reset countdown component
    isCountingDown.value = true
    resetCode.value = '' // Clear any previous code

    showStatus('Reset code sent to your email', 'success')
  } catch (error) {
    console.error('Reset request error details:', {
      error,
      response: error.response,
      message: error.message,
      data: error.response?.data,
    })

    // Display appropriate error message
    let errorMessage = 'Failed to send reset code'

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (
      error.message &&
      error.message !== 'Request failed with status code 400'
    ) {
      errorMessage = error.message
    }

    showStatus(errorMessage, 'error')
  }
}

const verifyResetCode = async () => {
  if (!isValidResetCode.value) return

  try {
    await walletAuthStore.verifyResetCode(email.value, resetCode.value)

    step.value = 4
    showStatus('Code verified successfully. Please set a new PIN.', 'success')
  } catch (error) {
    console.error('Verify reset code error:', error)
    resetCode.value = '' // Clear invalid code
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

    // Clear fields and go back to PIN entry
    setTimeout(() => {
      pin.value = ''
      step.value = 1
    }, 2000)
  } catch (error) {
    console.error('Reset PIN error:', error)
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
.wallet-pin-card {
  width: 100%;
  padding: 2rem 1rem;
  border-radius: 16px;
}

@media (min-width: 600px) {
  .wallet-pin-card {
    padding: 2rem;
  }
}

/* Smooth transitions between steps */
.v-window-item {
  transition: all 0.3s ease;
}

/* Improve OTP input styling */
:deep(.v-otp-input input) {
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 8px;
}
</style>
