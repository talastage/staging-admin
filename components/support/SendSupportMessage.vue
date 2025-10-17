<!-- components/support/SupportMessagesTab.vue -->
<template>
  <div class="support-ticket-container">
    <!-- Success State -->
    <Transition name="fade" mode="out-in">
      <v-card
        v-if="isSubmitSuccess"
        key="success"
        class="success-card mx-auto text-center"
        elevation="3"
      >
        <v-card-text class="py-12">
          <div class="success-animation">
            <v-icon
              icon="mdi-check-circle"
              color="success"
              size="72"
              class="mb-4 animate-bounce"
            />
          </div>
          <h2 class="text-h4 mb-3 text-success font-weight-medium">
            Request Submitted!
          </h2>
          <p class="text-body-1 mb-6 text-medium-emphasis">
            We've received your support request and will respond within 24
            hours. You'll receive an email confirmation shortly.
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            @click="resetForm"
            prepend-icon="mdi-plus"
          >
            Submit Another Request
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Form State -->
      <v-card v-else key="form" class="form-card mx-auto" elevation="2">
        <!-- Header -->
        <v-card-title class="px-6 py-4 bg-primary-lighten-5">
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-help-circle-outline"
              class="mr-3"
              color="primary"
            />
            <div>
              <h3 class="text-h6 mb-1">Contact Support</h3>
              <p class="text-caption text-medium-emphasis mb-0">
                We're here to help! Tell us what you need assistance with.
              </p>
            </div>
          </div>
        </v-card-title>

        <!-- Progress Indicator -->
        <v-progress-linear
          v-if="isSubmitting"
          indeterminate
          color="primary"
          height="3"
        />

        <!-- Form Error Alert -->
        <Transition name="slide-y-transition">
          <v-alert
            v-if="formError"
            type="error"
            variant="tonal"
            closable
            class="ma-4 mb-0"
            @click:close="formError = ''"
          >
            <template #prepend>
              <v-icon icon="mdi-alert-circle" />
            </template>
            {{ formError }}
          </v-alert>
        </Transition>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="submitTicket">
          <v-card-text class="px-6 pt-6">
            <!-- Category Selection -->
            <div class="form-section mb-6">
              <label class="form-label mb-3 d-block">
                What can we help you with? <span class="text-error">*</span>
              </label>
              <SelectCategory
                v-model="formData.category_id"
                :categories="categoriesStore.categories"
                :loading="categoriesStore.isLoading"
                :error-messages="errors.category_id"
                placeholder="Choose a category..."
                variant="outlined"
                density="comfortable"
                @update:model-value="onCategoryChange"
              />
              <v-fade-transition>
                <div
                  v-if="selectedCategoryDescription"
                  class="text-caption text-medium-emphasis mt-2 px-3"
                >
                  {{ selectedCategoryDescription }}
                </div>
              </v-fade-transition>
            </div>

            <!-- Message Input Area -->
            <div class="form-section">
              <label class="form-label mb-3 d-block">
                Describe your issue <span class="text-error">*</span>
              </label>
              <v-textarea
                v-model="formData.message"
                :error-messages="errors.message"
                :rules="messageRules"
                variant="outlined"
                :maxlength="MESSAGE_MAX_LENGTH"
                :counter="formData.message.length > 0"
                rows="5"
                auto-grow
                :max-rows="8"
                :placeholder="messagePlaceholder"
                :disabled="!formData.category_id"
                @input="onMessageInput"
                class="message-textarea"
              >
                <template #counter="{ props }">
                  <div
                    class="text-caption"
                    :class="getCounterClass(props.value)"
                  >
                    {{ props.value }} / {{ MESSAGE_MAX_LENGTH }}
                  </div>
                </template>
              </v-textarea>

              <!-- Helpful Tips -->
              <v-expand-transition>
                <v-card
                  v-if="showHelpfulTips && formData.category_id"
                  variant="tonal"
                  color="info"
                  class="mt-3"
                >
                  <v-card-text class="py-3">
                    <div class="d-flex align-start">
                      <v-icon
                        icon="mdi-lightbulb-outline"
                        color="info"
                        size="20"
                        class="mr-2 mt-1"
                      />
                      <div>
                        <div class="text-subtitle-2 mb-2">Helpful Tips:</div>
                        <ul class="text-body-2 mb-0 pl-4">
                          <li v-for="tip in currentCategoryTips" :key="tip">
                            {{ tip }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-expand-transition>
            </div>
          </v-card-text>

          <!-- Submit Section -->
          <v-card-actions class="px-6 pb-6 pt-0">
            <v-divider class="mb-4" />
            <div class="w-100 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <span class="text-caption text-medium-emphasis">
                  <span class="text-error">*</span> Required fields
                </span>
                <v-tooltip
                  v-if="!canSubmit && formData.message.length > 0"
                  activator="parent"
                  location="top"
                >
                  <div v-if="!formData.category_id">
                    Please select a category
                  </div>
                  <div v-else-if="formData.message.length < MESSAGE_MIN_LENGTH">
                    Message must be at least {{ MESSAGE_MIN_LENGTH }} characters
                  </div>
                </v-tooltip>
              </div>

              <div class="d-flex align-center gap-3">
                <v-btn
                  v-if="hasFormData"
                  variant="text"
                  color="error"
                  @click="confirmReset"
                  :disabled="isSubmitting"
                >
                  Clear Form
                </v-btn>
                <v-btn
                  color="primary"
                  size="large"
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="!canSubmit"
                  prepend-icon="mdi-send"
                >
                  <template #loading>
                    <span>Submitting...</span>
                  </template>
                  Submit Request
                </v-btn>
              </div>
            </div>
          </v-card-actions>
        </v-form>

        <!-- Loading Overlay for Categories -->
        <v-overlay
          v-model="categoriesStore.isLoading"
          class="align-center justify-center"
          persistent
          contained
        >
          <div class="text-center">
            <v-progress-circular indeterminate color="primary" size="48" />
            <div class="mt-3 text-body-2">Loading categories...</div>
          </div>
        </v-overlay>
      </v-card>
    </Transition>

    <!-- Reset Confirmation Dialog -->
    <v-dialog v-model="showResetDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Clear Form?</v-card-title>
        <v-card-text>
          Are you sure you want to clear all form data? This action cannot be
          undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showResetDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="text" @click="performReset"
            >Clear</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useCategoriesStore } from '~/stores/help/categories'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

