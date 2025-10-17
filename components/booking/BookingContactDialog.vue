<template>
  <BaseDialog
    v-model="dialogOpen"
    :max-width="'500px'"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="text-h5 text-center w-100">Booking</div>
    </template>

    <!-- Loading State -->
    <v-card-text v-if="loading" class="text-center pa-4">
      <v-progress-circular indeterminate color="primary" />
    </v-card-text>

    <!-- Error State -->
    <v-card-text v-else-if="error" class="error--text pa-4">
      {{ error }}
      <v-btn color="primary" @click="fetchContacts" class="mt-2" size="small">
        Retry
      </v-btn>
    </v-card-text>

    <!-- Contact Information Display -->
    <v-card-text v-else-if="!isEditing">
      <div v-if="hasBookingContacts">
        <v-list>
          <!-- Phone Contact -->
          <v-card
            v-if="contactInfo.phone_number"
            class="mb-3"
            elevation="10"
            style="border-radius: 8px; overflow: hidden"
          >
            <v-list-item
              @click="copyToClipboard(contactInfo.phone_number)"
              class="contact-item"
              min-height="64"
            >
              <template v-slot:prepend>
                <v-icon color="primary" size="24" class="mr-2">
                  mdi-phone
                </v-icon>
              </template>
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ contactInfo.phone_number }}
                <v-chip
                  v-if="contactInfo.phone_preferred"
                  size="small"
                  color="primary"
                  class="ml-2"
                >
                  Preferred
                </v-chip>
              </v-list-item-title>
              <template v-slot:append>
                <v-icon size="20">mdi-content-copy</v-icon>
              </template>
            </v-list-item>
          </v-card>

          <!-- WhatsApp Contact -->
          <v-card
            v-if="contactInfo.whatsapp_number"
            class="mb-3"
            elevation="10"
            style="border-radius: 8px; overflow: hidden"
          >
            <v-list-item
              :href="getWhatsAppUrl(contactInfo.whatsapp_number)"
              target="_blank"
              class="contact-item"
              min-height="64"
            >
              <template v-slot:prepend>
                <v-icon color="success" size="24" class="mr-2">
                  mdi-whatsapp
                </v-icon>
              </template>
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ contactInfo.whatsapp_number }}
                <v-chip
                  v-if="contactInfo.whatsapp_preferred"
                  size="small"
                  color="success"
                  class="ml-2"
                >
                  Preferred
                </v-chip>
              </v-list-item-title>
              <template v-slot:append>
                <v-icon size="20">mdi-open-in-new</v-icon>
              </template>
            </v-list-item>
          </v-card>

          <!-- Email Contact -->
          <v-card
            v-if="contactInfo.email"
            class="mb-3"
            elevation="10"
            style="border-radius: 8px; overflow: hidden"
          >
            <v-list-item
              @click="copyToClipboard(contactInfo.email)"
              class="contact-item"
              min-height="64"
            >
              <template v-slot:prepend>
                <v-icon color="info" size="24" class="mr-2"> mdi-email </v-icon>
              </template>
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ contactInfo.email }}
                <v-chip
                  v-if="contactInfo.email_preferred"
                  size="small"
                  color="info"
                  class="ml-2"
                >
                  Preferred
                </v-chip>
              </v-list-item-title>
              <template v-slot:append>
                <v-icon size="20">mdi-content-copy</v-icon>
              </template>
            </v-list-item>
          </v-card>

          <!-- Website Link -->
          <v-card
            v-if="contactInfo.website_url"
            class="mb-3"
            elevation="10"
            style="border-radius: 8px; overflow: hidden"
          >
            <v-list-item
              :href="contactInfo.website_url"
              target="_blank"
              class="contact-item"
              min-height="64"
            >
              <template v-slot:prepend>
                <v-icon color="purple" size="24" class="mr-2"> mdi-web </v-icon>
              </template>
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ contactInfo.website_url }}
                <v-chip
                  v-if="contactInfo.website_preferred"
                  size="small"
                  color="purple"
                  class="ml-2"
                >
                  Preferred
                </v-chip>
              </v-list-item-title>
              <template v-slot:append>
                <v-icon size="20">mdi-open-in-new</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-list>
      </div>
      <div v-else>
        <!-- Default User Contacts -->
        <v-list class="py-2">
          <v-card v-if="user.phone" class="mb-3" elevation="10" hover>
            <v-list-item
              @click="copyToClipboard(user.phone)"
              class="contact-item"
              min-height="64"
            >
              <template v-slot:prepend>
                <v-icon color="primary" size="24" class="mr-2">
                  mdi-phone
                </v-icon>
              </template>
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ user.phone }}
              </v-list-item-title>
              <template v-slot:append>
                <v-icon size="20">mdi-content-copy</v-icon>
              </template>
            </v-list-item>
          </v-card>

          <v-card v-if="user.email" class="mb-3" elevation="10" hover>
            <v-list-item
              @click="copyToClipboard(user.email)"
              class="contact-item"
              min-height="64"
            >
              <template v-slot:prepend>
                <v-icon color="info" size="24" class="mr-2"> mdi-email </v-icon>
              </template>
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ user.email }}
              </v-list-item-title>
              <template v-slot:append>
                <v-icon size="20">mdi-content-copy</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-list>
      </div>
    </v-card-text>

    <!-- Edit Form -->
    <v-card-text v-else>
      <v-form
        ref="form"
        v-model="isFormValid"
        @update:modelValue="updateFormValidity"
      >
        <v-text-field
          v-model="editedContacts.phone_number"
          label="Phone Number"
          :rules="validationRules.phone"
          prepend-icon="mdi-phone"
          clearable
          variant="outlined"
          density="comfortable"
          placeholder="+1234567890"
        />

        <v-text-field
          v-model="editedContacts.whatsapp_number"
          label="WhatsApp Number"
          :rules="validationRules.phone"
          prepend-icon="mdi-whatsapp"
          clearable
          variant="outlined"
          density="comfortable"
          placeholder="+1234567890"
        />

        <v-text-field
          v-model="editedContacts.email"
          label="Email"
          :rules="validationRules.email"
          prepend-icon="mdi-email"
          clearable
          variant="outlined"
          density="comfortable"
          required
          placeholder="your@email.com"
        />

        <v-text-field
          v-model="editedContacts.website_url"
          label="Website URL"
          :rules="validationRules.url"
          prepend-icon="mdi-web"
          clearable
          variant="outlined"
          density="comfortable"
          placeholder="https://example.com"
        />

        <v-radio-group
          v-model="editedContacts.preferred_contact"
          label="Preferred Contact Method"
          class="mt-4"
          required
        >
          <v-radio
            v-if="editedContacts.whatsapp_number"
            label="WhatsApp"
            value="whatsapp"
            color="success"
          />
          <v-radio
            v-if="editedContacts.phone_number"
            label="Phone"
            value="phone"
            color="primary"
          />
          <v-radio label="Email" value="email" color="info" />
          <v-radio
            v-if="editedContacts.website_url"
            label="Website"
            value="website"
            color="purple"
          />
        </v-radio-group>
      </v-form>
    </v-card-text>

    <!-- Actions -->
    <template #actions>
      <v-spacer />
      <v-btn
        v-if="!isEditing && isProfileOwner"
        color="primary"
        @click="startEditing"
        :disabled="loading"
      >
        Edit Contacts
      </v-btn>
      <template v-else-if="isEditing && isProfileOwner">
        <v-btn
          color="error"
          @click="cancelEditing"
          variant="text"
          :disabled="saving"
          class="mr-2"
        >
          Cancel
        </v-btn>
        <v-btn
          color="success"
          @click="saveContacts"
          :loading="saving"
          :disabled="!canSave"
        >
          Save
        </v-btn>
      </template>
    </template>
  </BaseDialog>

  <!-- Snackbar -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="2000"
    location="top"
  >
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useProfileOwnership } from '@/composables/useProfileOwnership'
import BaseDialog from '../dialogs/BaseDialog.vue'

