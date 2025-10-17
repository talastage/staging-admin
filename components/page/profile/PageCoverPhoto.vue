<template>
  <div class="page-cover-container">
    <!-- Cover Image -->
    <v-img
      :src="currentCoverUrl"
      height="300"
      cover
      class="cover-image"
      @error="handleImageError"
    >
      <template #placeholder>
        <v-skeleton-loader type="image" height="300" />
      </template>
    </v-img>

    <!-- Edit Cover Button (visible only to page creator) -->
    <div v-if="isPageCreator" class="edit-cover-button">
      <v-btn
        color="white"
        variant="text"
        class="edit-cover-btn"
        prepend-icon="mdi-camera"
        @click="selectFile"
      >
        Edit Cover Photo
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
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>Edit Cover Photo</v-card-title>
        <v-card-text>
          <div v-if="image">
            <vue-cropper
              ref="cropper"
              :src="image"
              :aspect-ratio="16 / 9"
              :view-mode="1"
              style="height: 400px; width: 100%"
            />
          </div>
          <div v-else>
            <p>Loading image...</p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="secondary" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="loading" @click="applyCrop">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineProps, defineEmits } from 'vue'
import { useNuxtApp } from '#app'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import { usePageCreator } from '~/composables/usePageCreator'
import { useImageCompression } from '~/composables/useImageCompression'

// Define minimal Page interface needed for cover photo.
interface Page {
  slug: string
  cover_url: string | null
  name: string
  creator: {
    id: number
  }
}

// Component props.
const props = defineProps<{
  page: Page
}>()

// Emit event when cover photo is updated.
const emit = defineEmits<{
  (e: 'cover-updated', newUrl: string): void
}>()

// Use the composable to determine if current user is page creator.
const { isPageCreator } = usePageCreator(props.page)

const { $axios } = useNuxtApp()

// State variables.
const dialog = ref<boolean>(false)
const image = ref<string | null>(null)
const loading = ref<boolean>(false)
const fileInput = ref<HTMLInputElement | null>(null)
const cropper = ref<any>(null)
const currentCoverUrl = ref<string>(
  props.page.cover_url || '/images/page/default-cover.jpg'
)

// Watch for changes in cover_url prop.
watch(
  () => props.page.cover_url,
  (newVal) => {
    currentCoverUrl.value = newVal || '/images/page/default-cover.jpg'
  }
)

// Handle cover image load error.
const handleImageError = (): void => {
  currentCoverUrl.value = '/images/page/default-cover.jpg'
}

// Trigger file selection.
const selectFile = (): void => {
  fileInput.value?.click()
}

// Handle file change: load the file into FileReader and open cropper.
const onFileChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const file = input?.files ? input.files[0] : null
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      image.value = e.target?.result as string
      dialog.value = true
    }
    reader.readAsDataURL(file)
  }
}

// Close the cropper dialog and reset input.
const closeDialog = (): void => {
  dialog.value = false
  image.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// Compression options for cover image.
const compressionOptions = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  compressionThreshold: 2 * 1024 * 1024, // 2MB
  targetFileSize: 1.5 * 1024 * 1024, // 1.5MB
  maxDimension: 1920,
  minQuality: 0.5,
  startQuality: 0.9,
}

// Use image compression composable.
const { compressImage } = useImageCompression()

// Crop, compress, and upload cover image.
const applyCrop = async (): Promise<void> => {
  if (!cropper.value) return
  loading.value = true
  try {
    // Get cropped canvas with a 16:9 ratio.
    const croppedCanvas = cropper.value.getCroppedCanvas({
      width: 1600,
      height: 900,
    })
    const initialBlob: Blob | null = await new Promise((resolve) =>
      croppedCanvas.toBlob(resolve, 'image/jpeg', 0.9)
    )
    if (!initialBlob) throw new Error('Failed to create blob from canvas.')

    // Compress the blob.
    const { compressed: finalBlob } = await compressImage(
      initialBlob,
      compressionOptions
    )

    // Get a presigned URL for cover upload.
    const { data: presignedData } = await $axios.get(
      `/api/pages/${props.page.slug}/cover-upload-url`,
      { params: { extension: 'jpg' } }
    )

    // Upload the compressed image to S3.
    const uploadResponse = await fetch(presignedData.url, {
      method: 'PUT',
      body: finalBlob,
      headers: { 'Content-Type': 'image/jpeg' },
    })
    if (!uploadResponse.ok) throw new Error('Failed to upload image to S3.')

    // Confirm the upload on the server.
    const { data } = await $axios.post(
      `/api/pages/${props.page.slug}/confirm-cover-upload`,
      { photo_key: presignedData.key }
    )

    // Update the local cover URL and the page object's cover.
    currentCoverUrl.value = data.cover_url
    props.page.cover_url = data.cover_url
    emit('cover-updated', data.cover_url)
  } catch (error: any) {
    console.error('Error uploading cover photo:', error)
    alert('Failed to upload cover photo. Please try again.')
  } finally {
    loading.value = false
    closeDialog()
  }
}
</script>

<style scoped lang="scss">
.page-cover-container {
  position: relative;
  width: 100%;
}

.cover-image {
  border-radius: 0;
  pointer-events: none;
}

.edit-cover-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 999;
}

.edit-cover-btn {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
