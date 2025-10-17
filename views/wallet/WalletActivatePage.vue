<template>
  <v-card
    class="wallet-activation-card"
    elevation="2"
    rounded="xl"
  >
      <!-- Compact Header Section -->
      <v-card-item class="header-section pa-4">
        <div class="text-center">
          <v-avatar size="48" color="primary" class="mb-3">
            <v-icon color="white" size="24">mdi-wallet-plus</v-icon>
          </v-avatar>
          <h2 class="text-h5 font-weight-bold mb-2">Activate Your Wallet</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Secure your transactions with wallet activation
          </p>
        </div>
      </v-card-item>

      <!-- Compact Progress Indicator -->
      <v-card-text class="stepper-section pa-4 pt-2">
        <div class="d-flex justify-center align-center mb-4">
          <div 
            v-for="i in 4" 
            :key="i" 
            :class="['progress-dot', { 'active': step >= i, 'completed': step > i }]"
          >
            <v-icon v-if="step > i" size="12" color="white">mdi-check</v-icon>
            <span v-else class="dot-number">{{ i }}</span>
          </div>
        </div>
      </v-card-text>

      <!-- Main Content -->
      <v-card-text class="main-content pa-4">
        <v-window v-model="step" :touch="false">
          <!-- Step 1: Email Selection -->
          <v-window-item :value="1">
            <v-form @submit.prevent="sendCode" ref="emailForm">
              <p class="text-body-1 mb-4">Verify with your registered email:</p>
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
                  @click="sendCode"
                  :loading="isLoading"
                  :disabled="!activationMethod || isLoading"
                  size="default"
                  class="px-6"
                >
                  <v-icon start size="18">mdi-email-send</v-icon>
                  Send Code
                </v-btn>
              </div>
            </v-form>
          </v-window-item>

          <!-- Step 2: Code Verification -->
          <v-window-item :value="2">
            <v-form @submit.prevent="verifyCode" ref="codeForm">
              <p class="text-h6 text-center mb-4">Enter Verification Code</p>
              <p class="text-body-1 text-center mb-6">
                We've sent a 6-digit code to your email
                <span>({{ maskedEmail }})</span>
              </p>
              <v-otp-input
                v-model="activationCode"
                :length="6"
                type="number"
                @finish="verifyCode"
                class="mb-4"
                aria-label="Verification code input"
                :disabled="isLoading"
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
                  :loading="isLoading"
                  :disabled="!isValidActivationCode || isLoading"
                  size="default"
                  class="px-6"
                >
                  <v-icon start size="18">mdi-check-circle</v-icon>
                  Verify Code
                </v-btn>
              </div>
            </v-form>
          </v-window-item>

          <!-- Step 3: Currency Selection -->
          <v-window-item :value="3">
            <WalletCurrencySelector
              :wallet-id="activationStore.walletId"
              :allow-skip="true"
              @success="handleActivationComplete"
              @skip="handleActivationComplete"
              @error="handleCurrencyError"
            />
          </v-window-item>

          <!-- Step 4: Success with PIN Display -->
          <v-window-item :value="4">
            <div class="text-center">
              <v-icon
                icon="mdi-check-circle"
                size="80"
                color="success"
                class="mb-4"
              />

              <h2 class="text-h4 text-success mb-4">
                Wallet Activated Successfully!
              </h2>

              <p class="text-body-1 mb-6">
                Your wallet has been successfully activated! We've sent your
                wallet PIN to your email.
              </p>

              <div
                class="pin-container text-center my-6 pa-4 rounded bg-grey-lighten-4"
              >
                <p class="text-caption mb-2">Your Wallet PIN:</p>
                <div class="pin-display">{{ walletPin }}</div>
                <p class="text-caption mt-2">Keep this PIN secure!</p>
              </div>

              <v-alert
                type="warning"
                variant="tonal"
                class="mb-6"
                border="start"
                density="compact"
              >
                <strong>Important:</strong> This PIN will be required to access
                your wallet and authorize transactions. Please store it in a
                secure place and never share it with anyone.
              </v-alert>

              <p class="text-body-2 mb-6">
                We've also sent this PIN to your email for your records. For
                security reasons, this is the only time we'll display your PIN
                on screen.
              </p>

              <div class="d-flex justify-center">
                <v-btn
                  color="primary"
                  size="default"
                  class="px-6"
                  @click="goToWallet"
                >
                  <v-icon start size="18">mdi-wallet</v-icon>
                  Go to My Wallet
                </v-btn>
              </div>
            </div>
          </v-window-item>
        </v-window>

        <!-- Status Messages -->
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

      <!-- Action Buttons -->
      <v-card-actions class="action-buttons" v-if="step < 4">
        <v-btn
          v-if="step === 2"
          variant="text"
          @click="goBack"
          prepend-icon="mdi-arrow-left"
          :disabled="isLoading"
        >
          Back
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="step === 2"
          variant="text"
          @click="resendCode"
          :disabled="isCountingDown || isLoading"
          prepend-icon="mdi-refresh"
        >
          Resend Code
        </v-btn>
      </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWalletActivationStore } from '~/stores/useWalletActivationStore'
