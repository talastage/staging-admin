<template>
  <v-form ref="formRef" v-model="isValid" @submit.prevent>
    <v-container>
      <!-- Validation Alert -->
      <v-alert
        v-if="showValidationError"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="showValidationError = false"
      >
        <v-alert-title>Required Fields Missing</v-alert-title>
        Please fill in all required fields before proceeding:
        <ul class="mt-2">
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </v-alert>

      <v-row>
        <!-- Contact Information -->
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-icon class="mr-2" color="primary">mdi-phone</v-icon>
            <h3 class="text-h6">Contact Information</h3>
            <v-chip class="ml-2" size="small" color="error" variant="outlined">Required</v-chip>
          </div>
          <v-alert
            type="info"
            variant="tonal"
            class="text-body-2 mb-4"
          >
            Your contact information will be visible to project creators who may want to discuss investment opportunities with you.
          </v-alert>

          <!-- WhatsApp Number -->
          <v-card variant="outlined" class="mb-4 pa-4">
            <div class="d-flex align-center mb-3">
              <v-icon class="mr-2" color="green">mdi-whatsapp</v-icon>
              <span class="text-subtitle-1 font-weight-medium">WhatsApp Contact</span>
              <v-chip class="ml-2" size="x-small" color="success" variant="tonal">Recommended</v-chip>
            </div>
            <v-row align="center">
              <v-col cols="4" md="3" class="pr-2">
                <select-phone-code
                  v-model="whatsappPhoneCode"
                  label="Country Code"
                  :error-messages="whatsappPhoneErrors"
                  hint="e.g., +1, +250"
                />
              </v-col>
              <v-col cols="8" md="9" class="pl-2">
                <v-text-field
                  v-model="whatsappNumber"
                  label="WhatsApp Number"
                  :rules="phoneRules"
                  @update:model-value="updateWhatsappNumber"
                  placeholder="789777100"
                  hint="Enter number without country code"
                  prepend-inner-icon="mdi-whatsapp"
                />
              </v-col>
            </v-row>
            <div v-if="form.contacts.whatsapp_number" class="mt-2">
              <v-chip size="small" color="success" variant="tonal">
                <v-icon start>mdi-check</v-icon>
                Complete: {{ form.contacts.whatsapp_number }}
              </v-chip>
            </div>
          </v-card>

          <!-- Phone Number -->
          <v-card variant="outlined" class="mb-4 pa-4">
            <div class="d-flex align-center mb-3">
              <v-icon class="mr-2" color="blue">mdi-phone</v-icon>
              <span class="text-subtitle-1 font-weight-medium">Phone Contact</span>
              <v-chip class="ml-2" size="x-small" color="info" variant="tonal">Optional</v-chip>
            </div>
            <v-row align="center">
              <v-col cols="4" md="3" class="pr-2">
                <select-phone-code
                  v-model="phoneCode"
                  label="Country Code"
                  :error-messages="phoneErrors"
                  hint="e.g., +1, +250"
                />
              </v-col>
              <v-col cols="8" md="9" class="pl-2">
                <v-text-field
                  v-model="phoneNumber"
                  label="Phone Number"
                  :rules="phoneRules"
                  @update:model-value="updatePhoneNumber"
                  placeholder="789777100"
                  hint="Enter number without country code"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>
            </v-row>
            <div v-if="form.contacts.phone_number" class="mt-2">
              <v-chip size="small" color="info" variant="tonal">
                <v-icon start>mdi-check</v-icon>
                Complete: {{ form.contacts.phone_number }}
              </v-chip>
            </div>
          </v-card>

          <!-- Email -->
          <v-text-field
            v-model="form.contacts.email"
            label="Email Address"
            type="email"
            :rules="emailRules"
            hint="For formal communications and proposals"
            prepend-inner-icon="mdi-email"
            required
          />
        </v-col>

        <!-- Location Information -->
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
            <h3 class="text-h6">Location Information</h3>
            <v-chip class="ml-2" size="small" color="error" variant="outlined">Required</v-chip>
          </div>
          <v-alert
            type="info"
            variant="tonal"
            class="text-body-2 mb-4"
          >
            Your location helps project creators understand if you prefer local investments or are open to opportunities in different regions.
          </v-alert>

          <v-text-field
            v-model="form.location.address"
            label="Your Location"
            :rules="locationRules"
            hint="City, State/Province, Country (e.g., Kigali, Rwanda)"
            prepend-inner-icon="mdi-map-marker"
            required
          />
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { usePageRegistrationStore } from '~/stores/usePageRegistration'

