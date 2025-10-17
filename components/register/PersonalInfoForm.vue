<!-- PersonalInfoForm.vue -->
<template>
  <div class="personal-info-form">
    <v-form ref="form" @submit.prevent="submit" class="form-wrapper">
      <!-- Error alert for API errors -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
        density="compact"
        border
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- Name Fields - Stacked layout for better spacing -->
      <v-text-field
        v-model="registerStore.firstName"
        label="First Name"
        :rules="[rules.required]"
        :error-messages="registerStore.errors.first_name"
        :error="formState.hasSubmitted && !!registerStore.errors.first_name"
        @blur="handleFieldTouch('firstName')"
        variant="outlined"
        density="compact"
        placeholder="First name"
        prepend-inner-icon="mdi-account"
        class="field"
        hide-details="auto"
      />

      <v-text-field
        v-model="registerStore.lastName"
        label="Last Name"
        :rules="[rules.required]"
        :error-messages="registerStore.errors.last_name"
        :error="formState.hasSubmitted && !!registerStore.errors.last_name"
        @blur="handleFieldTouch('lastName')"
        variant="outlined"
        density="compact"
        placeholder="Last name"
        class="field"
        hide-details="auto"
      />

      <v-text-field
        v-model="registerStore.displayName"
        :error-messages="registerStore.errors.display_name"
        variant="outlined"
        density="compact"
        placeholder="Choose display name (optional)"
        prepend-inner-icon="mdi-account-badge"
        class="field"
        hide-details="auto"
      >
        <template #label>
          Display Name <span class="optional-label">(Optional)</span>
        </template>
      </v-text-field>

      <!-- Gender and Birthday - Responsive layout -->
      <div class="gender-birthday-fields">
        <v-autocomplete
          v-model="registerStore.gender"
          :items="genderOptions"
          label="Gender"
          :rules="[rules.required]"
          :error-messages="registerStore.errors.gender"
          :error="formState.hasSubmitted && !!registerStore.errors.gender"
          @blur="handleFieldTouch('gender')"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-gender-male-female"
          class="field gender-field"
          hide-details="auto"
          :menu-props="{ maxHeight: 200 }"
          no-filter
          auto-select-first
        />

        <v-text-field
          v-model="registerStore.birthday"
          label="Birthday"
          type="date"
          :rules="[rules.required, rules.ageLimit]"
          :error-messages="registerStore.errors.birthday"
          :error="formState.hasSubmitted && !!registerStore.errors.birthday"
          @blur="handleFieldTouch('birthday')"
          variant="outlined"
          density="compact"
          :max="maxDate"
          class="field"
          hide-details="auto"
        />
      </div>

      <SelectCountry
        v-model="selectedCountry"
        @country-selected="handleCountrySelection"
        :rules="[rules.required]"
        :error="formState.hasSubmitted && !registerStore.country"
        :error-messages="registerStore.errors.country_id"
        @blur="handleFieldTouch('country')"
        density="compact"
        class="field"
      />

      <v-text-field
        v-model="registerStore.password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
        :rules="[rules.required, rules.passwordStrength]"
        :error-messages="registerStore.errors.password"
        :error="formState.hasSubmitted && !!registerStore.errors.password"
        @blur="handleFieldTouch('password')"
        variant="outlined"
        density="compact"
        placeholder="Create a strong password"
        prepend-inner-icon="mdi-lock"
        class="field"
        hide-details="auto"
      />

      <v-btn
        type="submit"
        color="primary"
        block
        :loading="isLoading"
        :disabled="!isFormValid || isLoading"
        class="submit-btn"
        elevation="1"
      >
        <v-icon left class="mr-2" size="small">mdi-account-plus</v-icon>
        Create Account
      </v-btn>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRegisterStore } from '@/stores/useRegister'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const emit = defineEmits(['submit'])
const router = useRouter()
const registerStore = useRegisterStore()
const authStore = useAuthStore()

const form = ref<any>(null)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const selectedCountry = ref(null)

const genderOptions = ['Male', 'Female', 'Custom']

const formState = reactive({
  hasSubmitted: false,
  fieldsTouched: new Set<string>(),
})

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return !!(
    registerStore.firstName &&
    registerStore.lastName &&
    registerStore.gender &&
    registerStore.birthday &&
    registerStore.country &&
    registerStore.password &&
    !Object.values(registerStore.errors).some((error) => error)
  )
})

const rules = {
  required: (value: any) => !!value || 'Required',
  passwordStrength: (value: string) => {
    if (!value) return 'Password is required'
    const requirements = [
      { test: (v: string) => v.length >= 8, message: '8 characters' },
      { test: (v: string) => /[A-Z]/.test(v), message: 'uppercase letter' },
      { test: (v: string) => /[a-z]/.test(v), message: 'lowercase letter' },
      { test: (v: string) => /\d/.test(v), message: 'number' },
      {
        test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
        message: 'special character',
      },
    ]
    const failed = requirements.filter((req) => !req.test(value))
    return (
      failed.length === 0 || `Need: ${failed.map((f) => f.message).join(', ')}`
    )
  },
  ageLimit: (value: string) => {
    if (!value) return true
    const age = new Date().getFullYear() - new Date(value).getFullYear()
    return age >= 18 || 'Must be at least 18 years old'
  },
}

const handleCountrySelection = (country: any) => {
  registerStore.country = country
}

const handleFieldTouch = (fieldName: string) => {
  formState.fieldsTouched.add(fieldName)
}

const submit = async () => {
  try {
    isLoading.value = true
    formState.hasSubmitted = true
    errorMessage.value = ''

    const isValid = await registerStore.validatePersonalInfo()
    if (!isValid) {
      errorMessage.value = 'Please fill in all required fields correctly'
      return
    }

    const response = await registerStore.registerPersonalInfo()
    emit('submit')

    // Navigate directly to home page
    if (response.user && response.token) {
      router.push('/')
    }
  } catch (error: any) {
    errorMessage.value =
      error.message || 'An error occurred during registration'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.personal-info-form {
  margin: 0 auto;
  padding: 0;

  .form-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .gender-birthday-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .field {
    width: 100%;

    :deep(.v-input__control) {
      min-height: 36px;
    }

    :deep(.v-field) {
      /* Mobile visibility fixes */
      opacity: 1 !important;
      visibility: visible !important;
      z-index: 1;
      position: relative;
      background-color: #ffffff !important;
    }

    :deep(.v-field__input) {
      padding: 4px 8px;
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

    :deep(.v-label) {
      color: rgba(0, 0, 0, 0.6) !important;
    }
  }

  .gender-field {
    :deep(.v-field) {
      cursor: pointer;
    }

    :deep(.v-field__input) {
      cursor: pointer;
    }

    :deep(.v-field__append-inner) {
      cursor: pointer;
      pointer-events: auto;
    }

    :deep(.v-input__append) {
      cursor: pointer;
      pointer-events: auto;
    }
  }

  .optional-label {
    font-size: 0.7rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  .submit-btn {
    margin-top: 0.75rem;
    height: 40px;
    font-weight: 500;
  }
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .personal-info-form {
    .gender-birthday-fields {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .form-wrapper {
      gap: 8px;
    }
    
    .submit-btn {
      margin-top: 1rem;
    }

    /* Mobile-specific visibility fixes */
    .field {
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
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .personal-info-form {
    .form-wrapper {
      gap: 10px;
    }
  }
}

/* iOS Safari specific fixes */
@supports (-webkit-touch-callout: none) {
  .field {
    :deep(.v-field__input) {
      -webkit-appearance: none;
      -webkit-text-fill-color: #000000 !important;
    }
  }
}
</style>