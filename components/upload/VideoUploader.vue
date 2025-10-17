<template>
  <div class="video-uploader-container">
    <!-- Inline Alert for store.error or validation error -->
    <AlertMessage
      v-if="store.error || validationError"
      :message="validationError || store.error"
      type="error"
      :visible="true"
    />

    <!-- If insufficient funds, show a "Top Up" button -->
    <v-btn
      v-if="store.insufficientFunds"
      color="primary"
      class="mb-4"
      @click="goToDepositPage"
    >
      Top Up
    </v-btn>

    <v-card elevation="10">
      <!-- TABS -->
      <v-tabs v-model="activeTab" grow class="upload-tabs">
        <v-tab value="main">
          <div class="tab-content">
            <span>Main Video</span>
            <v-chip
              v-if="store.mainUpload.isUploading"
              size="small"
              color="primary"
              class="ml-2"
            >
              {{ Math.ceil(store.mainUpload.progress) }}%
            </v-chip>
          </div>
        </v-tab>
        <v-tab
          value="trailer"
          :disabled="!store.canUploadTrailer"
        >
          <div class="tab-content">
            <span>Trailer</span>
            <v-chip
              v-if="store.trailerUpload.isUploading"
              size="small"
              color="primary"
              class="ml-2"
            >
              {{ Math.ceil(store.trailerUpload.progress) }}%
            </v-chip>
          </div>
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <!-- MAIN VIDEO PANEL -->
          <v-window-item value="main">
            <div class="upload-panel">
              <!-- Show drop zone if pending & not uploading -->
              <div
                v-if="
                  store.mainUpload.processingStatus === 'pending' &&
                  !store.mainUpload.isUploading
                "
                class="upload-initial-state"
              >
                <FileDropZone
                  @drop="(file) => handleFileSelected(file, 'main')"
                  @click="() => triggerFileInput('main')"
                >
                  <template #default="{ isDragOver }">
                    <div
                      class="upload-zone"
                      :class="{ 'upload-zone--dragover': isDragOver }"
                    >
                      <input
                        ref="mainFileInput"
                        type="file"
                        accept="video/mp4"
                        class="hidden-input"
                        @change="(e) => onFileChange(e, 'main')"
                      />
                      <div class="upload-content">
                        <v-icon
                          icon="mdi-cloud-upload"
                          color="primary"
                          size="large"
                          class="upload-icon mb-4"
                        />
                        <h3 class="upload-title">Upload Main Video</h3>
                        <p class="upload-description">
                          Drag and drop your video here or click to browse
                        </p>
                        <v-btn
                          color="primary"
                          class="select-btn mt-4"
                          elevation="0"
                          @click.stop="() => triggerFileInput('main')"
                        >
                          <v-icon left>mdi-plus</v-icon>
                          Select Video
                        </v-btn>
                      </div>
                    </div>
                  </template>
                </FileDropZone>
                <!-- (Optional) Requirements for main video -->
                <div v-if="requirementsData?.main" class="requirements-section">
                  <v-divider class="my-4" />
                  <h4 class="requirements-title">Upload Requirements</h4>
                  <PremieringMediaRequirements
                    v-bind="requirementsData.main"
                    class="mt-2"
                  />
                </div>
              </div>

              <!-- Else show progress or completed/failure block -->
              <div v-else class="upload-progress-state">
                <v-btn
                  v-if="
                    store.mainUpload.processingStatus !== 'completed' &&
                    store.mainUpload.processingStatus !== 'failed'
                  "
                  variant="outlined"
                  color="error"
                  size="small"
                  @click="() => cancelUpload('main')"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>

                <div class="progress-content">
                  <div class="compact-file-info">
                    <div class="file-header">
                      <v-icon size="small" icon="mdi-video" class="mr-2" />
                      <span class="file-name text-truncate">
                        {{ store.mainUpload.fileName }}
                      </span>
                    </div>
                    <div class="file-meta">
                      {{ formatSize(store.mainUpload.fileSize) }}
                    </div>
                  </div>

                  <div class="progress-section">
                    <v-progress-linear
                      :model-value="
                        store.mainUpload.processingStatus === 'completed'
                          ? 100
                          : store.mainUpload.progress
                      "
                      :color="
                        store.mainUpload.processingStatus === 'completed'
                          ? 'success'
                          : 'primary'
                      "
                      height="6"
                      rounded
                      striped
                    />
                    <div class="progress-stats pa-2">
                      <div class="upload-details">
                        <span>
                          {{ formatSize(store.mainUpload.uploadedSize) }}
                          /
                          {{ formatSize(store.mainUpload.fileSize) }}
                        </span>
                        <span v-if="store.mainUpload.speed">
                          {{ formatSize(store.mainUpload.speed) }}/s
                        </span>
                        <span v-if="store.mainUpload.estimatedTimeRemaining">
                          {{
                            formatTimeRemaining(
                              store.mainUpload.estimatedTimeRemaining
                            )
                          }}
                        </span>
                      </div>
                      <div class="status-section">
                        <v-chip
                          :color="
                            getStatusColor(store.mainUpload.processingStatus)
                          "
                          size="small"
                          class="text-capitalize ml-2"
                        >
                          {{ store.mainUpload.processingStatus }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-window-item>

          <!-- TRAILER VIDEO PANEL -->
          <v-window-item value="trailer">
            <div class="upload-panel">
              <div
                v-if="
                  store.trailerUpload.processingStatus === 'pending' &&
                  !store.trailerUpload.isUploading
                "
                class="upload-initial-state"
              >
                <FileDropZone
                  @drop="(file) => handleFileSelected(file, 'trailer')"
                  @click="() => triggerFileInput('trailer')"
                >
                  <template #default="{ isDragOver }">
                    <div
                      class="upload-zone"
                      :class="{ 'upload-zone--dragover': isDragOver }"
                    >
                      <input
                        ref="trailerFileInput"
                        type="file"
                        accept="video/mp4"
                        class="hidden-input"
                        @change="(e) => onFileChange(e, 'trailer')"
                      />
                      <div class="upload-content">
                        <v-icon
                          icon="mdi-cloud-upload"
                          color="primary"
                          size="large"
                          class="upload-icon mb-4"
                        />
                        <h3 class="upload-title">Upload Trailer Video</h3>
                        <p class="upload-description">
                          Drag and drop your video here or click to browse
                        </p>
                        <v-btn
                          color="primary"
                          class="select-btn mt-4"
                          elevation="0"
                          @click.stop="() => triggerFileInput('trailer')"
                        >
                          <v-icon left>mdi-plus</v-icon>
                          Select Video
                        </v-btn>
                      </div>
                    </div>
                  </template>
                </FileDropZone>
                <!-- (Optional) Requirements for trailer video -->
                <div
                  v-if="requirementsData?.trailer"
                  class="requirements-section"
                >
                  <v-divider class="my-4" />
                  <h4 class="requirements-title">Upload Requirements</h4>
                  <PremieringMediaRequirements
                    v-bind="requirementsData.trailer"
                    class="mt-2"
                  />
                </div>
              </div>

              <div v-else class="upload-progress-state">
                <v-btn
                  v-if="
                    store.trailerUpload.processingStatus !== 'completed' &&
                    store.trailerUpload.processingStatus !== 'failed'
                  "
                  variant="outlined"
                  color="error"
                  size="small"
                  @click="() => cancelUpload('trailer')"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>

                <div class="progress-content">
                  <div class="compact-file-info">
                    <div class="file-header">
                      <v-icon size="small" icon="mdi-video" class="mr-2" />
                      <span class="file-name text-truncate">
                        {{ store.trailerUpload.fileName }}
                      </span>
                    </div>
                    <div class="file-meta">
                      {{ formatSize(store.trailerUpload.fileSize) }}
                    </div>
                  </div>

                  <div class="progress-section">
                    <v-progress-linear
                      :model-value="
                        store.trailerUpload.processingStatus === 'completed'
                          ? 100
                          : store.trailerUpload.progress
                      "
                      :color="
                        store.trailerUpload.processingStatus === 'completed'
                          ? 'success'
                          : 'primary'
                      "
                      height="6"
                      rounded
                      striped
                    />
                    <div class="progress-stats pa-2">
                      <div class="upload-details">
                        <span>
                          {{ formatSize(store.trailerUpload.uploadedSize) }}
                          /
                          {{ formatSize(store.trailerUpload.fileSize) }}
                        </span>
                        <span v-if="store.trailerUpload.speed">
                          {{ formatSize(store.trailerUpload.speed) }}/s
                        </span>
                        <span v-if="store.trailerUpload.estimatedTimeRemaining">
                          {{
                            formatTimeRemaining(
                              store.trailerUpload.estimatedTimeRemaining
                            )
                          }}
                        </span>
                      </div>
                      <div class="status-section">
                        <v-chip
                          :color="
                            getStatusColor(store.trailerUpload.processingStatus)
                          "
                          size="small"
                          class="text-capitalize ml-2"
                        >
                          {{ store.trailerUpload.processingStatus }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePremieringMediaUpload } from '~/stores/premiering/usePremieringMediaUpload'
import { usePremieringMediaUploadRequirementsStore } from '@/stores/premiering/usePremieringMediaUploadRequirementsStore'
import AlertMessage from '~/components/alert/AlertMessage.vue'
import FileDropZone from '~/components/upload/FileDropZone.vue'
import { useSnackMessageStore } from '~/stores/useSnackMessage' // optional if you want snackbars
import { useVideoValidation } from '~/composables/useVideoValidation'
import { useVaporUpload } from '~/composables/useVaporUpload'

interface Props {
  requirementsData?: {
    main: {
      maxSize: number
      resolution: string
      format: string
      duration: number
    }
    trailer: {
      maxSize: number
      resolution: string
      format: string
      duration: number
    }
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'upload-progress', type: 'main' | 'trailer', progress?: number): void
  (e: 'upload-uploaded', type: 'main' | 'trailer'): void
  (e: 'upload-error', type: 'main' | 'trailer', error: Error): void
  (e: 'upload-cancelled', type: 'main' | 'trailer'): void
}>()

const store = usePremieringMediaUpload()
const requirementsStore = usePremieringMediaUploadRequirementsStore()
const snackStore = useSnackMessageStore() // optional
const router = useRouter()
const route = useRoute()
const { validateVideo, validationError, formatSize, formatTimeRemaining } =
  useVideoValidation()

const activeTab = ref('main')
const mainFileInput = ref<HTMLInputElement | null>(null)
const trailerFileInput = ref<HTMLInputElement | null>(null)

/**
 * Trigger file input programmatically
 */
function triggerFileInput(type: 'main' | 'trailer') {
  const input = type === 'main' ? mainFileInput.value : trailerFileInput.value
  input?.click()
}

/**
 * Called when user selects a file from the file input
 */
function onFileChange(event: Event, type: 'main' | 'trailer') {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) {
    // Clear any previous validation errors when selecting a new file
    clearValidationError()
    handleFileSelected(file, type)
  }
  ;(event.target as HTMLInputElement).value = ''
}

