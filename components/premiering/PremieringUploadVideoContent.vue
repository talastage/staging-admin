<!-- PremieringUploadVideoContent.vue -->
<template>
  <v-card flat class="modern-dialog mb-6">
    <v-card-text class="pa-6">
      <div class="file-uploaders">
        <!-- Main Video Uploader -->
        <VideoUploader
          label="Upload your main project video"
          accept="video/mp4"
          fileType="main"
          :isUploading="store.mainVideo.isUploading"
          :uploadProgress="store.mainVideo.uploadProgress"
          :isComplete="store.mainVideo.isUploadComplete"
          :disabled="false"
          @file-selected="onFileSelected"
          class="mb-4"
        />

        <!-- Trailer Video Uploader -->
        <VideoUploader
          label="Upload a trailer for your project"
          accept="video/mp4"
          fileType="trailer"
          :isUploading="store.trailerVideo.isUploading"
          :uploadProgress="store.trailerVideo.uploadProgress"
          :isComplete="store.trailerVideo.isUploadComplete"
          :disabled="!store.mainVideo.isUploadComplete"
          @file-selected="onFileSelected"
          class="mb-4"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useNuxtApp } from '#app'
import { usePremiereUpload } from '@/composables/upload/usePremiereUpload'
import { useProjectPremieringStore } from '@/stores/premiering/useProjectPremieringStore'

// Single store handling project + main/trailer states
const store = useProjectPremieringStore()

const { $axios } = useNuxtApp()
const toast = useToast()

// A quick ref to the current project
const project = computed(() => store.project)

async function getPresignedUrlAndUpload(
  file: File,
  fileType: 'main' | 'trailer'
) {
  try {
    // If project doesn't exist, create it
    if (!project.value?.access_uuid) {
      const created = await store.createNewProject({
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'video',
      })
      if (!created) {
        throw new Error('Failed to create project.')
      }
    }

    // Depending on fileType, set store state to uploading
    if (fileType === 'main') {
      store.mainSetUploading(true)
      store.mainHandleFileSelected(file)
    } else {
      store.trailerSetUploading(true)
      store.trailerHandleFileSelected(file)
    }

    // 1) Get presigned URL from the backend
    const { data: presignedData } = await $axios.post(
      `/api/studio/projects/${store.project?.access_uuid}/presigned-url`,
      {
        fileName: file.name,
        fileType,
        contentType: file.type,
        fileSize: file.size,
      }
    )

    // 2) Upload to S3
    const { uploadToS3, updateProgress } = usePremiereUpload(fileType)
    const uploadResponse = await uploadToS3(
      file,
      presignedData.presignedUrl,
      (progress, loaded) => {
        updateProgress(loaded, file.size)
        if (fileType === 'main') {
          store.mainHandleUploadProgress(progress)
        } else {
          store.trailerHandleUploadProgress(progress)
        }
      }
    )

    if (uploadResponse.status !== 200) {
      throw new Error(`Upload failed: ${uploadResponse.status}`)
    }

    // 3) Confirm upload
    const { data: confirmData } = await $axios.post(
      `/api/studio/projects/${store.project?.access_uuid}/confirm-upload`,
      {
        s3Key: presignedData.s3Key,
        fileType,
      }
    )

    // Let store know upload is done
    if (fileType === 'main') {
      store.mainHandleS3UploadComplete({ fileUrl: confirmData.fileUrl })
    } else {
      store.trailerHandleS3UploadComplete({ fileUrl: confirmData.fileUrl })
    }

    toast.success('File uploaded successfully')
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Upload failed'
    if (fileType === 'main') {
      store.mainHandleUploadError(errMsg)
    } else {
      store.trailerHandleUploadError(errMsg)
    }
  }
}

async function onFileSelected(payload: {
  file: File
  fileType: 'main' | 'trailer'
}) {
  const { file, fileType } = payload

  if (fileType === 'trailer' && !store.mainVideo.isUploadComplete) {
    toast.error('Please wait until the main video is fully processed.')
    return
  }
  await getPresignedUrlAndUpload(file, fileType)
}

// Clean up on unmount
onUnmounted(() => {
  store.resetMainState()
  store.resetTrailerState()
})
</script>

<style scoped>
.modern-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.file-uploaders {
  margin-bottom: 24px;
}
</style>