import { useAuthStore } from '~/stores/auth'
import { useCurrencyStore } from '~/stores/useCurrencies'
import { useWalletStore } from '~/stores/useWalletStore'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { maskEmail } from '~/utils/masking'
import CountdownDateTimer from '~/components/counts/CountdownDateTimer.vue'

// Store instantiation using Nuxt 3 built-in functions
const router = useRouter()
const { $axios } = useNuxtApp()
const activationStore = useWalletActivationStore()
const authStore = useAuthStore()
const currencyStore = useCurrencyStore()
const walletStore = useWalletStore()
const snackbarStore = useSnackMessageStore()

// Form references
const emailForm = ref(null)
const codeForm = ref(null)

const handleCurrencyError = (error) => {
  handleError(error, 'Failed to update wallet currency')
}
const walletPin = ref('')

// Reactive references
const step = ref(1)
const activationMethod = ref('email') // Local state for activation method
const activationCode = ref('')
const countdownKey = ref(0)
const isCountingDown = ref(false)
const statusMessage = ref('')
const statusType = ref('info')
const isLoading = ref(false)
const debugMode = ref(process.env.NODE_ENV === 'development') // Enable debug in dev mode

// Computed properties
const isValidActivationCode = computed(() => activationCode.value.length === 6)
const maskedEmail = computed(() => maskEmail(authStore.user?.value?.email || ''))

