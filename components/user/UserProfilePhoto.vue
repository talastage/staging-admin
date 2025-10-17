<template>
  <ProfilePhoto
    :photoUrl="user.profile_photo"
    defaultPhotoUrl="/images/profile/default.png"
    :size="size"
    :canEdit="isProfileOwner"
    :alt="`${user?.username || 'User'}'s profile photo`"
    dialogTitle="Edit Profile Photo"
    avatarClass="profile-avatar"
    containerClass="user-profile-photo"
    @upload-photo="handlePhotoUpload"
  />
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'
import { useAuthStore } from '@/stores/auth'
import { useProfileOwnership } from '~/composables/useProfileOwnership'
import { useVaporUpload } from '~/composables/useVaporUpload'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 100,
  },
})

const emit = defineEmits(['photo-updated'])
const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const { uploadFile } = useVaporUpload()

// Reusable upload function
const uploadPhoto = async (blob: Blob, onProgress?: (progress: number) => void) => {
  return await uploadFile(
    blob,
    '/api/profile/photo-upload-url',
    '/api/profile/confirm-photo-upload',
    { onProgress }
  )
}

// Profile ownership check
const { isProfileOwner } = useProfileOwnership(props.user?.username)

// Handle photo upload from the ProfilePhoto component
const handlePhotoUpload = async ({ blob, onSuccess, onError, onProgress }) => {
  try {
    const result = await uploadPhoto(blob, onProgress)
    
    // Update the global auth store
    authStore.updateUser(result.user)

    // Notify the ProfilePhoto component of success
    if (onSuccess) {
      onSuccess(result.user.profile_photo)
    }

    emit('photo-updated')
  } catch (error: any) {
    console.error('Error uploading image:', error)

    // Notify the ProfilePhoto component of error
    if (onError) {
      onError(error)
    }

    // Show more specific error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image. Please try again.'
    alert(errorMessage)
  }
}
</script>

<style lang="scss" scoped>
:deep(.user-profile-photo) {
  position: relative;
  display: inline-block;
  border-radius: 50%;

  .profile-avatar {
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .camera-button-wrapper {
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(25%, 25%);
    opacity: 0.9;
    z-index: 2;

    .v-btn {
      min-width: 32px !important;
      width: 32px !important;
      height: 32px !important;
      padding: 0 !important;
      border-radius: 50% !important;
      background-color: #ffffff !important;
      border: 2px solid #e0e0e0 !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;

      .v-icon {
        color: #666666 !important;
        font-size: 16px !important;
      }

      &:hover {
        background-color: #f5f5f5 !important;
        border-color: #bdbdbd !important;

        .v-icon {
          color: #333333 !important;
        }
      }
    }
  }

  &:hover .camera-button-wrapper {
    opacity: 1;
  }
}

// Ensure proper positioning for different sizes
:deep(.user-profile-photo) {
  &[data-size='120'] .camera-button-wrapper {
    transform: translate(20%, 20%);
  }

  &[data-size='96'] .camera-button-wrapper {
    transform: translate(15%, 15%);
  }

  &[data-size='80'] .camera-button-wrapper {
    transform: translate(10%, 10%);
  }

  &[data-size='60'] .camera-button-wrapper {
    transform: translate(5%, 5%);
  }
}
</style>
