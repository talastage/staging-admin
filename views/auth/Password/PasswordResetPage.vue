<template>
  <v-container fluid class="fill-height bg-grey-lighten-4">
    <v-row no-gutters justify="center" align="center">
      <v-col cols="12">
        <div class="d-flex flex-column align-center mb-6">
          <h1 class="text-h4 font-weight-bold text-center mb-2">
            Reset your password
          </h1>
          <v-chip-group v-model="step" class="mt-2" selected-class="primary">
            <v-chip
              v-for="i in 3"
              :key="i"
              :value="i"
              :color="step >= i ? 'primary' : 'grey'"
              size="small"
              class="mx-1"
            >
              {{ i }}
            </v-chip>
          </v-chip-group>
        </div>

        <!-- Alerts -->
        <v-slide-y-transition>
          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="clearSuccess"
          >
            {{ successMessage }}
          </v-alert>
        </v-slide-y-transition>

        <v-slide-y-transition>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="clearError"
            density="comfortable"
          >
            {{ errorMessage }}
          </v-alert>
        </v-slide-y-transition>

        <v-form @submit.prevent="submitForm" v-model="isFormValid">
          <v-slide-x-transition>
            <v-window v-model="step">
              <!-- Step 1: Email -->
              <v-window-item :value="1">
                <h2 class="text-h6 mb-4">Enter your email address</h2>
                <v-text-field
                  v-model="email"
                  type="email"
                  placeholder="Enter your email address"
                  :rules="[rules.required, rules.email]"
                  :error-messages="fieldErrors.email"
                  @input="clearFieldError('email')"
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  persistent-placeholder
                  @keyup.enter="submitForm"
                ></v-text-field>
              </v-window-item>

              <!-- Step 2: Verification Code -->
              <v-window-item :value="2">
                <h2 class="text-h6 mb-4">Enter the verification code</h2>
                <p class="text-body-1 mb-4">{{ codeSentMessage }}</p>
                <p v-if="expiresIn" class="text-caption mb-2">
                  Code expires in <TimeRemaining :expires-in="expiresIn" />
                </p>
                <v-otp-input
                  v-model="verificationCode"
                  :length="6"
                  :error-messages="fieldErrors.code"
                  @input="clearFieldError('code')"
                  type="number"
                  variant="outlined"
                  class="mb-4"
                ></v-otp-input>
                <div
                  v-if="fieldErrors.code && fieldErrors.code.length > 0"
                  class="text-error text-caption mt-2"
                >
                  {{ fieldErrors.code[0] }}
                </div>
              </v-window-item>

              <!-- Step 3: New Password -->
              <v-window-item :value="3">
                <h2 class="text-h6 mb-4">Create a new password</h2>
                <v-text-field
                  v-model="newPassword"
                  placeholder="Enter your new password"
                  :type="showNewPassword ? 'text' : 'password'"
                  :append-inner-icon="
                    showNewPassword ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  @click:append-inner="togglePasswordVisibility('newPassword')"
                  :rules="[rules.required, rules.passwordStrength]"
                  :error-messages="fieldErrors.new_password"
                  @input="clearFieldError('new_password')"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock"
                  persistent-placeholder
                  class="mb-3"
                ></v-text-field>
                <v-text-field
                  v-model="confirmPassword"
                  placeholder="Confirm your new password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :append-inner-icon="
                    showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  @click:append-inner="
                    togglePasswordVisibility('confirmPassword')
                  "
                  :rules="[rules.required, rules.passwordMatch]"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-check"
                  persistent-placeholder
                ></v-text-field>

                <!-- Password strength indicators -->
                <v-expand-transition>
                  <div v-if="newPassword" class="mt-3">
                    <p class="text-caption mb-2">Password requirements:</p>
                    <v-chip-group>
                      <v-chip
                        density="comfortable"
                        size="small"
                        :color="hasUpperCase ? 'success' : 'error'"
                        variant="tonal"
                      >
                        Uppercase
                      </v-chip>
                      <v-chip
                        density="comfortable"
                        size="small"
                        :color="hasLowerCase ? 'success' : 'error'"
                        variant="tonal"
                      >
                        Lowercase
                      </v-chip>
                      <v-chip
                        density="comfortable"
                        size="small"
                        :color="hasNumber ? 'success' : 'error'"
                        variant="tonal"
                      >
                        Number
                      </v-chip>
                      <v-chip
                        density="comfortable"
                        size="small"
                        :color="hasSpecialChar ? 'success' : 'error'"
                        variant="tonal"
                      >
                        Special
                      </v-chip>
                      <v-chip
                        density="comfortable"
                        size="small"
                        :color="isLongEnough ? 'success' : 'error'"
                        variant="tonal"
                      >
                        8+ chars
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-expand-transition>
              </v-window-item>
            </v-window>
          </v-slide-x-transition>

          <!-- Action Buttons -->
          <v-btn
            type="submit"
            color="primary"
            block
            class="mt-6"
            :loading="isLoading"
            :disabled="!isFormValid || isLoading"
            size="large"
            elevation="2"
          >
            {{ submitButtonText }}
          </v-btn>

          <v-btn
            v-if="step === 2"
            variant="text"
            block
            class="mt-2"
            @click="resendCode"
            :disabled="isResending || isLoading"
          >
            {{ isResending ? 'Sending...' : 'Resend Code' }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { usePasswordResetStore } from '@/stores/usePasswordResetStore'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'blank',
})

