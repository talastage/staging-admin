<!-- components/support/SupportMessagesTab.vue -->
<template>
  <!-- Success State -->
  <v-card
    v-if="isSubmitSuccess"
    class="support-ticket-create mx-auto text-center"
    elevation="2"
  >
    <v-card-text class="py-12">
      <v-icon
        icon="mdi-check-circle-outline"
        color="success"
        size="64"
        class="mb-4"
      />
      <h2 class="text-h5 mb-4">Thank You for Reaching Out!</h2>
      <p class="text-body-1 mb-6">
        We've received your support request and will get back to you as soon as
        possible.
      </p>
    </v-card-text>
  </v-card>

  <!-- Form State -->
  <v-card v-else class="support-ticket-create mx-auto" elevation="10">
    <v-card-subtitle class="pa-4 pt-2">
      Please fill out the form below and we'll get back to you as soon as
      possible.
    </v-card-subtitle>

    <!-- Form Error Alert -->
    <v-alert
      v-if="formError"
      type="error"
      variant="tonal"
      closable
      class="mx-4"
      @click:close="formError = ''"
    >
      {{ formError }}
    </v-alert>

    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitTicket">
      <!-- Category Selection -->
      <v-card-text class="pt-2">
        <v-row>
          <v-col cols="12">
            <SelectCategory
              v-model="formData.category_id"
              :categories="categoriesStore.categories"
              :is-loading="categoriesStore.isLoading"
              :error-messages="errors.category_id"
              label="What can we help you with?"
              required
              @change="clearErrors"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Message Input Area -->
      <v-card-text class="pt-0">
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="formData.message"
              label="Describe your issue"
              :error-messages="errors.message"
              :rules="messageRules"
              variant="outlined"
              :maxlength="1000"
              :counter="true"
              rows="4"
              auto-grow
              required
              @input="clearErrors"
              :placeholder="getMessagePlaceholder"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Submit Section -->
      <v-card-text class="pt-0">
        <v-divider class="mb-4" />
        <div class="d-flex align-center">
          <div class="text-caption text-medium-emphasis flex-grow-1">
            * Required fields
          </div>
          <v-btn
            color="primary"
            size="large"
            type="submit"
            :loading="isSubmitting"
            :disabled="!canSubmit"
          >
            Submit Ticket
          </v-btn>
        </div>
      </v-card-text>
    </v-form>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="categoriesStore.isLoading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCategoriesStore } from '~/stores/help/categories'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

// Types
interface FormData {
  category_id: number | null
  message: string
}

interface FormErrors {
  category_id?: string[]
  message?: string[]
  [key: string]: string[] | undefined
}

// Composables and stores
const { $axios } = useNuxtApp()
const snack = useSnackMessageStore()
const categoriesStore = useCategoriesStore()

// Form refs and state
const form = ref<any>(null)
const isFormValid = ref(false)
const isSubmitting = ref(false)
const isSubmitSuccess = ref(false)
const errors = ref<FormErrors>({})
const formError = ref('')

// Form data
const formData = ref<FormData>({
  category_id: null,
  message: '',
})

// Validation rules
const messageRules = [
  (v: string) => !!v || 'Message is required',
  (v: string) =>
    (v && v.length >= 10) || 'Message must be at least 10 characters',
]

// Computed
const canSubmit = computed(
  () =>
    isFormValid.value &&
    formData.value.category_id &&
    formData.value.message.trim().length >= 10 &&
    !isSubmitting.value
)

const getMessagePlaceholder = computed(() => {
  if (!formData.value.category_id) {
    return 'Please select a category first'
  }
  return 'Please provide as much detail as possible about your issue...'
})

// Methods
const clearErrors = () => {
  errors.value = {}
  formError.value = ''
}

const resetForm = () => {
  formData.value = {
    category_id: null,
    message: '',
  }
  clearErrors()
  if (form.value) {
    form.value.reset()
  }
  isSubmitSuccess.value = false
}

const submitTicket = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  clearErrors()

  try {
    await $axios.post('/api/support/tickets', formData.value)

    snack.success('Your support ticket has been submitted successfully')
    isSubmitSuccess.value = true
  } catch (error: any) {
    console.error('Submit error:', error.response?.data)

    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else if (error.response?.data?.message) {
      formError.value = error.response.data.message
    } else {
      formError.value = 'An unexpected error occurred. Please try again.'
    }

    snack.error(formError.value || 'Failed to create support ticket')
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    formError.value = 'Failed to load categories. Please refresh the page.'
    snack.error('Failed to load categories')
  }
})
</script>

<style scoped lang="scss">
.support-ticket-create {
  max-width: 800px;

  :deep(.v-textarea .v-field__input) {
    min-height: 120px !important;
  }

  .v-card-title {
    border-bottom: 1px solid
      rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