// Props Interface
interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  display_name: string
  profile_photo: string
  email?: string
  phone?: string
  talent?: string
}

interface ContactInfo {
  id?: number
  user_id: number
  phone_number: string | null
  whatsapp_number: string | null
  email: string
  website_url: string | null
  whatsapp_preferred: boolean
  phone_preferred: boolean
  email_preferred: boolean
  website_preferred: boolean
}

// Props
const props = defineProps<{
  user: User
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'close'])

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const { isProfileOwner } = useProfileOwnership(props.user?.username)

// Composables
const { $axios } = useNuxtApp()

// State Management
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const isEditing = ref(false)
const isFormValid = ref(true)
const form = ref<any>(null)

// Snackbar State
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

// Contact State
const contactInfo = ref<ContactInfo | null>(null)
const editedContacts = ref({
  phone_number: '',
  whatsapp_number: '',
  email: '',
  website_url: '',
  preferred_contact: 'email' as 'email' | 'phone' | 'whatsapp' | 'website',
})

// Validation Rules
const validationRules = {
  phone: [
    (v: string) =>
      !v ||
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v) ||
      'Invalid phone number',
  ],
  email: [
    (v: string) => !v || !!v || 'Email is required',
    (v: string) => !v || /.+@.+\..+/.test(v) || 'Invalid email',
  ],
  url: [
    (v: string) =>
      !v ||
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) ||
      'Invalid URL',
  ],
}

// Methods
const showSnackbar = (text: string, color: string = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color,
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSnackbar('Copied to clipboard!')
  } catch (err) {
    showSnackbar('Failed to copy', 'error')
  }
}