/**
 * Validate file against requirements
 */
async function validateFile(
  file: File,
  type: 'main' | 'trailer'
): Promise<boolean> {
  // Get validation options based on the type
  const maxFileSize = requirementsStore.requirements?.max_file_size
    ? requirementsStore.requirements.max_file_size * 1024 * 1024 // Convert MB to bytes
    : undefined

  const maxDuration =
    type === 'main'
      ? requirementsStore.requirements?.main_duration_limit
      : requirementsStore.requirements?.trailer_duration_limit

  const allowedFormats = requirementsStore.requirements?.encoding_format
    ? [requirementsStore.requirements.encoding_format]
    : ['MP4']

  const maxResolution = requirementsStore.requirements?.resolution_limit;
    
  const { isValid, error } = await validateVideo(file, {
    maxFileSize,
    maxDuration,
    allowedFormats,
    maxResolution
  })

  if (!isValid && error) {
    snackStore.error(error)
  }

  return isValid
}

/**
 * Attempt to create project (if main file) and upload.
 */
async function handleFileSelected(file: File, type: 'main' | 'trailer') {
  // First validate the file against requirements
  const isValid = await validateFile(file, type)
  if (!isValid) {
    return
  }

  // If main file and no project yet, create it
  if (type === 'main' && !store.project) {
    try {
      await store.createProject({
        name: file.name,
        premiering_category_slug: route.params
          .premiering_category_slug as string,
        file_type: type,
      })
    } catch (err) {
      // store.error is set; possibly insufficient funds or other
      // Optionally trigger a snack
      snackStore.error(store.error || 'Project creation error')
      return
    }
  }

  // If trailer but no project, optionally show error or do something
  if (type === 'trailer' && !store.project) {
    store.error = 'Please upload a main video first.'
    snackStore.error(store.error)
    return
  }

  // Start upload
  emit('upload-progress', type, 0)
  try {
    await store.uploadFile(file, type)
    emit('upload-uploaded', type)
  } catch (err: any) {
    // If upload fails, store.error is set
    emit('upload-error', type, err)
    snackStore.error(store.error || 'Upload error')
  }
}

