<!-- VerificationForm.vue -->
<template>
  <div class="verification-form">
    <div class="mb-3 d-flex justify-space-between align-center">
      <div>
        <h3 class="text-subtitle-1 font-weight-medium mb-1">Verify Email</h3>
        <p class="text-caption text-medium-emphasis">
          Code sent to <strong>{{ registerStore.email }}</strong>
        </p>
      </div>
      <v-btn
        variant="text"
        density="comfortable"
        size="small"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Back
      </v-btn>
    </div>

    <div class="text-center mb-3">
      <div class="text-subtitle-1 font-weight-medium">
        Enter Verification Code
      </div>
      <div class="text-caption mb-1" :class="{ 'text-error': isExpiringSoon }">
        Code expires in: {{ formattedTimeRemaining }}
      </div>
    </div>

    <v-otp-input
      v-model="verificationCode"
      :length="6"
      density="comfortable"
      :error-messages="registerStore.errors.verification_code"
      class="mb-4"
    />

    <v-btn
      @click="verify"
      color="primary"
      block
      class="mb-4"
      :loading="isVerifying"
      :disabled="isVerifying || verificationCode.length !== 6"
      height="48"
    >
      Verify Code
    </v-btn>

    <div class="text-center resend-container">
      <div class="d-flex align-center justify-center">
        <span class="text-body-2 me-2">Didn't receive the code?</span>
        <v-btn
          @click="resendCode"
          variant="text"
          color="primary"
          class="text-body-2 font-weight-medium pa-0"
          :loading="isResending"
          :disabled="isResending"
        >
          Resend
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="message"
      :type="isError ? 'error' : 'success'"
      class="mt-4"
      variant="tonal"
      density="compact"
    >
      {{ message }}
    </v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRegisterStore } from '~/stores/useRegister'

const registerStore = useRegisterStore()
const emit = defineEmits(['verified', 'back'])

const verificationCode = ref('')
const isVerifying = ref(false)
const isResending = ref(false)
const message = ref('')
const isError = ref(false)

const goBack = () => {
  emit('back')
  // Return to contact info step
  registerStore.setStep('contact-info')
}

// Timer logic only for code expiration
const EXPIRY_TIME = 5 * 60 // 5 minutes in seconds
const timeRemaining = ref(EXPIRY_TIME)
let timer = null

const formattedTimeRemaining = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const isExpiringSoon = computed(() => {
  return timeRemaining.value < 60
})

const startTimer = () => {
  timeRemaining.value = EXPIRY_TIME
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      clearInterval(timer)
      message.value = 'Code expired. Please request a new one.'
      isError.value = true
    }
  }, 1000)
}

const verify = async () => {
  if (timeRemaining.value === 0) {
    message.value = 'Code has expired. Please request a new one.'
    isError.value = true
    return
  }

  isVerifying.value = true
  message.value = ''
  try {
    await registerStore.verifyCode(verificationCode.value)
    emit('verified')
  } catch (error) {
    isError.value = true
    if (error.response?.data?.error) {
      message.value = error.response.data.error
    } else if (error.response?.data?.errors?.code) {
      message.value = error.response.data.errors.code[0]
    } else {
      message.value = 'Invalid verification code. Please try again.'
    }
    verificationCode.value = ''
  } finally {
    isVerifying.value = false
  }
}

const resendCode = async () => {
  isResending.value = true
  message.value = ''
  try {
    await registerStore.resendVerificationCode()
    isError.value = false
    message.value = 'New code sent to your email'
    // Reset timer for new code
    startTimer()
  } catch (error) {
    isError.value = true
    message.value =
      error.response?.data?.error || "Couldn't send verification code."
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.verification-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.text-error {
  color: rgb(var(--v-theme-error));
}

:deep(.v-otp-input) {
  justify-content: center;
  margin-bottom: 0.5rem;
}

.resend-container {
  margin-top: 4px;
  margin-bottom: 12px;
}

:deep(.v-btn) {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}
</style>
