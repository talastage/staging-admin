<template>
  <div class="profile-photo-container" :class="containerClass">
    <v-avatar
      :size="size"
      :variant="variant"
      :color="color"
      :class="avatarClass"
    >
      <v-img
        :src="currentPhotoUrl"
        :alt="alt"
        cover
        @error="handleImageError"
      />
    </v-avatar>

    <!-- Camera Icon Button -->
    <div v-if="canEdit" class="camera-button-wrapper">
      <v-btn
        icon
        density="comfortable"
        variant="flat"
        class="camera-button"
        @click="selectFile"
      >
        <v-icon size="16">mdi-camera</v-icon>
      </v-btn>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileChange"
    />

    <!-- Cropper Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <div v-if="image && !uploading">
            <vue-cropper
              ref="cropper"
              :src="image"
              :aspect-ratio="1"
              :view-mode="1"
              style="height: 400px; width: 100%"
              :stencil-props="stencilProps"
            />
          </div>
          <div v-else-if="uploading" class="upload-progress-container">
            <div class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              />
              <h3 class="mb-2">Uploading Photo...</h3>
              <p class="text-medium-emphasis">
                Please wait while your photo is being uploaded and processed.
              </p>
            </div>
          </div>
          <div v-else>
            <p>Loading image...</p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="secondary"
            text
            @click="closeDialog"
            :disabled="uploading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            @click="applyCrop"
            :disabled="uploading"
          >
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps({
  // Common props
  photoUrl: {
    type: String,
    default: '',
  },
  defaultPhotoUrl: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 100,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  alt: {
    type: String,
    default: 'Profile Photo',
  },
  dialogTitle: {
    type: String,
    default: 'Edit Photo',
  },
  // Style props
  variant: {
    type: String,
    default: 'flat',
  },
  color: {
    type: String,
    default: 'transparent',
  },
  avatarClass: {
    type: String,
    default: '',
  },
  containerClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'upload-photo',
  'photo-updated',
  'upload-success',
  'upload-error',
])

// State
const image = ref(null)
const dialog = ref(false)
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const cropper = ref(null)
const currentPhotoUrl = ref(props.photoUrl || props.defaultPhotoUrl)
const { $axios } = useNuxtApp()

// Cropper settings
const stencilProps = { circular: true }

// Watch for changes to the photo URL
watch(
  () => props.photoUrl,
  (newValue) => {
    currentPhotoUrl.value = newValue || props.defaultPhotoUrl
  }
)

// Handle image error by setting the default
const handleImageError = () => {
  currentPhotoUrl.value = props.defaultPhotoUrl
}

// Trigger file selection
const selectFile = () => {
  fileInput.value.click()
}

// Handle file change
const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      image.value = e.target.result
      dialog.value = true
    }
    reader.readAsDataURL(file)
  }
}

// Close dialog
const closeDialog = () => {
  if (uploading.value) return // Prevent closing during upload

  dialog.value = false
  image.value = null
  uploading.value = false
  loading.value = false
  if (fileInput.value) fileInput.value.value = ''
}

// Method to handle upload success (called from parent)
const handleUploadSuccess = (newPhotoUrl) => {
  uploading.value = false
  currentPhotoUrl.value = newPhotoUrl
  closeDialog()
  emit('upload-success', newPhotoUrl)
}

// Method to handle upload error (called from parent)
const handleUploadError = (error) => {
  uploading.value = false
  loading.value = false
  emit('upload-error', error)
  // Don't close dialog on error, let user try again
}

// Crop and upload
const applyCrop = async () => {
  if (!cropper.value) return

  loading.value = true
  try {
    const croppedCanvas = cropper.value.getCroppedCanvas({
      width: 300,
      height: 300,
    })

    const blob = await new Promise((resolve) =>
      croppedCanvas.toBlob(resolve, 'image/jpeg', 0.8)
    )

    // Set uploading state
    uploading.value = true
    loading.value = false

    // Let parent component handle the upload
    emit('upload-photo', {
      blob,
      croppedCanvas,
      onSuccess: handleUploadSuccess,
      onError: handleUploadError,
    })
  } catch (error) {
    console.error('Error processing image:', error)
    alert('Failed to process image. Please try again.')
    loading.value = false
  }
}

// Expose methods for parent component to call
defineExpose({
  handleUploadSuccess,
  handleUploadError,
})
</script>

<style lang="scss" scoped>
.profile-photo-container {
  position: relative;
  display: inline-block;

  &:hover {
    .camera-button-wrapper {
      opacity: 1;
    }
  }
}

.camera-button-wrapper {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background-color: white;
  border-radius: 50%;
  padding: 1px;
  opacity: 0.9;
  transition: opacity 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.camera-button {
  background-color: #e4e6eb !important;
  border: 2px solid white;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px !important;

  &:hover {
    background-color: #ddd !important;
  }

  .v-icon {
    color: #050505;
  }
}

.upload-progress-container {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

// Make sure avatar maintains aspect ratio
:deep(.v-avatar) {
  width: v-bind(size + 'px');
  height: v-bind(size + 'px');
  overflow: hidden;
}
</style>
