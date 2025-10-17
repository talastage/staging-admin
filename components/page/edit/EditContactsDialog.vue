<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-card-account-phone</v-icon>
        Edit Contact Information
      </v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="text-body-2 mb-4">
          Your contact information will be visible to project creators who may
          want to discuss investment opportunities with you.
        </v-alert>

        <v-form ref="form" v-model="isFormValid">
          <!-- Email -->
          <v-text-field
            v-model="localContacts.email"
            label="Email Address"
            type="email"
            :rules="emailRules"
            hint="For formal communications and proposals"
            prepend-inner-icon="mdi-email"
            class="mb-4"
            required
          />

          <!-- WhatsApp Number -->
          <v-card variant="outlined" class="mb-4 pa-4">
            <div class="d-flex align-center mb-3">
              <v-icon class="mr-2" color="green">mdi-whatsapp</v-icon>
              <span class="text-subtitle-1 font-weight-medium"
                >WhatsApp Contact</span
              >
              <v-chip
                class="ml-2"
                size="x-small"
                color="success"
                variant="tonal"
                >Recommended</v-chip
              >
            </div>
            <v-row align="center">
              <v-col cols="4" class="pr-2">
                <SelectPhoneCode
                  v-model="whatsappCode"
                  label="Country Code"
                  hint="e.g., +1, +250"
                  :rules="[]"
                />
              </v-col>
              <v-col cols="8" class="pl-2">
                <v-text-field
                  v-model="whatsappNumber"
                  label="WhatsApp Number"
                  :rules="phoneInputRules"
                  placeholder="Enter your phone number"
                  hint="Enter number without country code"
                  prepend-inner-icon="mdi-whatsapp"
                />
              </v-col>
            </v-row>
            <div v-if="fullWhatsappNumber" class="mt-2">
              <v-chip size="small" color="success" variant="tonal">
                <v-icon start>mdi-check</v-icon>
                Complete: {{ fullWhatsappNumber }}
              </v-chip>
            </div>
          </v-card>

          <!-- Phone Number -->
          <v-card variant="outlined" class="mb-4 pa-4">
            <div class="d-flex align-center mb-3">
              <v-icon class="mr-2" color="blue">mdi-phone</v-icon>
              <span class="text-subtitle-1 font-weight-medium"
                >Phone Contact</span
              >
              <v-chip class="ml-2" size="x-small" color="info" variant="tonal"
                >Optional</v-chip
              >
            </div>
            <v-row align="center">
              <v-col cols="4" class="pr-2">
                <SelectPhoneCode
                  v-model="phoneCode"
                  label="Country Code"
                  hint="e.g., +1, +250"
                  :rules="[]"
                />
              </v-col>
              <v-col cols="8" class="pl-2">
                <v-text-field
                  v-model="phoneNumber"
                  label="Phone Number"
                  :rules="phoneInputRules"
                  placeholder="Enter your phone number"
                  hint="Enter number without country code"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>
            </v-row>
            <div v-if="fullPhoneNumber" class="mt-2">
              <v-chip size="small" color="info" variant="tonal">
                <v-icon start>mdi-check</v-icon>
                Complete: {{ fullPhoneNumber }}
              </v-chip>
            </div>
          </v-card>

          <!-- Additional Contacts -->
          <v-text-field
            v-model="localContacts.website_url"
            label="Website URL"
            :rules="urlRules"
            prepend-inner-icon="mdi-web"
            hint="Optional: Your business or personal website"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="handleClose">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="handleSave"
          :disabled="!canSave"
          :loading="loading"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import SelectPhoneCode from '~/components/forms/select/SelectPhoneCode.vue'
import { useCountryStore } from '~/stores/useCountries'

interface PageContact {
  id?: number
  page_id: number
  whatsapp_number: string | null
  phone_number: string | null
  email: string | null
  website_url: string | null
  created_at?: string
  updated_at?: string
}

const props = defineProps<{
  modelValue: boolean
  contacts: PageContact
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [contacts: PageContact]
  close: []
}>()

const form = ref<any>(null)
const isFormValid = ref(false)
const loading = ref(false)
const localContacts = ref<PageContact>({ ...props.contacts })

// Phone code references
const countryStore = useCountryStore()
const phoneCode = ref('')
const phoneNumber = ref('')
const whatsappCode = ref('')
const whatsappNumber = ref('')

// Initialize country store if needed
onMounted(async () => {
  if (!countryStore.isFetched) {
    await countryStore.fetchCountries()
  }

  // Parse existing phone and WhatsApp numbers
  parsePhoneNumbers()
})

// Parse and split existing phone numbers into code and number parts
const parsePhoneNumbers = () => {
  if (localContacts.value.phone_number) {
    const parsed = parsePhoneNumberString(localContacts.value.phone_number)
    phoneCode.value = parsed.code
    phoneNumber.value = parsed.number
  } else {
    phoneCode.value = '250'
    phoneNumber.value = ''
  }

  if (localContacts.value.whatsapp_number) {
    const parsed = parsePhoneNumberString(localContacts.value.whatsapp_number)
    whatsappCode.value = parsed.code
    whatsappNumber.value = parsed.number
  } else {
    whatsappCode.value = phoneCode.value
    whatsappNumber.value = ''
  }
}

// Helper to parse a phone number string into code and number parts
const parsePhoneNumberString = (phoneString: string) => {
  if (phoneString.startsWith('+')) {
    const match = phoneString.match(/^\+(\d+?)(\d{9,10})$/)
    if (match && match.length === 3) {
      return { code: match[1], number: match[2] }
    }
  } else if (phoneString.startsWith('0')) {
    return { code: '250', number: phoneString.substring(1) }
  }

  return { code: '250', number: phoneString }
}

// Computed properties for the combined phone numbers
const fullPhoneNumber = computed(() => {
  if (!phoneNumber.value) return null
  return `+${phoneCode.value}${phoneNumber.value}`
})

const fullWhatsappNumber = computed(() => {
  if (!whatsappNumber.value) return null
  return `+${whatsappCode.value}${whatsappNumber.value}`
})

// Computed property to determine if form can be saved
const canSave = computed(() => {
  const email = localContacts.value.email
  return email && email.trim() !== '' && /.+@.+\..+/.test(email)
})

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Please enter a valid email',
]

const phoneInputRules = [
  (v: string) =>
    !v || /^\d{1,15}$/.test(v) || 'Please enter a valid phone number',
]

const urlRules = [
  (v: string) =>
    !v ||
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) ||
    'Please enter a valid URL',
]

// Watch for phone number changes and update localContacts
watch([phoneCode, phoneNumber], () => {
  localContacts.value.phone_number = fullPhoneNumber.value
})

watch([whatsappCode, whatsappNumber], () => {
  localContacts.value.whatsapp_number = fullWhatsappNumber.value
})

watch(
  () => props.contacts,
  (newVal) => {
    localContacts.value = { ...newVal }
    parsePhoneNumbers()
  },
  { deep: true }
)

// Watch for validation errors from parent
watch(
  () => props.errors,
  (newErrors) => {
    if (newErrors && Object.keys(newErrors).length > 0) {
      isFormValid.value = false
    }
  }
)

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (!canSave.value) return

  loading.value = true
  try {
    localContacts.value.phone_number = fullPhoneNumber.value
    localContacts.value.whatsapp_number = fullWhatsappNumber.value

    emit('save', localContacts.value)
  } finally {
    loading.value = false
  }
}
</script>