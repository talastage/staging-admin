<template>
  <div class="phone-input-container">
    <v-row no-gutters>
      <v-col cols="4" sm="3">
        <div class="country-display">
          <CountryDisplay :country="currentCountry" />
        </div>
      </v-col>
      <v-col cols="8" sm="9">
        <v-text-field
          v-model="phoneNumber"
          :label="label"
          :hint="hint"
          :persistent-hint="persistentHint"
          :rules="phoneRules"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          @input="handleInput"
          @blur="handleBlur"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCountries } from '~/composables/useCountries'
import { formatPhoneWithCountryCode, validatePhoneNumber } from '~/utils/phoneNumber'
import CountryDisplay from './CountryDisplay.vue'

interface Props {
  modelValue?: string
  label?: string
  hint?: string
  persistentHint?: boolean
  required?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Phone Number',
  hint: 'Enter your phone number',
  persistentHint: false,
  required: true,
  maxLength: 16
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'validate': [isValid: boolean]
}>()

const authStore = useAuthStore()
const { countries, loading, fetchCountries } = useCountries()

const phoneNumber = ref('')

// Get current country from auth store
const currentCountry = computed(() => {
  if (!authStore.user?.country_id) return null
  return countries.value.find(c => c.id === authStore.user.country_id)
})

// Phone validation rules
const phoneRules = computed(() => {
  const rules = []
  
  if (props.required) {
    rules.push((v: string) => !!v || 'Phone number is required')
  }
  
  rules.push((v: string) => {
    if (!v) return true
    const validation = validatePhoneNumber(v, props.maxLength)
    return validation.isValid || validation.error
  })
  
  return rules
})

// Validate phone number
const isValid = computed(() => {
  if (!phoneNumber.value && props.required) return false
  const validation = validatePhoneNumber(phoneNumber.value, props.maxLength)
  return validation.isValid
})

// Format complete phone number with country code
const formattedPhoneNumber = computed(() => {
  if (!currentCountry.value || !phoneNumber.value) return ''
  return formatPhoneWithCountryCode(phoneNumber.value, currentCountry.value.phone_code)
})

// Handle input changes
const handleInput = () => {
  emit('update:modelValue', formattedPhoneNumber.value)
  emit('validate', isValid.value)
}

const handleBlur = () => {
  emit('validate', isValid.value)
}

// Initialize component
onMounted(async () => {
  if (countries.value.length === 0) {
    await fetchCountries()
  }
})

// Watch for phone number changes
watch(phoneNumber, () => {
  handleInput()
})

// Watch for external model value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== formattedPhoneNumber.value && currentCountry.value) {
    // Try to parse the incoming value to extract country code and number
    const match = newValue.match(/^(\d{1,4})(\d+)$/)
    if (match) {
      const [, countryCode, number] = match
      if (countryCode === currentCountry.value.phone_code) {
        phoneNumber.value = number
      }
    }
  }
})
</script>

<style scoped>
.phone-input-container {
  width: 100%;
}

.country-display {
  height: 100%;
}

.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}


</style>