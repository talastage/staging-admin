<template>
  <v-card class="elevation-1">
    <v-card-title class="d-flex align-center py-4 px-6">
      <v-icon icon="mdi-shield-lock" class="me-2" />
      Password & Security
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
      <v-form
        ref="form"
        v-model="isFormValid"
        @submit.prevent="handlePasswordChange"
      >
        <v-row>
          <v-col cols="12" md="8">
            <!-- Current Password -->
            <v-text-field
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              label="Current Password"
              placeholder="Enter your current password"
              :rules="[rules.required]"
              :error-messages="currentPasswordError"
              variant="outlined"
              :append-inner-icon="
                showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'
              "
              @click:append-inner="togglePasswordVisibility('current')"
              @input="clearErrors"
              prepend-inner-icon="mdi-lock"
              density="comfortable"
            />

            <!-- New Password -->
            <v-text-field
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              label="New Password"
              placeholder="Enter your new password"
              :rules="[rules.required, rules.passwordStrength]"
              :error-messages="newPasswordError"
              variant="outlined"
              :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="togglePasswordVisibility('new')"
              @input="clearErrors"
              prepend-inner-icon="mdi-lock-plus"
              density="comfortable"
            />

            <!-- Confirm New Password -->
            <v-text-field
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              :rules="[rules.required, rules.passwordMatch]"
              :error-messages="confirmPasswordError"
              variant="outlined"
              :append-inner-icon="
                showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
              "
              @click:append-inner="togglePasswordVisibility('confirm')"
              @input="clearErrors"
              prepend-inner-icon="mdi-lock-check"
              density="comfortable"
            />

            <!-- Password Requirements -->
            <v-expand-transition>
              <div v-if="newPassword" class="mt-3">
                <p class="text-caption text-medium-emphasis mb-2">
                  Password requirements:
                </p>
                <v-chip-group>
                  <v-chip
                    v-for="(check, index) in passwordChecks"
                    :key="index"
                    size="small"
                    :color="check.passes ? 'success' : 'error'"
                    variant="tonal"
                    density="comfortable"
                  >
                    <template #prepend>
                      <v-icon
                        :icon="
                          check.passes ? 'mdi-check-circle' : 'mdi-alert-circle'
                        "
                        size="small"
                      />
                    </template>
                    {{ check.label }}
                  </v-chip>
                </v-chip-group>
              </div>
            </v-expand-transition>

            <div class="d-flex gap-4 mt-6">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="isLoading"
                :disabled="!isFormValid || isLoading"
                min-width="150"
              >
                Update Password
              </v-btn>

              <NuxtLink to="/password/reset" style="text-decoration: none">
                <v-btn color="secondary" size="large" min-width="150">
                  Forgot Password?
                </v-btn>
              </NuxtLink>
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePasswordChangeStore } from '@/stores/usePasswordChangeStore'
import { usePasswordValidation } from '~/composables/usePasswordValidation'
import { useSnackMessageStore } from '@/stores/useSnackMessage'

// Stores
const passwordChangeStore = usePasswordChangeStore()
const snackStore = useSnackMessageStore()

// Form refs
const form = ref<any>(null)
const isFormValid = ref(false)
const isLoading = ref(false)

// Password fields
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Error messages
const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Use the password validation composable
const { passwordChecks, meetsAllRequirements } =
  usePasswordValidation(newPassword)

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  passwordStrength: (v: string) =>
    meetsAllRequirements.value || 'Password must meet all requirements',
  passwordMatch: (v: string) =>
    v === newPassword.value || 'Passwords do not match',
}

// Methods
const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
  switch (field) {
    case 'current':
      showCurrentPassword.value = !showCurrentPassword.value
      break
    case 'new':
      showNewPassword.value = !showNewPassword.value
      break
    case 'confirm':
      showConfirmPassword.value = !showConfirmPassword.value
      break
  }
}

const clearErrors = () => {
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
}

const resetForm = () => {
  if (form.value) {
    form.value.reset()
  }
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  clearErrors()
}

const handlePasswordChange = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  clearErrors()

  try {
    await passwordChangeStore.changePassword(
      currentPassword.value,
      newPassword.value,
      confirmPassword.value
    )

    snackStore.success('Password updated successfully')
    resetForm()
  } catch (error: any) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const handleError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response

    // Handle validation errors
    if (status === 422 && data.errors) {
      // Clear all previous errors first
      clearErrors()

      // Map the errors to their respective fields
      Object.entries(data.errors).forEach(
        ([field, messages]: [string, any]) => {
          const message = Array.isArray(messages) ? messages[0] : messages

          switch (field) {
            case 'current_password':
              currentPasswordError.value = message
              break
            case 'new_password':
              newPasswordError.value = message
              break
            case 'confirm_password':
              confirmPasswordError.value = message
              break
          }
        }
      )

      // Show the general error message in the snackbar
      snackStore.error(data.message || 'Please check the form for errors')
      return
    }

    // Handle other status codes
    switch (status) {
      case 401:
        currentPasswordError.value = 'Current password is incorrect'
        snackStore.error('Current password is incorrect')
        break
      case 403:
        snackStore.error('You are not authorized to perform this action')
        break
      case 429:
        snackStore.error(
          'Too many attempts. Please wait a moment before trying again'
        )
        break
      case 500:
        snackStore.error('An unexpected error occurred. Please try again later')
        break
      default:
        snackStore.error(
          data.message || 'An unexpected error occurred. Please try again later'
        )
    }
  } else if (error.request) {
    snackStore.error(
      'Network error. Please check your connection and try again'
    )
  } else {
    snackStore.error('An unexpected error occurred. Please try again later')
  }
}

// Watch for input changes to clear related errors
watch(currentPassword, () => {
  currentPasswordError.value = ''
})

watch(newPassword, () => {
  newPasswordError.value = ''
  // Clear confirm password if it was already entered
  if (confirmPassword.value) {
    confirmPassword.value = ''
  }
})

watch(confirmPassword, () => {
  confirmPasswordError.value = ''
})

// Cleanup on component unmount
onUnmounted(() => {
  resetForm()
})
</script>

<style scoped>
.v-card-title {
  font-size: 1.25rem;
  font-weight: 500;
}

.v-chip {
  font-size: 0.875rem;
}

.password-requirements {
  transition: all 0.3s ease;
}
</style>

<style scoped>
.v-card-title {
  font-size: 1.25rem;
  font-weight: 500;
}

.v-chip {
  font-size: 0.875rem;
}
</style>
