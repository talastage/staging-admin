<template>
  <div class="social-personal-info-form">
    <v-form ref="form" @submit.prevent="submit" class="form-wrapper">
      <!-- Social Provider Info Display -->
      <v-alert
        v-if="socialData"
        type="info"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        <div class="d-flex align-center">
          <v-icon :icon="getProviderIcon(socialData.provider)" class="mr-2" />
          <span>Connected with {{ capitalizeProvider(socialData.provider) }}</span>
        </div>
      </v-alert>

      <!-- Error alert -->
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

      <!-- Name Fields - Pre-filled from social data -->
      <v-text-field
        v-model="formData.firstName"
        label="First Name"
        :rules="[rules.required]"
        variant="outlined"
        density="compact"
        placeholder="First name"
        prepend-inner-icon="mdi-account"
        class="field"
        hide-details="auto"
      />

      <v-text-field
        v-model="formData.lastName"
        label="Last Name"
        :rules="[rules.required]"
        variant="outlined"
        density="compact"
        placeholder="Last name"
        class="field"
        hide-details="auto"
      />

      <v-text-field
        v-model="formData.displayName"
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

      <!-- Gender and Birthday -->
      <div class="gender-birthday-fields">
        <v-autocomplete
          v-model="formData.gender"
          :items="genderOptions"
          label="Gender"
          :rules="[rules.required]"
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
          v-model="formData.birthday"
          label="Birthday"
          type="date"
          :rules="[rules.required, rules.ageLimit]"
          variant="outlined"
          density="compact"
          :max="maxDate"
          class="field"
          hide-details="auto"
        />
      </div>

      <!-- Country Selection - Always required -->
      <SelectCountry
        v-model="selectedCountry"
        @country-selected="handleCountrySelection"
        :rules="[rules.required]"
        :error="formState.hasSubmitted && !formData.countryId"
        density="compact"
        class="field"
      />

      <!-- Submit Button -->
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
        Complete Registration
      </v-btn>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

interface SocialData {
  first_name?: string
  last_name?: string
  avatar_url?: string
  provider: string
  provider_id: string
}

interface Props {
  userId: number
  socialData?: SocialData
}

const props = defineProps<Props>()
const emit = defineEmits(['submit'])

const router = useRouter()
const authStore = useAuthStore()

const form = ref<any>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const selectedCountry = ref(null)

const genderOptions = ['Male', 'Female', 'Other']

const formData = reactive({
  firstName: '',
  lastName: '',
  displayName: '',
  gender: '',
  birthday: '',
  countryId: null as number | null,
})

const formState = reactive({
  hasSubmitted: false,
})

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return !!(
    formData.firstName &&
    formData.lastName &&
    formData.gender &&
    formData.birthday &&
    formData.countryId
  )
})

const rules = {
  required: (value: any) => !!value || 'Required',
  ageLimit: (value: string) => {
    if (!value) return true
    const age = new Date().getFullYear() - new Date(value).getFullYear()
    return age >= 18 || 'Must be at least 18 years old'
  },
}

const getProviderIcon = (provider: string) => {
  const icons: Record<string, string> = {
    google: 'mdi-google',
    facebook: 'mdi-facebook',
    twitter: 'mdi-twitter',
    instagram: 'mdi-instagram',
    tiktok: 'mdi-music-note',
    linkedin: 'mdi-linkedin'
  }
  return icons[provider] || 'mdi-account'
}

const capitalizeProvider = (provider: string) => {
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

const handleCountrySelection = (country: any) => {
  formData.countryId = country?.id || null
}

const submit = async () => {
  try {
    isLoading.value = true
    formState.hasSubmitted = true
    errorMessage.value = ''

    if (!isFormValid.value) {
      errorMessage.value = 'Please fill in all required fields correctly'
      return
    }

    const response = await authStore.completeSocialRegistration({
      user_id: props.userId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      display_name: formData.displayName || null,
      gender: formData.gender,
      country_id: formData.countryId,
      birthday: formData.birthday,
    })

    emit('submit')

    // Navigate to home page
    if (response.user && response.token) {
      router.push('/')
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred during registration'
  } finally {
    isLoading.value = false
  }
}

// Pre-fill form with social data
onMounted(() => {
  if (props.socialData) {
    formData.firstName = props.socialData.first_name || ''
    formData.lastName = props.socialData.last_name || ''
  }
})
</script>

<style lang="scss" scoped>
.social-personal-info-form {
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

    :deep(.v-field__input) {
      padding: 4px 8px;
    }
  }

  .gender-field {
    :deep(.v-field) {
      cursor: pointer;
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

@media (max-width: 599px) {
  .social-personal-info-form {
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
  }
}
</style>