const getWhatsAppUrl = (number: string): string => {
  const cleanNumber = number.replace(/[^0-9+]/g, '')
  const formattedNumber = cleanNumber.startsWith('+')
    ? cleanNumber.slice(1)
    : cleanNumber
  const message = encodeURIComponent("Hi, I'm interested in booking you!")
  return `https://wa.me/${formattedNumber}?text=${message}`
}

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('close')
  error.value = ''
  isEditing.value = false
  if (form.value) {
    form.value.reset()
  }
}

const updateFormValidity = (value: boolean) => {
  isFormValid.value = value
}

// Computed Properties
const hasBookingContacts = computed(() => contactInfo.value !== null)

const canSave = computed(() => {
  if (!editedContacts.value.email) {
    return false
  }

  const emailValid = /.+@.+\..+/.test(editedContacts.value.email)

  const phoneValid =
    !editedContacts.value.phone_number ||
    /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
      editedContacts.value.phone_number
    )

  const whatsappValid =
    !editedContacts.value.whatsapp_number ||
    /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
      editedContacts.value.whatsapp_number
    )

  const urlValid =
    !editedContacts.value.website_url ||
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
      editedContacts.value.website_url
    )

  const preferredContactValid = (() => {
    switch (editedContacts.value.preferred_contact) {
      case 'phone':
        return !!editedContacts.value.phone_number
      case 'whatsapp':
        return !!editedContacts.value.whatsapp_number
      case 'website':
        return !!editedContacts.value.website_url
      case 'email':
        return true
      default:
        return false
    }
  })()

  return (
    emailValid &&
    phoneValid &&
    whatsappValid &&
    urlValid &&
    preferredContactValid
  )
})

const fetchContacts = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $axios.get(`/api/booking-contacts/${props.user.id}`)
    contactInfo.value = response.data
  } catch (err: any) {
    error.value =
      err.response?.data?.message || 'Failed to load contact information'
    console.error('Error fetching contacts:', err)
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  const currentContacts = contactInfo.value || {
    phone_number: props.user.phone || '',
    email: props.user.email || '',
    whatsapp_number: '',
    website_url: '',
    whatsapp_preferred: false,
    phone_preferred: false,
    email_preferred: true,
    website_preferred: false,
  }

  editedContacts.value = {
    phone_number: currentContacts.phone_number || '',
    whatsapp_number: currentContacts.whatsapp_number || '',
    email: currentContacts.email || props.user.email || '',
    website_url: currentContacts.website_url || '',
    preferred_contact: currentContacts.whatsapp_preferred
      ? 'whatsapp'
      : currentContacts.phone_preferred
      ? 'phone'
      : currentContacts.website_preferred
      ? 'website'
      : 'email',
  }

  isEditing.value = true
  isFormValid.value = true
}

const cancelEditing = () => {
  closeDialog()
}

const saveContacts = async () => {
  if (!canSave.value) {
    return
  }

  saving.value = true
  try {
    const contactData = {
      user_id: props.user.id,
      phone_number: editedContacts.value.phone_number || null,
      whatsapp_number: editedContacts.value.whatsapp_number || null,
      email: editedContacts.value.email,
      website_url: editedContacts.value.website_url || null,
      whatsapp_preferred: editedContacts.value.preferred_contact === 'whatsapp',
      phone_preferred: editedContacts.value.preferred_contact === 'phone',
      email_preferred: editedContacts.value.preferred_contact === 'email',
      website_preferred: editedContacts.value.preferred_contact === 'website',
    }

    const response = contactInfo.value?.id
      ? await $axios.put(
          `/api/booking-contacts/${contactInfo.value.id}`,
          contactData
        )
      : await $axios.post('/api/booking-contacts', contactData)

    contactInfo.value = response.data
    showSnackbar('Contacts saved successfully')
    closeDialog()
  } catch (err: any) {
    error.value =
      err.response?.data?.message || 'Failed to save contact information'
    showSnackbar('Failed to save contacts', 'error')
    console.error('Error saving contacts:', err)
  } finally {
    saving.value = false
  }
}

// Watch for dialog open to fetch contacts
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      fetchContacts()
    } else {
      isEditing.value = false
    }
  }
)

watch(
  [
    () => editedContacts.value.phone_number,
    () => editedContacts.value.whatsapp_number,
    () => editedContacts.value.website_url,
  ],
  () => {
    const current = editedContacts.value.preferred_contact

    if (
      (current === 'phone' && !editedContacts.value.phone_number) ||
      (current === 'whatsapp' && !editedContacts.value.whatsapp_number) ||
      (current === 'website' && !editedContacts.value.website_url)
    ) {
      editedContacts.value.preferred_contact = 'email'
    }
  }
)

// Initialize component
onMounted(() => {
  if (props.modelValue) {
    fetchContacts()
  }
})
</script>

<style scoped>
.contact-item {
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.contact-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.v-list {
  background: transparent !important;
}

/* Update spacing to use padding on v-list instead of margins on cards */
.v-list {
  padding: 0 16px !important;
}

.v-card {
  width: 100% !important;
}

/* Remove any default card margins */
.v-card:not(:last-child) {
  margin-bottom: 12px;
}
</style>
