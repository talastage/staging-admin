<!-- components/ContactInfoForm.vue -->
<template>
  <div class="contact-info-form">
    <v-form @submit.prevent="submitForm" ref="form" class="form-content">
      <v-text-field
        v-model="email"
        :error-messages="emailError"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        autocomplete="email"
        hide-details="false"
        class="mb-3"
        placeholder="Email address"
        density="comfortable"
        autofocus
        :loading="loading"
        :class="{ 'error-field': emailError }"
      ></v-text-field>

      <!-- Show error alert for API errors -->
      <v-alert
        v-if="apiError"
        type="error"
        variant="tonal"
        class="mt-2 mb-3"
        density="compact"
        border
        closable
        @click:close="apiError = ''"
      >
        {{ apiError }}
      </v-alert>

      <div class="mt-4">
        <v-btn
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="!isValidEmail || loading"
          class="rounded-lg"
          elevation="1"
          height="44"
        >
          <span class="font-weight-medium">Continue</span>
          <v-icon right class="ml-1">mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <!-- Show helpful email tips -->
      <v-expand-transition>
        <div v-if="showTips" class="mt-4">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            border
            class="text-body-2"
          >
            <strong>Tips:</strong>
            <ul class="mt-1 pl-4">
              <li>Use a valid email address you have access to</li>
              <li>We'll send a verification code to this email</li>
            </ul>
          </v-alert>
        </div>
      </v-expand-transition>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRegisterStore } from '~/stores/useRegister'

const emit = defineEmits(['next'])
const registerStore = useRegisterStore()

// Form state
const form = ref(null)
const email = ref(registerStore.email || '')
const loading = ref(false)
const showTips = ref(false)
const apiError = ref('')

// Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = computed(() => emailRegex.test(email.value))

const emailError = computed(() => {
  if (email.value && !isValidEmail.value) {
    return 'Please enter a valid email address'
  }
  return registerStore.errors.email
})

// Show tips when user focuses on email field
watch(email, (newVal) => {
  if (newVal && !showTips.value) {
    showTips.value = true
  }
  // Clear API error when user types
  if (apiError.value) {
    apiError.value = ''
  }
})

const submitForm = async () => {
  if (!isValidEmail.value) return

  loading.value = true
  apiError.value = ''

  try {
    registerStore.email = email.value

    if (!registerStore.validateContactInfo()) {
      loading.value = false
      return
    }

    const response = await registerStore.registerEmail()
    
    // Show success message for incomplete registrations
    if (response.incomplete_registration) {
      // This will be handled by the next step automatically
    }
    
    emit('next')
  } catch (error: any) {
    console.error('Error submitting form:', error)

    // Improved error handling
    if (error.response && error.response.data && error.response.data.error) {
      // Extract error message directly from the response
      apiError.value = error.response.data.error
    } else if (error.message && !error.message.includes('status code')) {
      // Use error message if it's not the generic "Request failed with status code" message
      apiError.value = error.message
    } else if (registerStore.errors.email) {
      // Fallback to store errors if present
      apiError.value = registerStore.errors.email
    } else {
      // Generic fallback message
      apiError.value = 'Failed to proceed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-info-form {
  width: 100%;
}

.form-content {
  display: flex;
  flex-direction: column;
}

/* Mobile visibility fixes */
:deep(.v-field) {
  transition: all 0.3s ease;
  border-radius: 8px;
  /* Force visibility on mobile */
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 1;
  position: relative;
  background-color: #ffffff !important;
}

:deep(.v-field__input) {
  /* Ensure input text is visible */
  color: #000000 !important;
  opacity: 1 !important;
  -webkit-text-fill-color: #000000 !important;
  background-color: transparent !important;
}

:deep(.v-field__outline) {
  /* Ensure border is visible */
  border-color: rgba(0, 0, 0, 0.38) !important;
  opacity: 1 !important;
}

:deep(.v-field--focused) {
  box-shadow: 0 0 0 2px var(--v-primary-base);
}

:deep(.v-field--focused .v-field__outline) {
  border-color: var(--v-primary-base) !important;
  border-width: 2px !important;
}

/* Fix for label being cut off when focused */
:deep(.v-field__field) {
  --v-field-padding-top: 24px;
}

:deep(.v-label) {
  overflow: visible;
  text-overflow: initial;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.6) !important;
}

/* Mobile-specific fixes */
@media (max-width: 599px) {
  .form-content {
    padding: 0;
  }
  
  :deep(.v-alert) {
    font-size: 0.875rem;
  }
  
  /* Force hardware acceleration to prevent rendering issues */
  :deep(.v-field) {
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: auto;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  
  /* Prevent zoom on input focus */
  :deep(.v-field__input input) {
    font-size: 16px !important;
    transform: none !important;
  }
}

/* iOS Safari specific fixes */
@supports (-webkit-touch-callout: none) {
  :deep(.v-field__input) {
    -webkit-appearance: none;
    -webkit-text-fill-color: #000000 !important;
  }
}
</style>