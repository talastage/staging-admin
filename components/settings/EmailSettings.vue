<template>
  <v-container>
    <!-- Current Email Card -->
    <div class="mb-6">
      <h2 class="text-h6 mb-2">Email Address</h2>
      <p class="text-body-2 text-medium-emphasis">
        Manage your email address. This email is used for account security and
        notifications.
      </p>
    </div>

    <v-card class="mb-6" variant="outlined">
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-2 mb-1">Current Email</div>
            <div class="text-body-1">{{ currentEmail }}</div>
            <div class="text-caption" :class="emailStatusColor">
              <v-icon :color="emailStatusColor" size="small" class="mr-1">
                {{ isEmailVerified ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              {{ isEmailVerified ? 'Verified' : 'Not verified' }}
            </div>
          </div>

          <v-btn color="primary" variant="tonal" @click="startEmailChange">
            Change Email
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Change Email Dialog -->
    <v-dialog v-model="showDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{ dialogTitle }}
          <v-btn
            icon
            variant="text"
            @click="handleCloseDialog"
            class="float-right"
            :disabled="isLoading"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-form
            ref="form"
            v-model="isFormValid"
            @submit.prevent="handleSubmit"
            lazy-validation
          >
            <!-- Step 1: Verify Current Email -->
            <template v-if="currentStep === 'verify'">
              <div class="text-body-2 mb-4">
                To change your email address, first verify your current email.
                <template v-if="isCodeSending">
                  <div class="d-flex align-center mt-2">
                    <v-progress-circular
                      indeterminate
                      size="20"
                      width="2"
                      color="primary"
                      class="mr-2"
                    />
                    <span
                      >Sending verification code to
                      <strong>{{ currentEmail }}</strong
                      >...</span
                    >
                  </div>
                </template>
                <template v-else>
                  <div class="mt-2">
                    We've sent a verification code to
                    <strong>{{ currentEmail }}</strong>
                  </div>
                </template>
              </div>

              <!-- Only show OTP input after code is sent -->
              <template
                v-if="
                  !isCodeSending &&
                  emailVerificationStore.state.verificationStep === 'codeSent'
                "
              >
                <v-otp-input
                  v-model="verificationCode"
                  :length="6"
                  type="number"
                  :error-messages="codeError"
                  @input="clearErrors"
                  class="mb-4"
                />
              </template>
            </template>

            <!-- Step 2: New Email Input -->
            <template v-if="currentStep === 'newEmail'">
              <div class="text-body-2 mb-4">
                Enter your new email address. Make sure to enter it correctly.
              </div>

              <v-text-field
                v-model="newEmail"
                type="email"
                :rules="emailRules"
                :error-messages="emailError"
                variant="outlined"
                required
                validate-on="blur"
                @input="clearErrors"
                class="mb-4"
                hide-details="auto"
                persistent-placeholder
              >
                <template v-slot:label>
                  <span class="text-no-wrap">New Email Address</span>
                </template>
              </v-text-field>

              <v-text-field
                v-model="confirmEmail"
                type="email"
                :rules="confirmEmailRules"
                variant="outlined"
                required
                validate-on="blur"
                @input="clearErrors"
                class="mb-4"
                hide-details="auto"
                persistent-placeholder
              >
                <template v-slot:label>
                  <span class="text-no-wrap">Confirm New Email Address</span>
                </template>
              </v-text-field>
            </template>

            <!-- Error Alert -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-4"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

            <!-- Action Buttons -->
            <v-card-actions class="pa-0 mt-6">
              <v-spacer />
              <v-btn
                variant="tonal"
                @click="handleCloseDialog"
                :disabled="isLoading"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="isLoading"
                :disabled="!isFormValid || isLoading"
              >
                {{ submitButtonText }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccessSnackbar" color="success" timeout="3000">
      {{ successMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEmailVerificationStore } from '@/stores/useEmailVerificationStore'
import { useAuthStore } from '@/stores/auth'

const emailVerificationStore = useEmailVerificationStore()
const authStore = useAuthStore()

// Form refs and state
const form = ref(null)
const showDialog = ref(false)
const isFormValid = ref(true)
const isCodeSending = ref(false) // Add this ref for code sending state
const currentStep = ref('verify')
const showSuccessSnackbar = ref(false)
const successMessage = ref('')

// Form fields
const verificationCode = ref('')
const newEmail = ref('')
const confirmEmail = ref('')

// Error states
const emailError = ref('')
const codeError = ref('')
const errorMessage = ref('')

// Computed properties
const currentEmail = computed(() => authStore.user?.email)
const isEmailVerified = computed(() => authStore.user?.email_verified_at)
const emailStatusColor = computed(() =>
  isEmailVerified.value ? 'success' : 'warning'
)
const isLoading = computed(() => emailVerificationStore.state.isProcessing)

const dialogTitle = computed(() => {
  switch (currentStep.value) {
    case 'verify':
      return 'Verify Current Email'
    case 'newEmail':
      return 'Enter New Email'
    default:
      return 'Change Email Address'
  }
})

const submitButtonText = computed(() => {
  switch (currentStep.value) {
    case 'verify':
      return 'Verify'
    case 'newEmail':
      return 'Update Email'
    default:
      return 'Continue'
  }
})

// Validation rules
const emailRules = [
  (v) => !!v || 'Email is required',
  (v) => /.+@.+\..+/.test(v) || 'Please enter a valid email address',
  (v) =>
    v !== currentEmail.value ||
    'New email must be different from current email',
  (v) => v.length <= 255 || 'Email must not exceed 255 characters',
]

const confirmEmailRules = [
  (v) => !!v || 'Please confirm your email',
  (v) => v === newEmail.value || 'Email addresses do not match',
]

// Methods
const startEmailChange = async () => {
  try {
    showDialog.value = true
    currentStep.value = 'verify'
    clearErrors()

    // Set loading state
    isCodeSending.value = true

    // Send verification code to current email
    await emailVerificationStore.sendVerificationCode(currentEmail.value)
    showSuccessMessage('Verification code sent to your current email')
  } catch (error) {
    handleError(error)
    // If error occurs, close dialog
    showDialog.value = false
  } finally {
    isCodeSending.value = false
  }
}

const handleSubmit = async () => {
  try {
    const isValid = await form.value?.validate()
    if (!isValid) return

    clearErrors()

    if (currentStep.value === 'verify') {
      await emailVerificationStore.verifyCurrentEmail(
        currentEmail.value,
        verificationCode.value
      )
      currentStep.value = 'newEmail'
      clearForm()
    } else if (currentStep.value === 'newEmail') {
      const response = await emailVerificationStore.updateEmail(newEmail.value)
      // Update the store with the complete user data
      if (response.user) {
        authStore.updateUser(response.user)
      }
      handleSuccess()
    }
  } catch (error) {
    handleError(error)
  }
}

const handleError = (error) => {
  console.error('Component Error:', error.response || error)
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    if (errors.email) {
      emailError.value = Array.isArray(errors.email)
        ? errors.email[0]
        : errors.email
    }
    if (errors.code) {
      codeError.value = Array.isArray(errors.code)
        ? errors.code[0]
        : errors.code
      // Set the user-friendly message from code error if it exists
      errorMessage.value = codeError.value
    }
  } else if (error.response?.data?.message && !error.response?.data?.errors) {
    // Only set generic message if there are no specific field errors
    errorMessage.value = error.response.data.message
  } else {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  }
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccessSnackbar.value = true
}

const handleSuccess = () => {
  showDialog.value = false
  resetForm()
  showSuccessMessage('Email updated successfully')
}

const handleCloseDialog = () => {
  if (!isLoading.value) {
    showDialog.value = false
    resetForm()
  }
}

const clearErrors = () => {
  emailError.value = ''
  codeError.value = ''
  errorMessage.value = ''
  form.value?.resetValidation()
}

const clearForm = () => {
  verificationCode.value = ''
  newEmail.value = ''
  confirmEmail.value = ''
  clearErrors()
}

const resetForm = () => {
  clearForm()
  currentStep.value = 'verify'
  isFormValid.value = true
  emailVerificationStore.resetState()
}

// Clean up
onUnmounted(() => {
  resetForm()
})
</script>

<style scoped>
.v-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.float-right {
  position: absolute;
  right: 8px;
  top: 8px;
}

:deep(.v-label) {
  max-width: none !important;
  overflow: visible !important;
  white-space: nowrap !important;
}

:deep(.v-text-field) {
  --v-field-padding-top: 8px;
}

:deep(.v-otp-input) {
  justify-content: center;
  margin: 1rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