const store = usePageRegistrationStore()
const isValid = ref(false)
const formRef = ref(null)
const showValidationError = ref(false)

// Phone number state
const whatsappPhoneCode = ref('')
const whatsappNumber = ref('')
const phoneCode = ref('')
const phoneNumber = ref('')

// Form state
const form = reactive({
  contacts: {
    whatsapp_number: store.contactAndLocation.contacts.whatsapp_number,
    phone_number: store.contactAndLocation.contacts.phone_number,
    email: store.contactAndLocation.contacts.email,
  },
  location: {
    address: store.contactAndLocation.location.address,
  },
})

// Validation rules
const phoneRules = [
  (v: string) =>
    !v || /^\d{1,15}$/.test(v) || 'Please enter a valid phone number',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Please enter a valid email',
]

const locationRules = [
  (v: string) => !!v || 'Location is required',
  (v: string) => (v && v.length >= 3) || 'Location must be at least 3 characters',
]

// Error states
const whatsappPhoneErrors = ref<string[]>([])
const phoneErrors = ref<string[]>([])

// Validation errors for display
const validationErrors = computed(() => {
  const errors = []
  if (!form.contacts.email) errors.push('Email address')
  if (!form.location.address) errors.push('Location')
  return errors
})

// Custom validation method
const validateForm = async () => {
  if (!formRef.value) return false
  
  const formValid = await formRef.value.validate()
  const hasRequiredFields = form.contacts.email && form.location.address
  
  if (!hasRequiredFields) {
    showValidationError.value = true
    return false
  }
  
  showValidationError.value = false
  return formValid.valid
}

// Update complete phone numbers
const updateWhatsappNumber = () => {
  if (whatsappPhoneCode.value && whatsappNumber.value) {
    form.contacts.whatsapp_number = `+${whatsappPhoneCode.value}${whatsappNumber.value}`
  } else {
    form.contacts.whatsapp_number = ''
  }
}

const updatePhoneNumber = () => {
  if (phoneCode.value && phoneNumber.value) {
    form.contacts.phone_number = `+${phoneCode.value}${phoneNumber.value}`
  } else {
    form.contacts.phone_number = ''
  }
}

// Watch for form changes and update store
watch(
  form,
  (newValue) => {
    store.contactAndLocation = {
      contacts: newValue.contacts,
      location: {
        ...store.contactAndLocation.location,
        address: newValue.location.address,
      },
    }
  },
  { deep: true }
)

// Initialize phone numbers if they exist in store
onMounted(() => {
  if (store.contactAndLocation.contacts.whatsapp_number) {
    const whatsapp = store.contactAndLocation.contacts.whatsapp_number
    const match = whatsapp.match(/^\+(\d+)(\d+)$/)
    if (match) {
      whatsappPhoneCode.value = match[1]
      whatsappNumber.value = match[2]
    }
  }

  if (store.contactAndLocation.contacts.phone_number) {
    const phone = store.contactAndLocation.contacts.phone_number
    const match = phone.match(/^\+(\d+)(\d+)$/)
    if (match) {
      phoneCode.value = match[1]
      phoneNumber.value = match[2]
    }
  }
})

defineExpose({ 
  isValid: computed(() => {
    return form.contacts.email && form.location.address && isValid.value
  }),
  validateForm 
})
</script>

<style scoped>
.v-row {
  margin-bottom: 16px;
}
</style>