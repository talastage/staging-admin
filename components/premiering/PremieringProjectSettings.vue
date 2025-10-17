<template>
  <div class="project-publish-settings">
    <div class="settings-section">
      <h3 class="mb-4">Premiering Schedule</h3>

      <!-- Alert for displaying errors -->
      <AlertMessage
        v-if="errorMessage"
        :message="errorMessage"
        type="error"
        :visible="!!errorMessage"
        @dismiss="errorMessage = ''"
      />

      <div class="publish-options">
        <p class="text-subtitle-1 mb-3">
          Choose when to make your project premiere:
        </p>

        <v-radio-group v-model="publishingStore.publishOption" row class="mb-4">
          <v-radio value="now">
            <template #label>
              <div class="d-flex align-center">
                <v-icon icon="mdi-rocket-launch" color="primary" class="mr-2" />
                <div>
                  <span class="font-weight-medium">Premiere Now</span>
                  <div class="text-caption text-medium-emphasis">
                    Your project will premiere immediately.
                  </div>
                </div>
              </div>
            </template>
          </v-radio>

          <v-radio value="schedule">
            <template #label>
              <div class="d-flex align-center">
                <v-icon
                  icon="mdi-calendar-clock"
                  color="primary"
                  class="mr-2"
                />
                <div>
                  <span class="font-weight-medium"
                    >Schedule for Later Premiere</span
                  >
                  <div class="text-caption text-medium-emphasis">
                    Choose a specific date and time for premiering.
                  </div>
                </div>
              </div>
            </template>
          </v-radio>

          <v-radio value="draft">
            <template #label>
              <div class="d-flex align-center">
                <v-icon
                  icon="mdi-content-save"
                  color="secondary"
                  class="mr-2"
                />
                <div>
                  <span class="font-weight-medium">Save as Draft</span>
                  <div class="text-caption text-medium-emphasis">
                    Save your project and publish later.
                  </div>
                </div>
              </div>
            </template>
          </v-radio>
        </v-radio-group>

        <v-expand-transition>
          <div
            v-if="publishingStore.publishOption === 'schedule'"
            class="schedule-fields mt-4 pa-4 rounded bg-grey-lighten-4"
          >
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-information" color="primary" class="mr-2" />
              <span class="text-body-2">
                Select your preferred premiering time:
              </span>
            </div>

            <div class="d-flex gap-4 flex-wrap">
              <div class="time-selector">
                <label class="text-caption mb-1 d-block">Time</label>
                <SelectTime
                  v-model="publishingStore.timeToPost"
                  placeholder="Select time"
                />
                <span class="text-caption text-medium-emphasis mt-1 d-block">
                  Choose the time to premiere.
                </span>
              </div>

              <div class="date-selector">
                <label class="text-caption mb-1 d-block">Date</label>
                <SelectDate
                  v-model="publishingStore.dateToPost"
                  placeholder="Select date"
                />
                <span class="text-caption text-medium-emphasis mt-1 d-block">
                  Choose the date to premiere.
                </span>
              </div>
            </div>

            <div
              v-if="publishingStore.dateToPost && publishingStore.timeToPost"
              class="mt-4 pa-3 rounded bg-primary-lighten-5"
            >
              <div class="d-flex align-center">
                <v-icon icon="mdi-clock-check" color="primary" class="mr-2" />
                <span class="text-body-2">
                  Scheduled to premiere on
                  <strong>{{ formattedScheduleDateTime }}</strong>
                </span>
              </div>
            </div>
          </div>
        </v-expand-transition>

        <!-- Action Button -->
        <div class="mt-6">
          <v-btn
            :color="publishingStore.actionColor"
            :loading="isLoading"
            :disabled="isLoading"
            size="large"
            block
            @click="handleAction"
          >
            <v-icon :icon="publishingStore.actionIcon" class="mr-2" />
            {{ publishingStore.actionTitle }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Missing Fields Dialog -->
    <PremieringMissingFieldsDialog
      v-model="showMissingFieldsDialog"
      :missingFields="missingFields"
    />

    <!-- Payment Dialog -->
    <PremieringPaymentDialog
      v-model="showPaymentDialog"
      :project="mediaUploadStore.project"
      :title="dialogTitle"
      :error-message="paymentErrorMessage"
      @payment-success="handlePaymentSuccess"
      @payment-failed="handlePaymentFailed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePublishingStore } from '~/stores/usePublishingStore'
import { usePremieringMediaUpload } from '~/stores/premiering/usePremieringMediaUpload'
import { getUploadStatusMessage } from '~/utils/premieringProjectStatusMessages'
import { useNuxtApp } from '#app'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import AlertMessage from '~/components/alert/AlertMessage.vue'
import PremieringPaymentDialog from '~/components/premiering/PremieringPaymentDialog.vue'

interface MissingField {
  field: string
  message: string
}

interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

const publishingStore = usePublishingStore()
const mediaUploadStore = usePremieringMediaUpload()
const project = computed(() => mediaUploadStore.project)
const { $axios, $router } = useNuxtApp()
const snackMessageStore = useSnackMessageStore()

const showMissingFieldsDialog = ref<boolean>(false)
const showPaymentDialog = ref<boolean>(false)
const missingFields = ref<MissingField[]>([])
const errorMessage = ref<string>('')
// Use computed property to get error from store
const paymentErrorMessage = computed(() => mediaUploadStore.error)
const dialogTitle = ref<string>('')
const isLoading = ref<boolean>(false)

// Dynamic dialog title based on project name
const dialogTitleComputed = computed(
  () => `Premiering Payment - ${project.value?.name || 'Project'}`
)

// Detect the user's local timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

// Format the scheduled date and time using the user's timezone for consistent display.
const formattedScheduleDateTime = computed<string>(() => {
  if (!publishingStore.dateToPost || !publishingStore.timeToPost) return ''
  const dateTimeString = `${publishingStore.dateToPost}T${publishingStore.timeToPost}`
  const dateObj = new Date(dateTimeString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: userTimeZone,
  }).format(dateObj)
})