// Store and router
const passwordResetStore = usePasswordResetStore()
const router = useRouter()

// Form state
const step = ref(1)
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const isFormValid = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const resetInfo = ref({
  sent_to: '',
  destination: '',
})
const expiresIn = ref(null)

// Field-specific errors
const fieldErrors = reactive({
  email: [],
  code: [],
  new_password: [],
  reset_token: [],
  general: [],
})

// Password visibility toggles
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Password strength indicators
const hasUpperCase = computed(() => /[A-Z]/.test(newPassword.value))
const hasLowerCase = computed(() => /[a-z]/.test(newPassword.value))
const hasNumber = computed(() => /[0-9]/.test(newPassword.value))
const hasSpecialChar = computed(() => /[@$!%*#?&]/.test(newPassword.value))
const isLongEnough = computed(() => newPassword.value.length >= 8)

// Computed messages
const codeSentMessage = computed(() => {
  if (resetInfo.value.sent_to && resetInfo.value.destination) {
    return `Enter the code we sent to your ${resetInfo.value.sent_to}: ${resetInfo.value.destination}`
  }
  return 'Enter the code we sent to your email address.'
})

const submitButtonText = computed(() => {
  switch (step.value) {
    case 1:
      return isLoading.value ? 'Sending...' : 'Send Reset Code'
    case 2:
      return isLoading.value ? 'Verifying...' : 'Verify Code'
    case 3:
      return isLoading.value ? 'Resetting...' : 'Reset Password'
    default:
      return 'Submit'
  }
})

// Validation rules
const rules = {
  required: (v) => !!v || 'This field is required',
  email: (v) => /.+@.+\..+/.test(v) || 'Please enter a valid email address',
  passwordStrength: (v) => {
    return (
      (v.length >= 8 &&
        hasUpperCase.value &&
        hasLowerCase.value &&
        hasNumber.value &&
        hasSpecialChar.value) ||
      'Password must meet all requirements'
    )
  },
  passwordMatch: (v) => v === newPassword.value || 'Passwords do not match',
}

// Error handling functions
const clearFieldError = (field) => {
  if (fieldErrors[field]) {
    fieldErrors[field] = []
  }
  // Also clear general error message when user starts typing
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

const clearError = () => {
  errorMessage.value = ''
  // Clear all field errors
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = []
  })
}

const clearSuccess = () => {
  successMessage.value = ''
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = []
  })
}

