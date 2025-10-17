<template>
  <ProfilePhoto
    ref="profilePhotoRef"
    :photoUrl="page.avatar_url"
    defaultPhotoUrl="/images/page/default.png"
    :size="size"
    :canEdit="isPageCreator"
    :alt="page.name || 'Page Photo'"
    dialogTitle="Edit Page Photo"
    variant="text"
    color="transparent"
    avatarClass="page-avatar"
    containerClass="page-photo-container"
    @upload-photo="handlePhotoUpload"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { usePageCreator } from '~/composables/usePageCreator'
import { useImageCompression } from '~/composables/useImageCompression'

// Define the minimal Page interface
interface Page {
  slug: string
  avatar_url: string | null
  name: string
  creator: {
    id: number
  }
}

const props = defineProps<{
  page: Page
  size?: number | string
}>()

const emit = defineEmits<{
  (e: 'photo-updated', newUrl: string): void
}>()

// Use the usePageCreator composable
const { isPageCreator } = usePageCreator(props.page)
const { $axios } = useNuxtApp()
const { compressImage } = useImageCompression()

// Template ref for the ProfilePhoto component
const profilePhotoRef = ref(null)

// Handle photo upload from the ProfilePhoto component
const handlePhotoUpload = async ({ blob: initialBlob, onSuccess, onError }) => {
  try {
    // Compress the image
    const compressionOptions = {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      compressionThreshold: 2 * 1024 * 1024, // 2MB
      targetFileSize: 1.5 * 1024 * 1024, // 1.5MB
      maxDimension: 1920,
      minQuality: 0.5,
      startQuality: 0.9,
    }

    const { compressed: finalBlob } = await compressImage(
      initialBlob,
      compressionOptions
    )

    // Get a presigned URL for the page photo upload
    const { data: presignedData } = await $axios.get(
      `/api/pages/${props.page.slug}/photo-upload-url`,
      { params: { extension: 'jpg' } }
    )

    // Upload the compressed image to S3
    const uploadResponse = await fetch(presignedData.url, {
      method: 'PUT',
      body: finalBlob,
      headers: { 'Content-Type': 'image/jpeg' },
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to S3')
    }

    // Confirm the upload on the server
    const { data } = await $axios.post(
      `/api/pages/${props.page.slug}/confirm-photo-upload`,
      { photo_key: presignedData.key }
    )

    // Update the page object's avatar
    props.page.avatar_url = data.avatar_url

    // Emit the updated photo URL
    emit('photo-updated', data.avatar_url)

    // Notify the ProfilePhoto component of success
    if (onSuccess) {
      onSuccess(data.avatar_url)
    }
  } catch (error) {
    console.error('Error uploading page photo:', error)

    // Notify the ProfilePhoto component of error
    if (onError) {
      onError(error)
    }

    // Show error message to user
    alert('Failed to upload page photo. Please try again.')
  }
}
</script>

<style scoped lang="scss">
:deep(.page-avatar) {
  border: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
}

:deep(.page-photo-container) {
  .camera-button-wrapper {
    opacity: 1; /* Always visible */
  }
}
</style>