function getMissingRequiredFields(): MissingField[] {
  const fields: MissingField[] = []
  if (!project.value) {
    fields.push({
      field: 'project_data',
      message: 'Project data is missing. Please refresh the page.',
    })
    return fields
  }
  if (!project.value.name) {
    fields.push({ field: 'name', message: 'Please enter a project name.' })
  }
  if (!project.value.thumbnail_url) {
    fields.push({
      field: 'thumbnail',
      message: 'Please upload a thumbnail for your project.',
    })
  }
  if (
    project.value.main_upload_status !== 'completed' ||
    !project.value.project_url
  ) {
    fields.push({
      field: 'main_video',
      message: getUploadStatusMessage(project.value.main_upload_status, 'main'),
    })
  }
  if (
    project.value.trailer_upload_status !== 'completed' ||
    !project.value.trailer_url
  ) {
    fields.push({
      field: 'trailer',
      message: getUploadStatusMessage(
        project.value.trailer_upload_status,
        'trailer'
      ),
    })
  }
  if (!project.value.premiering_category_id) {
    fields.push({
      field: 'category',
      message: 'Please select a category for your project.',
    })
  }
  return fields
}

// Check if all required fields are filled before proceeding
function validateRequiredFields(): boolean {
  const missing = getMissingRequiredFields()
  if (missing.length > 0) {
    missingFields.value = missing

    // Check if payment_status is failed
    if (project.value?.payment_status === 'failed') {
      mediaUploadStore.error = 'Payment is required to premiere this project.'
      dialogTitle.value = dialogTitleComputed.value
      showPaymentDialog.value = true
      return false
    }

    showMissingFieldsDialog.value = true
    return false
  }
  return true
}

// Handle API errors in a consistent way
function handleApiError(error: any): void {
  isLoading.value = false

  // Check if the error is related to payment
  if (
    error.response?.status === 402 ||
    (error.response?.data?.message &&
      error.response?.data?.message.toLowerCase().includes('payment'))
  ) {
    // Store the error in mediaUploadStore.error instead of local ref
    mediaUploadStore.error =
      error.response?.data?.message ||
      'Payment is required to premiere this project.'

    // Set appropriate title based on error message
    if (error.response?.data?.message?.toLowerCase().includes('insufficient')) {
      dialogTitle.value = 'Insufficient Funds: Unable to charge your wallet'
    } else if (
      error.response?.data?.message?.toLowerCase().includes('currency')
    ) {
      dialogTitle.value = 'Currency Mismatch'
    } else {
      dialogTitle.value = dialogTitleComputed.value
    }

    showPaymentDialog.value = true
    return
  }

  if (error.response?.data) {
    const responseData = error.response.data as ApiError

    // Display the main error message
    errorMessage.value =
      responseData.message || 'An error occurred. Please try again.'

    // If there are field-specific errors, add them to missing fields
    if (responseData.errors) {
      const fieldErrors: MissingField[] = []

      Object.entries(responseData.errors).forEach(([field, messages]) => {
        fieldErrors.push({
          field,
          message: Array.isArray(messages) ? messages[0] : String(messages),
        })
      })

      if (fieldErrors.length > 0) {
        missingFields.value = fieldErrors
        showMissingFieldsDialog.value = true
      }
    }
  } else {
    errorMessage.value =
      error.message || 'An unexpected error occurred. Please try again.'
  }

  console.error('API Error:', error)
}

