<!-- components/report/SendReportMessage.vue -->
<template>
  <!-- Success State -->
  <div v-if="isSubmitSuccess" class="report-problem mx-auto text-center pa-6">
    <div class="mb-6">
      <v-icon
        icon="mdi-check-circle-outline"
        color="success"
        size="64"
        class="mb-4"
      />
      <h2 class="text-h5 mb-4">Thank You for Reporting!</h2>
      <p class="text-body-1">
        We've received your report and will get back to you as soon as possible.
      </p>
    </div>
  </div>

  <!-- Form State -->
  <div
    v-else
    class="report-problem mx-auto pa-6"
    style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)"
  >
    <!-- Header -->
    <div class="text-h6 pb-0 mb-2">Report a Problem</div>
    <div class="text-body-2 mb-4">
      Please fill out the form below and we'll respond as soon as we can.
    </div>

    <!-- Form Error Alert -->
    <v-alert
      v-if="formError"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="formError = ''"
    >
      {{ formError }}
    </v-alert>

    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitReport">
      <!-- Category Selection -->
      <v-row>
        <v-col cols="12">
          <SelectCategory
            v-model="formData.category_id"
            :categories="categoriesStore.categories"
            :is-loading="categoriesStore.isLoading"
            :error-messages="errors.category_id"
            label="Category of the Problem"
            required
            @change="clearErrors"
          />
          <div class="text-caption text-medium-emphasis mt-1">
            Select the category that best matches your issue
          </div>
        </v-col>
      </v-row>

      <!-- Message Input Area -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-textarea
            v-model="formData.message"
            label="Describe your problem"
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

      <!-- Submit Section -->
      <v-divider class="my-4" />
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
          Submit Report
        </v-btn>
      </div>
    </v-form>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="categoriesStore.isLoading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const submitReport = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  clearErrors()

  try {
    await $axios.post('/api/support/tickets', formData.value)
    snack.success('Your problem report has been submitted successfully')
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
    snack.error(formError.value || 'Failed to submit report')
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
.report-problem {
  max-width: 800px;

  :deep(.v-textarea .v-field__input) {
    min-height: 120px !important;
  }
}
</style>