const handleError = (error) => {
  clearMessages()

  if (error.response) {
    const { status, data } = error.response

    // Handle validation errors (422)
    if (status === 422 && data.errors) {
      // Set field-specific errors
      Object.keys(data.errors).forEach((field) => {
        if (fieldErrors.hasOwnProperty(field)) {
          fieldErrors[field] = data.errors[field]
        }
      })

      // Set general error message if provided
      if (data.message && data.message !== 'The given data was invalid.') {
        errorMessage.value = data.message
      }
      return
    }

    // Handle other HTTP errors
    switch (status) {
      case 400:
        if (data.errors) {
          Object.keys(data.errors).forEach((field) => {
            if (fieldErrors.hasOwnProperty(field)) {
              fieldErrors[field] = data.errors[field]
            }
          })
        }
        errorMessage.value =
          data.message || 'Please check the information provided.'

        // Handle expired code - redirect to step 1
        if (data.message && data.message.includes('expired')) {
          setTimeout(() => {
            step.value = 1
            clearMessages()
          }, 3000)
        }
        break

      case 404:
        fieldErrors.email = [
          "We couldn't find an account with that email address.",
        ]
        break

      case 429:
        fieldErrors.email = data.errors?.email || [
          'Too many attempts. Please wait before trying again.',
        ]
        errorMessage.value =
          data.message || 'Please wait before making another request.'
        break

      case 500:
        if (data.errors) {
          Object.keys(data.errors).forEach((field) => {
            if (fieldErrors.hasOwnProperty(field)) {
              fieldErrors[field] = data.errors[field]
            }
          })
        }
        errorMessage.value =
          data.message || 'Something went wrong. Please try again later.'
        break

      default:
        errorMessage.value =
          data.message ||
          'An unexpected error occurred. Please try again later.'
    }
  } else if (error.request) {
    errorMessage.value =
      'Network error. Please check your connection and try again.'
  } else {
    errorMessage.value =
      error.message || 'An unexpected error occurred. Please try again later.'
  }
}

// Form submission handlers
const submitForm = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  clearMessages()

  try {
    switch (step.value) {
      case 1:
        await sendResetCode()
        break
      case 2:
        await verifyResetCode()
        break
      case 3:
        await resetPassword()
        break
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const sendResetCode = async () => {
  try {
    const response = await passwordResetStore.sendResetCode(email.value)
    resetInfo.value = {
      sent_to: response.sent_to,
      destination: response.destination,
    }
    expiresIn.value = response.expires_in
    successMessage.value =
      'Reset code sent successfully! Please check your email.'
    step.value = 2
  } catch (error) {
    throw error
  }
}

const verifyResetCode = async () => {
  try {
    const response = await passwordResetStore.verifyResetCode(
      email.value,
      verificationCode.value
    )

    // Verify we received the token
    if (!response.reset_token) {
      throw new Error('Reset token not received from server')
    }

    successMessage.value = 'Code verified successfully!'
    step.value = 3
  } catch (error) {
    throw error
  }
}

const resetPassword = async () => {
  try {
    const token = passwordResetStore.state.resetToken

    if (!token) {
      errorMessage.value =
        'Your session has expired. Please restart the process.'
      setTimeout(() => {
        step.value = 1
        clearMessages()
      }, 3000)
      return
    }

    await passwordResetStore.resetPassword(
      email.value,
      newPassword.value,
      token
    )

    successMessage.value =
      'Your password has been reset successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    throw error
  }
}

const resendCode = async () => {
  isResending.value = true
  clearMessages()
  try {
    await sendResetCode()
  } catch (error) {
    handleError(error)
  } finally {
    isResending.value = false
  }
}

const togglePasswordVisibility = (field) => {
  if (field === 'newPassword') {
    showNewPassword.value = !showNewPassword.value
  } else if (field === 'confirmPassword') {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

onUnmounted(() => {
  passwordResetStore.clearResetState()
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}

:deep(.v-otp-input input) {
  border: 2px solid #1976d2 !important;
  border-radius: 8px !important;
  background-color: rgba(25, 118, 210, 0.05) !important;
  font-weight: bold !important;
  font-size: 1.2rem !important;
  color: #1976d2 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-otp-input input:focus) {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3) !important;
}

.text-error {
  color: rgb(var(--v-theme-error)) !important;
}
</style>