// Handle action based on selected option
async function handleAction(): Promise<void> {
  switch (publishingStore.publishOption) {
    case 'now':
      await handlePremiereNow()
      break
    case 'schedule':
      await handleSchedule()
      break
    case 'draft':
      await handleDraft()
      break
  }
}

async function handlePremiereNow(): Promise<void> {
  if (!validateRequiredFields()) return

  errorMessage.value = ''
  isLoading.value = true
  publishingStore.processingAction = 'premiereNow'

  try {
    await premiereNow()
    snackMessageStore.success('Project premiered successfully.')
    // Emit success event
    emitPublishSuccess()
    // Redirect to manage-projects page
    window.location.href = '/studio/projects/manage-projects'
  } catch (err) {
    handleApiError(err)
  } finally {
    publishingStore.processingAction = null
    isLoading.value = false
  }
}

async function handleSchedule(): Promise<void> {
  if (!validateRequiredFields()) return

  // Validate schedule-specific fields
  if (!publishingStore.dateToPost || !publishingStore.timeToPost) {
    errorMessage.value = 'Please select both date and time for scheduling.'
    return
  }

  errorMessage.value = ''
  isLoading.value = true
  publishingStore.processingAction = 'schedulePremiere'

  try {
    await scheduleProject()
    snackMessageStore.success('Project scheduled successfully.')
    // Emit success event
    emitPublishSuccess()
    // Use window.location for a full page refresh to avoid component unmounting issues
    window.location.href = '/studio/projects/manage-projects'
  } catch (err) {
    handleApiError(err)
  } finally {
    publishingStore.processingAction = null
    isLoading.value = false
  }
}

async function handleDraft(): Promise<void> {
  errorMessage.value = ''
  isLoading.value = true
  publishingStore.processingAction = 'saveDraft'

  try {
    await saveDraft()
    snackMessageStore.success('Draft saved successfully.')
    // Navigate to manage-projects with draft tab selected
    window.location.href = '/studio/projects/manage-projects?tab=draft'
  } catch (err) {
    handleApiError(err)
  } finally {
    publishingStore.processingAction = null
    isLoading.value = false
  }
}

async function premiereNow(): Promise<void> {
  const accessUUID = project.value?.access_uuid
  if (!accessUUID) throw new Error('No access UUID found.')

  try {
    const response = await $axios.put(
      `/api/studio/projects/${accessUUID}/premiere`,
      {
        time_zone: userTimeZone,
      }
    )

    return response.data
  } catch (error) {
    // Let the handleApiError function in the caller handle this
    throw error
  }
}

async function scheduleProject(): Promise<void> {
  const accessUUID = project.value?.access_uuid
  if (!accessUUID) throw new Error('No access UUID found.')

  const payload = {
    premiering_start_date: publishingStore.dateToPost || null,
    premiering_time: publishingStore.timeToPost || null,
    time_zone: userTimeZone,
  }

  try {
    const response = await $axios.put(
      `/api/studio/projects/${accessUUID}/schedule`,
      payload
    )
    return response.data
  } catch (error) {
    // Let the handleApiError function in the caller handle this
    throw error
  }
}

async function saveDraft(): Promise<void> {
  const accessUUID = project.value?.access_uuid
  if (!accessUUID) throw new Error('No access UUID found.')

  const payload = {
    name: project.value?.name,
    project_url: project.value?.project_url,
    trailer_url: project.value?.trailer_url,
    premiering_category_id: project.value?.premiering_category_id,
    thumbnail_url: project.value?.thumbnail_url,
  }

  try {
    const response = await $axios.put(
      `/api/studio/projects/${accessUUID}/draft`,
      payload
    )
    return response.data
  } catch (error) {
    // Let the handleApiError function in the caller handle this
    throw error
  }
}

// Handle successful payment
function handlePaymentSuccess() {
  showPaymentDialog.value = false
  snackMessageStore.success(
    'Payment successful! You can now premiere your project.'
  )
  // Refresh project data or continue with the action
  window.location.reload()
}

// Handle failed payment
function handlePaymentFailed(error: any) {
  console.error('Payment error:', error)
  snackMessageStore.error(
    error.response?.data?.message || 'Payment processing failed'
  )
  showPaymentDialog.value = true
}

const emit = defineEmits(['publish-success'])

// Emit event when publishing is successful
function emitPublishSuccess() {
  emit('publish-success')
}

defineExpose({
  handlePremiereNow,
  handleSchedule,
  handleDraft,
  getMissingRequiredFields,
  missingFields,
  showMissingFieldsDialog,
  showPaymentDialog,
})
</script>

<style scoped>
.settings-section {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 24px;
  background-color: white;
}
.time-selector {
  max-width: 180px;
  width: 100%;
}
.date-selector {
  max-width: 220px;
  width: 100%;
}
.schedule-fields {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.schedule-fields:hover {
  border-color: rgba(0, 0, 0, 0.1);
}
</style>
