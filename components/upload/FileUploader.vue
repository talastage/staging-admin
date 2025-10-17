<template>
  <div class="file-uploader">
    <v-card class="mb-4" variant="outlined">
      <v-card-title class="text-h5 font-weight-bold">
        {{ label }}
      </v-card-title>
      <v-card-text>
        <div
          class="drop-zone"
          @dragover.prevent="dragover = true"
          @dragleave.prevent="dragover = false"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': dragover }"
        >
          <input
            type="file"
            :accept="accept"
            ref="fileInput"
            class="file-input"
            @change="handleFileChange"
          />
          <div class="upload-prompt" @click="$refs.fileInput.click()">
            <v-icon size="64" color="primary">mdi-cloud-upload-outline</v-icon>
            <p class="text-h6 mt-2">Click or drag file to upload</p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Selected File Info -->
    <div v-if="selectedFile" class="file-info">
      <v-icon color="primary" size="24">mdi-file-video-outline</v-icon>
      <span class="filename">{{ selectedFile.name }}</span>
      <span class="filesize">{{ formatFileSize(selectedFile.size) }}</span>
      <v-btn
        v-if="isUploading"
        color="error"
        variant="text"
        @click="cancelUpload"
        class="cancel-btn"
      >
        Cancel
      </v-btn>
    </div>

    <!-- Progress Bar + Status -->
    <v-progress-linear
      v-if="isUploading || isS3UploadComplete"
      :model-value="uploadProgress"
      :color="uploadProgressColor"
      height="10"
      rounded
    >
      <template v-slot:default="{ value }">
        <strong>{{ statusText }}</strong>
      </template>
    </v-progress-linear>

    <div
      v-if="isUploading || isS3UploadComplete"
      class="d-flex justify-space-between mt-2"
    >
      <!-- If user wants to see numeric progress, show it while uploading. -->
      <span :class="{ 'text-success': isS3UploadComplete }">
        {{ subStatusText }}
      </span>
      <span v-if="isUploading">{{ estimatedTimeLeft }}</span>
    </div>

    <!-- Processing Status (after S3 upload) -->
    <div v-if="processingStatus.text" class="mt-4">
      <v-alert
        variant="tonal"
        density="compact"
        :color="processingStatus.color"
        :icon="processingStatus.icon"
      >
        {{ processingStatus.text }}
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from 'vue-toastification'
import { useProjectUploadStore } from '~/stores/useProjectUploadStoreREMOVE'

interface Props {
  label?: string
  accept?: string
  projectAccessUuid: string
  fileType: 'main' | 'trailer'
  maxFileSize?: number
  maxDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Upload your video',
  accept: 'video/*',
  maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
  maxDuration: 15 * 60, // 15 minutes
})

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
  (e: 'upload-progress', progress: number): void
  (e: 'upload-error', message: string): void
  (e: 'upload-cancelled'): void
  // Once raw S3 upload is done (not entire pipeline):
  (
    e: 'upload-s3-complete',
    payload: { fileUrl: string; fileType: 'main' | 'trailer' }
  ): void
}>()

const { $axios } = useNuxtApp()
const toast = useToast()
const projectUploadStore = useProjectUploadStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadedSize = ref(0)
const totalSize = ref(0)
const uploadStartTime = ref(0)
const abortController = ref<AbortController | null>(null)
const dragover = ref(false)

// Determine if S3 upload is still in progress
const isUploading = computed(() => {
  return props.fileType === 'main'
    ? projectUploadStore.mainVideoUploading
    : projectUploadStore.trailerVideoUploading
})

// S3 upload finished but not necessarily MediaConvert
const isS3UploadComplete = computed(() => {
  return props.fileType === 'main'
    ? projectUploadStore.mainVideoS3UploadComplete
    : projectUploadStore.trailerVideoS3UploadComplete
})

// The numeric progress for S3 uploads
const uploadProgress = computed(() => {
  return props.fileType === 'main'
    ? projectUploadStore.mainVideoProgress
    : projectUploadStore.trailerVideoProgress
})

