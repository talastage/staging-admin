<template>
  <BaseCard v-if="project">
    <div class="header-actions mb-5">
      <div class="header-actions-left">
        <ProjectDetailSavedHeader
          :project-name="localName"
          :is-saving="isSaving"
          :last-saved-at="lastSavedAt"
          :save-error="saveError"
        />
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="8" class="pb-2">
        <div class="input-group">
          <v-text-field
            v-model="localName"
            label="Project Name"
            variant="outlined"
            class="mb-3"
            :rules="[(v) => !!v || 'Project name is required']"
            required
            placeholder="Enter your project name"
            :disabled="isSaving"
            density="comfortable"
          />

          <v-textarea
            v-model="localDescription"
            label="Description"
            variant="outlined"
            rows="2"
            auto-grow
            class="mb-1"
            :counter="5000"
            :rules="[(v) => !v || v.length <= 5000 || 'Max 5000 characters']"
            placeholder="Tell viewers about your video"
            :disabled="isSaving"
            density="comfortable"
          />
          <div
            class="char-count mb-3"
            :class="{ 'error--text': localDescription.length > 5000 }"
          >
            {{ localDescription.length }} / 5000
          </div>
        </div>

        <ProjectWatchFeeSettings :project="project" class="mb-5" />

        <div class="thumbnail-section">
          <MediaThumbnailUpload
            :thumbnail-url="project.thumbnail_url"
            :is-uploading="isThumbnailUploading"
            @update:thumbnail="handleThumbnailUpdate"
            @upload:start="handleThumbnailUploadStart"
            @upload:complete="handleThumbnailUploadComplete"
          />
        </div>
      </v-col>

      <v-col cols="12" md="4" class="pb-2">
        <div class="preview-section">
          <h3 class="text-subtitle-1 mb-2">Main Video Preview</h3>
          <VideoPreview
            ref="mainVideoPlayer"
            video-id="main"
            :video-url="project.project_url"
            :thumbnail-url="project.thumbnail_url"
            @play="handlePlay"
            @pause="handlePause"
            class="mb-4"
          />

          <h3 class="text-subtitle-1 mb-2">Trailer Preview</h3>
          <VideoPreview
            ref="trailerVideoPlayer"
            video-id="trailer"
            :video-url="project.trailer_url"
            :thumbnail-url="project.thumbnail_url"
            @play="handlePlay"
            @pause="handlePause"
          />
        </div>
      </v-col>
    </v-row>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useToast } from 'vue-toastification'
import { useNuxtApp } from '#app'
import { usePremieringMediaUpload } from '@/stores/premiering/usePremieringMediaUpload'
import type { StudioProject } from '~/types/studio-project'
import VideoPreview from '~/components/upload/VideoPreview.vue'

const props = defineProps<{
  project?: StudioProject | null
}>()

const toast = useToast()
const { $axios } = useNuxtApp()
const mediaUploadStore = usePremieringMediaUpload()

// Local state for inputs
const localName = ref(props.project?.name ?? '')
const localDescription = ref(props.project?.description ?? '')
const isSaving = ref(false)
const isThumbnailUploading = ref(false)
const lastSavedAt = ref<Date | null>(null)
const saveError = ref<string | null>(null)
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// --- VIDEO PLAYBACK CONTROL ---
type PlayingVideo = 'main' | 'trailer' | null

const mainVideoPlayer = ref<InstanceType<typeof VideoPreview> | null>(null)
const trailerVideoPlayer = ref<InstanceType<typeof VideoPreview> | null>(null)
const currentlyPlaying = ref<PlayingVideo>(null)

/**
 * Handles the 'play' event from a child VideoPreview component.
 * It ensures any other playing video is paused before updating the state.
 */
function handlePlay(playingVideoId: 'main' | 'trailer') {
  // If a different video is playing, pause it.
  if (currentlyPlaying.value && currentlyPlaying.value !== playingVideoId) {
    if (currentlyPlaying.value === 'main') {
      mainVideoPlayer.value?.pause()
    } else {
      trailerVideoPlayer.value?.pause()
    }
  }
  // Set the new video as the one that is currently playing.
  currentlyPlaying.value = playingVideoId
}

/**
 * Handles the 'pause' event from a child VideoPreview. This happens when
 * a user clicks a video that is already playing.
 */
function handlePause(pausedVideoId: 'main' | 'trailer') {
  // If the video that was paused is the one we tracked as playing,
  // update our state to reflect that nothing is playing anymore.
  if (currentlyPlaying.value === pausedVideoId) {
    currentlyPlaying.value = null
  }
}



// Watchers for auto-saving
watch(localName, (newVal) => {
  scheduleSave({ name: newVal })
})
watch(localDescription, (newVal) => {
  scheduleSave({ description: newVal })
})

function scheduleSave(updateFields: Partial<StudioProject>) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveProjectDetails(updateFields)
  }, 1000)
}

async function saveProjectDetails(updateFields: Partial<StudioProject>) {
  if (!props.project?.access_uuid) return
  isSaving.value = true
  saveError.value = null
  try {
    const { data } = await $axios.put(
      `/api/studio/projects/${props.project.access_uuid}/draft`,
      updateFields
    )
    mediaUploadStore.updateProject(data)
    lastSavedAt.value = new Date()
    toast.success('Project details saved')
  } catch (error: any) {
    saveError.value = error.response?.data?.message || 'Failed to save'
    toast.error('Failed to save project details')
  } finally {
    isSaving.value = false
  }
}

/** Thumbnail Upload Events */
function handleThumbnailUploadStart() {
  isThumbnailUploading.value = true
}
function handleThumbnailUploadComplete(success: boolean) {
  if (!success) isThumbnailUploading.value = false
}
async function handleThumbnailUpdate(thumbnailBlob: Blob) {
  if (!props.project?.access_uuid) return
  isThumbnailUploading.value = true
  try {
    const { uploadFile } = useVaporUpload()
    const result = await uploadFile(
      thumbnailBlob,
      `/api/studio/projects/${props.project.access_uuid}/thumbnail/upload-url`,
      `/api/studio/projects/${props.project.access_uuid}/thumbnail/confirm`,
      {
        onProgress: (progress) => {
          // Optional: handle progress if needed
        }
      }
    )
    
    mediaUploadStore.updateProject({
      ...props.project,
      thumbnail_url: result.thumbnail_url,
    })
    toast.success('Thumbnail updated successfully')
  } catch (error) {
    console.error('Error updating thumbnail:', error)
    toast.error('Failed to update thumbnail')
  } finally {
    isThumbnailUploading.value = false
  }
}

onBeforeUnmount(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
})
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-actions-left {
  flex: 1;
  margin-right: 16px;
}
.input-group {
  margin-bottom: 16px;
}
.char-count {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: -8px;
}
.char-count.error--text {
  color: var(--v-error-base);
}
.thumbnail-section {
  max-width: 360px;
  margin-top: -8px;
}
.preview-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