/**
 * Cancel upload
 */
async function cancelUpload(type: 'main' | 'trailer') {
  // First, call the store's cancelUpload to abort the XHR request
  store.cancelUpload(type)
  
  // Emit the cancelled event
  emit('upload-cancelled', type)
  
  // Clear any validation errors
  clearValidationError()

  // Reset file input so user can pick again
  if (type === 'main' && mainFileInput.value) {
    mainFileInput.value.value = ''
  } else if (type === 'trailer' && trailerFileInput.value) {
    trailerFileInput.value.value = ''
  }
  
  // Force a complete reset of the upload state
  const uploadState = type === 'main' ? store.mainUpload : store.trailerUpload
  
  // Ensure all properties are reset to initial state
  uploadState.isUploading = false
  uploadState.processingStatus = 'pending'
  uploadState.progress = 0
  uploadState.fileName = null
  uploadState.fileSize = 0
  uploadState.uploadedSize = 0
  uploadState.error = null
  
  // Force Vue to re-render the component
  await nextTick()
}

/**
 * If user has insufficient funds, let them top up
 */
function goToDepositPage() {
  router.push('/wallet/deposit')
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'info'
    case 'failed':
      return 'error'
    case 'cancelled':
      return 'warning'
    default:
      return 'primary'
  }
}

/**
 * Reset validation error
 */
function clearValidationError() {
  validationError.value = null
}
</script>

<style scoped>
.video-uploader-container {
  width: 100%;
}
.upload-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.tab-content {
  display: flex;
  align-items: center;
}
.upload-panel {
  padding: 1rem;
  position: relative;
}
.upload-zone {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}
.upload-zone--dragover {
  border-color: var(--v-primary-base);
  background: rgba(var(--v-primary-base), 0.05);
}
.hidden-input {
  display: none;
}
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.upload-icon {
  font-size: 48px;
}
.upload-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
.upload-description {
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 1rem;
}
.upload-initial-state {
  /* drop zone container styles */
}
.upload-progress-state {
  position: relative;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}
.cancel-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
.progress-content {
  margin-top: 1rem;
}
.compact-file-info {
  margin-bottom: 1rem;
}
.file-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}
.file-name {
  font-weight: 500;
}
.file-meta {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}
.progress-section {
  margin-top: 0.5rem;
}
.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}
.upload-details {
  display: flex;
  gap: 1rem;
}
.status-section {
  display: flex;
  align-items: center;
}
</style>