// Status text displayed on the progress bar
const statusText = computed(() => {
  if (isUploading.value) {
    return `Uploading... ${uploadProgress.value}%`
  }
  if (isS3UploadComplete.value) {
    return 'S3 Upload Complete'
  }
  return ''
})

// Secondary text under the progress bar
const subStatusText = computed(() => {
  if (isUploading.value) {
    return `Uploading ${formatFileSize(uploadedSize.value)} / ${formatFileSize(
      totalSize.value
    )}`
  }
  if (isS3UploadComplete.value) {
    return '(Processing in progress...)'
  }
  return ''
})

// If you want a dynamic color change:
const uploadProgressColor = computed(() => {
  // While uploading, color is 'primary'. After S3 done, color is 'success'.
  // Or you can do more states if desired (like 'processing' color).
  if (isS3UploadComplete.value) return 'success'
  return 'primary'
})

// Estimated time left for S3 upload
const estimatedTimeLeft = computed(() => {
  if (uploadProgress.value === 0) return 'Calculating...'
  const elapsedTime = (Date.now() - uploadStartTime.value) / 1000
  const totalTime = elapsedTime / (uploadProgress.value / 100)
  const remainingTime = totalTime - elapsedTime
  return formatTime(remainingTime)
})

// Show separate "processing" statuses from store
const processingStatus = computed(() => {
  const status =
    props.fileType === 'main'
      ? projectUploadStore.mainProcessingStatus
      : projectUploadStore.trailerProcessingStatus

  switch (status) {
    case 'processing':
      return {
        text: 'Video is being processed...',
        color: 'info',
        icon: 'mdi-cog-sync',
      }
    case 'completed':
      return {
        text: 'Video processing completed',
        color: 'success',
        icon: 'mdi-check-circle',
      }
    case 'failed':
      return {
        text: 'Video processing failed',
        color: 'error',
        icon: 'mdi-alert-circle',
      }
    default:
      return {
        text: '',
        color: 'primary',
        icon: '',
      }
  }
})

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && validateFile(file)) {
    handleFile(file)
  }
}

function handleDrop(e: DragEvent) {
  dragover.value = false
  const file = e.dataTransfer?.files[0]
  if (file && validateFile(file)) {
    handleFile(file)
  }
}

function validateFile(file: File): boolean {
  if (!file.type.startsWith('video/')) {
    toast.error('Please upload a video file.')
    return false
  }
  if (file.size > props.maxFileSize) {
    toast.error(
      `File size exceeds the maximum limit of ${formatFileSize(
        props.maxFileSize
      )}.`
    )
    return false
  }
  // If you want to do duration check, you'd need to parse metadata, etc.
  return true
}

function handleFile(file: File) {
  selectedFile.value = file
  emit('file-selected', file)
  if (props.projectAccessUuid) {
    startUpload()
  }
}

async function startUpload() {
  if (!selectedFile.value || !props.projectAccessUuid) return

  try {
    if (props.fileType === 'main') {
      projectUploadStore.setMainVideoUploading(true)
      projectUploadStore.setMainVideoProgress(0)
      projectUploadStore.setMainVideoS3UploadComplete(false)
    } else {
      projectUploadStore.setTrailerVideoUploading(true)
      projectUploadStore.setTrailerVideoProgress(0)
      projectUploadStore.setTrailerVideoS3UploadComplete(false)
    }
    uploadStartTime.value = Date.now()
    uploadedSize.value = 0
    totalSize.value = selectedFile.value.size

    // Subscribe to final pipeline updates (pusher channel) if not already
    projectUploadStore.subscribeToProcessingUpdates()

    // Request presigned URL
    const { data: presignedData } = await $axios.post(
      `/api/studio/projects/${props.projectAccessUuid}/presigned-url`,
      {
        fileName: selectedFile.value.name,
        fileType: props.fileType,
        contentType: selectedFile.value.type,
        fileSize: selectedFile.value.size,
      }
    )

    // Upload to S3 via presigned URL
    const uploadResponse = await uploadToS3(presignedData.presignedUrl)
    if (uploadResponse.status !== 200) {
      throw new Error(`Upload failed: ${uploadResponse.status}`)
    }

    // Confirm with backend so it starts MediaConvert
    const { data: confirmationData } = await $axios.post(
      `/api/studio/projects/${props.projectAccessUuid}/confirm-upload`,
      {
        s3Key: presignedData.s3Key,
        fileType: props.fileType,
        fileName: selectedFile.value.name,
        fileSize: selectedFile.value.size,
        contentType: selectedFile.value.type,
      }
    )

    handleS3UploadSuccess(confirmationData.fileUrl)
  } catch (error) {
    handleUploadError(error)
  }
}