// Constants
const MESSAGE_MIN_LENGTH = 10
const MESSAGE_MAX_LENGTH = 1000
const DEBOUNCE_DELAY = 300

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

interface Category {
  id: number
  name: string
  description?: string
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
const showResetDialog = ref(false)
const showHelpfulTips = ref(true)

// Form data
const formData = ref<FormData>({
  category_id: null,
  message: '',
})

// Validation rules
const messageRules = [
  (v: string) => !!v || 'Message is required',
  (v: string) =>
    (v && v.length >= MESSAGE_MIN_LENGTH) ||
    `Message must be at least ${MESSAGE_MIN_LENGTH} characters`,
  (v: string) =>
    (v && v.length <= MESSAGE_MAX_LENGTH) ||
    `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`,
]

// Computed properties
const canSubmit = computed(
  () =>
    isFormValid.value &&
    formData.value.category_id &&
    formData.value.message.trim().length >= MESSAGE_MIN_LENGTH &&
    !isSubmitting.value
)

const hasFormData = computed(
  () => formData.value.category_id || formData.value.message.trim().length > 0
)

const messagePlaceholder = computed(() => {
  if (!formData.value.category_id) {
    return 'Please select a category first to enable this field...'
  }
  return 'Please provide as much detail as possible about your issue. Include any error messages, steps you took, and what you expected to happen.'
})

const selectedCategoryDescription = computed(() => {
  if (!formData.value.category_id) return ''
  const category = categoriesStore.categories.find(
    (cat: Category) => cat.id === formData.value.category_id
  )
  return category?.description || ''
})

const currentCategoryTips = computed(() => {
  const tips = {
    1: ['Include specific error messages', 'Mention when the issue started'],
    2: [
      'Describe what you were trying to do',
      'Include screenshots if helpful',
    ],
    3: ['Specify your account details', 'Mention payment method used'],
    default: [
      'Be as specific as possible',
      'Include relevant details like browser, device, or error messages',
      'Mention steps to reproduce the issue',
    ],
  }
  return tips[formData.value.category_id as keyof typeof tips] || tips.default
})

// Methods
const clearErrors = () => {
  errors.value = {}
  formError.value = ''
}

const getCounterClass = (count: number) => ({
  'text-error': count > MESSAGE_MAX_LENGTH * 0.9,
  'text-warning':
    count > MESSAGE_MAX_LENGTH * 0.8 && count <= MESSAGE_MAX_LENGTH * 0.9,
})

const onCategoryChange = () => {
  clearErrors()
  // Auto-focus message field when category is selected
  if (formData.value.category_id) {
    nextTick(() => {
      const textarea = document.querySelector('.message-textarea textarea')
      if (textarea) {
        ;(textarea as HTMLElement).focus()
      }
    })
  }
}

const onMessageInput = () => {
  clearErrors()
}

const confirmReset = () => {
  showResetDialog.value = true
}

const performReset = () => {
  resetForm()
  showResetDialog.value = false
  snack.info('Form cleared')
}

const resetForm = () => {
  formData.value = {
    category_id: null,
    message: '',
  }
  clearErrors()
  if (form.value) {
    form.value.resetValidation()
  }
  isSubmitSuccess.value = false
}

const submitTicket = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  clearErrors()