// Status message helper
const showStatus = (message, type = 'info') => {
  if (type === 'error') {
    snackbarStore.error(message, { timeout: 5000, closable: true })
  } else {
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
}

// Error handling
const handleError = (error, defaultMessage) => {
  console.error('Error:', error) // Log the full error for debugging

  // Extract the actual error message from the response if available
  let displayMessage = defaultMessage

  if (error?.response?.data?.message) {
    displayMessage = error.response.data.message
  } else if (error?.message) {
    displayMessage = error.message
  }

  snackbarStore.error(displayMessage)
}

// Methods
const handleCountdownFinished = () => {
  isCountingDown.value = false
  showStatus(
    'Verification code has expired. Please request a new one.',
    'warning'
  )
}

const sendCode = async () => {
  console.log('Send code button clicked') // Debug log

  try {
    isLoading.value = true
    statusMessage.value = '' // Clear any previous status

    // Make direct API call instead of using the store to debug
    const response = await $axios.post('/api/wallet/activation/send-code', {
      method: activationMethod.value,
    })

    console.log('Send code response:', response.data) // Debug log

    step.value = 2
    countdownKey.value++ // Reset countdown component
    isCountingDown.value = true
    showStatus(`Activation code sent to your email`, 'success')
  } catch (error) {
    console.error('Send code error:', error) // Debug log
    handleError(error, 'Failed to send activation code')
  } finally {
    isLoading.value = false
  }
}

const verifyCode = async () => {
  if (!isValidActivationCode.value) return

  statusMessage.value = '' // Clear any previous status

  try {
    isLoading.value = true

    // Make direct API call instead of using the store to debug
    const response = await $axios.post('/api/wallet/activation/verify-code', {
      code: activationCode.value,
      method: activationMethod.value,
    })

    console.log('Verify code response:', response.data) // Debug log

    showStatus('Email verified successfully', 'success')

    // Fetch required data in parallel
    try {
      await Promise.all([
        currencyStore.fetchCurrencies(),
        walletStore.fetchWallet(),
      ])
      step.value = 3
    } catch (dataError) {
      handleError(
        dataError,
        'Verification successful, but failed to load wallet data'
      )
    }
  } catch (error) {
    console.error('Verify code error:', error) // Debug log
    handleError(error, 'Failed to verify activation code')
    activationCode.value = '' // Clear invalid code
  } finally {
    isLoading.value = false
  }
}

const resendCode = async () => {
  statusMessage.value = '' // Clear any previous status

  try {
    isLoading.value = true

    // Make direct API call instead of using the store to debug
    const response = await $axios.post('/api/wallet/activation/resend-code', {
      method: activationMethod.value,
    })

    console.log('Resend code response:', response.data) // Debug log

    countdownKey.value++ // Reset countdown component
    isCountingDown.value = true
    activationCode.value = '' // Clear previous code
    showStatus(`New activation code sent to your email`, 'success')
  } catch (error) {
    console.error('Resend code error:', error) // Debug log
    handleError(error, 'Failed to resend activation code')
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  step.value = 1
  statusMessage.value = ''
}

const goToWallet = async () => {
  try {
    await navigateTo('/wallet/verify-pin')
  } catch (error) {
    console.error('Navigation error:', error)
    // Fallback to router.push if navigateTo fails
    await router.push('/wallet/verify-pin')
  }
}

const handleActivationComplete = async (result) => {
  try {
    isLoading.value = true
    if (!result) {
      const response = await $axios.post('/api/wallet/activation/complete')
      result = response.data
    }
    console.log('Activation complete:', result)
    if (result.pin) {
      walletPin.value = result.pin
      step.value = 4 // Move to PIN display step instead of showing dialog
    } else {
      snackbarStore.success('Wallet activated successfully!')
      await navigateTo('/wallet')
    }
  } catch (error) {
    handleError(error, 'Failed to complete wallet activation')
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(step, (newStep) => {
  if (newStep === 1) {
    activationCode.value = ''
    isCountingDown.value = false
  }
})

// Lifecycle hooks
onMounted(async () => {
  console.log('WalletActivatePage mounted') // Debug log

  // Check if user is eligible for wallet activation
  try {
    isLoading.value = true

    // Make direct API call instead of using the store to debug
    const response = await $axios.get('/api/wallet/activation/eligibility')

    console.log('Eligibility response:', response.data) // Debug log

    const data = response.data

    // Update local state based on response
    activationStore.canActivateByEmail = data.canActivateByEmail
    activationStore.activationStatus.isActivated = data.isActivated
    activationStore.activationStatus.isPending = data.isPending

    // If wallet is already activated, redirect to wallet page
    if (data.isActivated) {
      snackbarStore.info('Your wallet is already activated')
      await navigateTo('/wallet')
      return
    }

    // If activation is pending, we can try to resume
    if (data.isPending) {
      step.value = 2
      countdownKey.value++
      isCountingDown.value = true
      showStatus('Please enter the verification code sent earlier', 'info')
    }
  } catch (error) {
    console.error('Eligibility check error:', error) // Debug log
    handleError(error, 'Failed to check activation eligibility')

    // Redirect if there's an error
    await navigateTo('/dashboard')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.pin-container {
  border: 1px dashed #5c6bc0;
}

.pin-display {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 5px;
  color: #5c6bc0;
  font-family: monospace;
}

.wallet-activation-card {
  width: 100%;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 1px solid rgba(98, 0, 234, 0.1);
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

/* Desktop stepper fixes */
.wallet-stepper :deep(.v-stepper-header) {
  justify-content: space-between;
  width: 100%;
}

.wallet-stepper :deep(.v-stepper-item) {
  flex: 1;
  min-width: 0;
}

.wallet-stepper :deep(.v-stepper-header) {
  overflow: visible;
  padding: 0 8px;
}

.wallet-stepper :deep(.v-stepper-item__avatar) {
  position: relative;
  z-index: 1;
}

.wallet-stepper :deep(.v-divider) {
  display: none;
}

/* Compact progress dots */
.progress-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 6px;
  transition: all 0.3s ease;
  position: relative;
}

.progress-dot.active {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.progress-dot.completed {
  background-color: rgb(var(--v-theme-success));
}

.progress-dot:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -18px;
  width: 12px;
  height: 2px;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
}

.progress-dot.completed:not(:last-child)::after {
  background-color: rgb(var(--v-theme-success));
}

.dot-number {
  font-size: 12px;
  font-weight: 600;
}
</style>

<style scoped>
.wallet-container {
  padding: 8px !important;
}

.wallet-activation-card {
  width: 100%;
  margin: 0 8px;
}

.header-section {
  padding: 16px 16px 8px 16px !important;
}

.wallet-title {
  font-size: 1.5rem !important;
  font-weight: bold;
}

.wallet-subtitle {
  margin-bottom: 16px !important;
}

.stepper-section {
  padding: 8px 16px 0 16px !important;
}

.wallet-stepper {
  margin-bottom: 16px !important;
}

.main-content {
  padding: 16px !important;
}

.action-buttons {
  padding: 8px 16px 16px 16px !important;
}

/* Mobile specific adjustments */
@media (max-width: 600px) {
  .wallet-container {
    padding: 4px !important;
    min-height: 85vh !important;
  }
  
  .wallet-activation-card {
    margin: 0 4px;
  }
  
  .header-section {
    padding: 12px 12px 4px 12px !important;
  }
  
  .wallet-title {
    font-size: 1.25rem !important;
  }
  
  .stepper-section {
    padding: 4px 12px 0 12px !important;
  }
  
  .wallet-stepper {
    margin-bottom: 12px !important;
  }
  
  .main-content {
    padding: 12px !important;
  }
  
  .action-buttons {
    padding: 4px 12px 12px 12px !important;
  }
  
  .pin-container {
    margin: 16px 0 !important;
    padding: 12px !important;
  }
}

/* Extra small devices */
@media (max-width: 400px) {
  .wallet-container {
    padding: 2px !important;
  }
  
  .wallet-activation-card {
    margin: 0 2px;
  }
  
  .header-section {
    padding: 8px !important;
  }
  
  .stepper-section {
    padding: 2px 8px 0 8px !important;
  }
  
  .main-content {
    padding: 8px !important;
  }
  
  .action-buttons {
    padding: 4px 8px 8px 8px !important;
  }
}
</style>
<style scoped>
/* Mobile progress dots */
.mobile-step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  transition: all 0.3s ease;
  position: relative;
}

.mobile-step-dot.active {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.mobile-step-dot.completed {
  background-color: rgb(var(--v-theme-success));
}

.mobile-step-dot:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -12px;
  width: 8px;
  height: 2px;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
}

.mobile-step-dot.completed:not(:last-child)::after {
  background-color: rgb(var(--v-theme-success));
}

.step-number {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 400px) {
  .mobile-step-dot {
    width: 28px;
    height: 28px;
    margin: 0 2px;
  }
  
  .step-number {
    font-size: 12px;
  }
}
</style>