function uploadToS3(presignedUrl: string): Promise<XMLHttpRequest> {
  return new Promise((resolve, reject) => {
    if (!selectedFile.value) {
      reject(new Error('No file selected'))
      return
    }
    const xhr = new XMLHttpRequest()
    abortController.value = new AbortController()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        updateProgress(progress, event.loaded)
      }
    })

    xhr.onload = () => resolve(xhr)
    xhr.onerror = () => reject(new Error('Upload failed'))

    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', selectedFile.value.type)
    xhr.send(selectedFile.value)
  })
}

function updateProgress(progress: number, loaded: number) {
  if (props.fileType === 'main') {
    projectUploadStore.setMainVideoProgress(progress)
  } else {
    projectUploadStore.setTrailerVideoProgress(progress)
  }
  uploadedSize.value = loaded
  emit('upload-progress', progress)
}

function handleS3UploadSuccess(fileUrl: string) {
  // Mark the store that S3 is finished; pipeline is not 100% complete yet.
  if (props.fileType === 'main') {
    projectUploadStore.setMainVideoS3UploadComplete(true)
    projectUploadStore.setMainVideoProgress(100)
    projectUploadStore.setMainVideoUploading(false)
  } else {
    projectUploadStore.setTrailerVideoS3UploadComplete(true)
    projectUploadStore.setTrailerVideoProgress(100)
    projectUploadStore.setTrailerVideoUploading(false)
  }

  emit('upload-s3-complete', { fileUrl, fileType: props.fileType })
}

function handleUploadError(error: unknown) {
  console.error('Upload error:', error)
  const errorMessage =
    error instanceof Error ? error.message : 'Failed to upload file'
  emit('upload-error', errorMessage)
  toast.error(errorMessage)
  resetUploadState()
}

function cancelUpload() {
  if (abortController.value) {
    abortController.value.abort()
    resetUploadState()
    emit('upload-cancelled')
    toast.info('Upload cancelled')
  }
}

function resetUploadState() {
  if (props.fileType === 'main') {
    projectUploadStore.setMainVideoUploading(false)
    projectUploadStore.setMainVideoS3UploadComplete(false)
    projectUploadStore.setMainVideoProgress(0)
  } else {
    projectUploadStore.setTrailerVideoUploading(false)
    projectUploadStore.setTrailerVideoS3UploadComplete(false)
    projectUploadStore.setTrailerVideoProgress(0)
  }
  selectedFile.value = null
  uploadedSize.value = 0
  totalSize.value = 0
  uploadStartTime.value = 0
  abortController.value = null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatTime(seconds: number): string {
  if (seconds < 0) return 'Almost done...'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s left`
}

// If the user changes projectAccessUuid after selecting file, re-start upload if needed
watch(
  () => props.projectAccessUuid,
  (newVal) => {
    if (newVal && selectedFile.value && !isUploading.value) {
      startUpload()
    }
  }
)

// Cleanup on unmount
onUnmounted(() => {
  projectUploadStore.unsubscribeFromProcessingUpdates()
  if (abortController.value) {
    abortController.value.abort()
  }
  resetUploadState()
})
</script>

<style scoped>
.file-uploader {
  margin-bottom: 20px;
}

.drop-zone {
  border: 2px dashed var(--v-primary-base);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.drag-over {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: var(--v-primary-darken1);
}

.file-input {
  display: none;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
  margin: 16px 0;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface), 0.08);
}

.filename {
  margin: 0 10px;
  font-weight: 500;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filesize {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-right: 16px;
  font-size: 0.875rem;
}

.cancel-btn {
  margin-left: auto;
}

.processing-alert {
  margin-top: 16px;
}
</style>