  try {
    await $axios.post('/api/support/tickets', {
      ...formData.value,
      message: formData.value.message.trim(),
    })

    snack.success('Your support request has been submitted successfully!')
    isSubmitSuccess.value = true

    // Reset form data but keep success state
    formData.value = {
      category_id: null,
      message: '',
    }
  } catch (error: any) {
    console.error('Submit error:', error.response?.data)

    if (error.response?.status === 422 && error.response?.data?.errors) {
      errors.value = error.response.data.errors
      snack.error('Please check the form for errors')
    } else if (error.response?.data?.message) {
      formError.value = error.response.data.message
      snack.error(formError.value)
    } else if (error.response?.status >= 500) {
      formError.value =
        'Server is temporarily unavailable. Please try again later.'
      snack.error('Server error - please try again later')
    } else {
      formError.value = 'An unexpected error occurred. Please try again.'
      snack.error('Something went wrong - please try again')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Auto-save to localStorage (optional enhancement)
const saveFormData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('supportFormDraft', JSON.stringify(formData.value))
  }
}

const loadFormData = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('supportFormDraft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.category_id || parsed.message) {
          formData.value = parsed
        }
      } catch (e) {
        console.warn('Failed to load saved form data')
      }
    }
  }
}

// Watch for form changes to auto-save
watch(
  formData,
  () => {
    if (hasFormData.value) {
      saveFormData()
    }
  },
  { deep: true }
)

// Lifecycle
onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
    loadFormData() // Load any previously saved draft
  } catch (error) {
    formError.value = 'Failed to load categories. Please refresh the page.'
    snack.error('Failed to load support categories')
  }
})

// Cleanup auto-saved data on successful submit
watch(isSubmitSuccess, (newVal) => {
  if (newVal && typeof window !== 'undefined') {
    localStorage.removeItem('supportFormDraft')
  }
})
</script>

<style scoped lang="scss">
.support-ticket-container {
  max-width: 900px;
  margin: 0 auto;
}

.success-card,
.form-card {
  border-radius: 12px;
  overflow: hidden;
}

.form-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.875rem;
}

.form-section {
  position: relative;
}

.message-textarea {
  :deep(.v-field__input) {
    min-height: 120px !important;
  }

  :deep(.v-field--disabled) {
    opacity: 0.6;
  }
}

.success-animation {
  .animate-bounce {
    animation: bounce 1s ease-in-out;
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Responsive adjustments
@media (max-width: 600px) {
  .support-ticket-container {
    padding: 0 16px;
  }

  .form-card {
    margin: 0;
  }

  .v-card-actions {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;

    .d-flex {
      flex-direction: column;
      align-items: stretch !important;

      .v-btn {
        width: 100%;
      }
    }
  }
}
</style>
