<template>
  <div class="media-thumbnail">
    <h3 class="text-h6 mb-4">Media Thumbnail</h3>
    <div class="thumbnail-uploader">
      <div
        class="thumbnail-container"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
      >
        <v-img
          v-if="displayThumbnailUrl"
          :src="displayThumbnailUrl"
          :aspect-ratio="16 / 9"
          cover
          class="thumbnail-preview"
          @error="handleImageError"
        >
          <template #placeholder>
            <v-fade-transition>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary" />
              </div>
            </v-fade-transition>
          </template>
        </v-img>
        <div
          v-else
          class="empty-thumbnail"
          :class="{ 'drag-active': isDragging }"
        >
          <v-icon icon="mdi-image-outline" size="48" color="grey-lighten-1" />
          <span class="text-grey-lighten-1 text-body-2">
            Drag & drop or click to upload
          </span>
        </div>

        <v-fade-transition>
          <div v-if="loading || isUploading" class="upload-overlay">
            <v-progress-circular indeterminate color="primary" size="64" />
            <span class="mt-3 text-body-2 text-white">{{ uploadStatus }}</span>
            <v-progress-linear
              v-if="compressionProgress > 0 && compressionProgress < 100"
              :model-value="compressionProgress"
              class="mt-2 upload-progress"
              color="primary"
              rounded
            />
          </div>
        </v-fade-transition>

        <div
          :class="['action-button', { 'has-thumbnail': displayThumbnailUrl }]"
        >
          <v-btn
            :color="displayThumbnailUrl ? 'white' : 'primary'"
            :variant="displayThumbnailUrl ? 'flat' : 'elevated'"
            :prepend-icon="displayThumbnailUrl ? 'mdi-refresh' : 'mdi-upload'"
            :disabled="loading || isUploading"
            class="upload-btn"
            elevation="3"
            @click="selectFile"
          >
            {{ displayThumbnailUrl ? 'Replace' : 'Upload Thumbnail' }}
          </v-btn>
        </div>
      </div>

      <div class="text-caption text-grey mt-2">
        Recommended: 1280x720px or larger, 16:9 ratio, JPEG/PNG format
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        style="display: none"
        @change="onFileChange"
      />

      <v-dialog
        v-model="dialog"
        max-width="800px"
        persistent
        @keydown.esc="closeDialog"
      >
        <v-card class="thumbnail-editor-dialog">
          <v-toolbar density="compact" color="primary">
            <v-toolbar-title class="text-white">Edit Thumbnail</v-toolbar-title>
            <v-spacer />
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              :disabled="loading || isUploading"
              @click="closeDialog"
            />
          </v-toolbar>

          <v-card-text class="pa-4">
            <v-fade-transition>
              <div v-if="image" class="cropper-container">
                <vue-cropper
                  ref="cropper"
                  :src="image"
                  :aspect-ratio="16 / 9"
                  :view-mode="2"
                  :background="true"
                  :auto-crop-area="1"
                  :responsive="true"
                  :img-style="{ width: '100%', height: '100%' }"
                  style="height: min(450px, 70vh); width: 100%"
                  :guides="true"
                />
              </div>
              <div v-else class="d-flex justify-center align-center pa-8">
                <v-progress-circular indeterminate />
              </div>
            </v-fade-transition>
            <div class="thumbnail-info mt-4">
              <v-icon
                icon="mdi-information-outline"
                size="small"
                color="grey"
                class="mr-1"
              />
              <span class="text-caption text-grey">
                Drag the image or move the crop area to adjust your thumbnail.
                The thumbnail will be displayed in 16:9 ratio across the
                platform.
              </span>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              color="grey"
              variant="text"
              :disabled="loading || isUploading"
              @click="closeDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :loading="loading || isUploading"
              :disabled="!image || loading || isUploading"
              @click="applyCrop"
            >
              {{ loading || isUploading ? uploadStatus : 'Save Changes' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import VueCropper from 'vue-cropperjs'
import { useImageCompression } from '@/composables/useImageCompression'
import 'cropperjs/dist/cropper.css'

const props = defineProps({
  thumbnailUrl: {
    type: String,
    default: null,
  },
  isUploading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:thumbnail',
  'upload:start',
  'upload:complete',
])

const { compressImage } = useImageCompression()

// State variables
const image = ref(null)
const dialog = ref(false)
const loading = ref(false)
const uploadStatus = ref('')
const fileInput = ref(null)
const cropper = ref(null)
const isDragging = ref(false)
const processingThumbnail = ref(null)
const compressionProgress = ref(0)

// Computed property to handle the display thumbnail
// This prevents the UI from showing empty state during upload
const displayThumbnailUrl = computed(() => {
  // If we have a processing thumbnail (blob URL), show that during upload
  if (processingThumbnail.value) {
    return processingThumbnail.value
  }
  // Otherwise show the prop thumbnail
  return props.thumbnailUrl
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

watch(loading, (newValue, oldValue) => {
  if (oldValue && !newValue && !uploadStatus.value) {
    closeDialog()
  }
})

// Reset processing thumbnail when upload completes
watch(
  () => props.isUploading,
  (newValue) => {
    if (!newValue) {
      // Upload complete, clear the processing thumbnail after a delay
      // to ensure smooth transition
      setTimeout(() => {
        if (processingThumbnail.value) {
          URL.revokeObjectURL(processingThumbnail.value)
          processingThumbnail.value = null
        }
        compressionProgress.value = 0
      }, 500)
    }
  }
)

function handleImageError() {
  console.error('Failed to load thumbnail')
}

function selectFile() {
  if (!loading.value && !props.isUploading) fileInput.value?.click()
}

function closeDialog() {
  if (loading.value || props.isUploading) return
  dialog.value = false
  image.value = null
  uploadStatus.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function handleDrop(event) {
  const file = event.dataTransfer?.files[0]
  isDragging.value = false
  if (file) await processFile(file)
}

async function processFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    alert('Please select a valid image file (JPEG or PNG)')
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    alert('File size should not exceed 5MB')
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      image.value = e.target.result
      dialog.value = true
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error processing file:', error)
    alert('Error processing image. Please try again.')
  }
}

async function onFileChange(event) {
  const file = event.target?.files?.[0]
  if (file) await processFile(file)
}

async function applyCrop() {
  if (!cropper.value || loading.value || props.isUploading) return
  loading.value = true
  uploadStatus.value = 'Preparing image...'
  emit('upload:start')

  try {
    // Get cropped canvas
    const croppedCanvas = cropper.value.getCroppedCanvas({
      width: 1280,
      height: 720,
      fillColor: '#fff',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })

    uploadStatus.value = 'Compressing image...'
    const initialBlob = await new Promise((resolve) =>
      croppedCanvas.toBlob(resolve, 'image/jpeg', 0.9)
    )

    // Create a temporary thumbnail display while processing
    processingThumbnail.value = URL.createObjectURL(initialBlob)

    // Compress the image with enhanced options
    const { compressed: finalBlob } = await compressImage(initialBlob, {
      maxFileSize: MAX_FILE_SIZE,
      compressionThreshold: 2 * 1024 * 1024,
      targetFileSize: 1.5 * 1024 * 1024,
      maxDimension: 1920,
      progressCallback: (progress) => {
        compressionProgress.value = Math.min(90, progress)
      },
    })

    compressionProgress.value = 100
    uploadStatus.value = 'Uploading image...'
    
    // Emit the processed blob for upload
    emit('update:thumbnail', finalBlob)

    // Close dialog after upload completes
    setTimeout(() => {
      dialog.value = false
    }, 500)
  } catch (error) {
    console.error('Error processing thumbnail:', error)
    alert('Failed to process thumbnail. Please try again.')
    emit('upload:complete', false)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.media-thumbnail {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  padding: 20px;
}

.thumbnail-uploader {
  max-width: 1280px;
  margin: 0 auto;
}

.thumbnail-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  border: 2px dashed #e0e0e0;
  transition: all 0.3s ease;
}

.thumbnail-container:hover {
  border-color: var(--v-primary-base);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.thumbnail-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.empty-thumbnail.drag-active {
  background-color: rgba(var(--v-primary-base), 0.05);
  border-color: var(--v-primary-base);
}

.action-button {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 1;
  transition: all 0.3s ease;
}

.action-button.has-thumbnail {
  opacity: 0;
}

.thumbnail-container:hover .action-button {
  opacity: 1;
}

.upload-btn {
  min-width: 160px;
  border-radius: 30px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  transition: all 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 2;
}

.upload-progress {
  width: 90%;
  max-width: 300px;
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.cropper-container {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail-editor-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.thumbnail-info {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

:deep(.cropper-view-box) {
  outline: none;
  border-radius: 0;
}

:deep(.cropper-face) {
  background-color: transparent;
}

:deep(.cropper-line, .cropper-point) {
  background-color: #fff;
}

@media (max-width: 600px) {
  .media-thumbnail {
    padding: 16px;
  }

  .action-button {
    opacity: 1 !important;
    bottom: 16px;
  }

  .upload-btn {
    min-width: 120px;
    font-size: 14px;
  }
}
</style>
