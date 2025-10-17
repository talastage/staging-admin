<template>
  <v-dialog v-model="dialogModel" max-width="500" persistent>
    <v-card elevation="10">
      <v-card-title class="text-h6 pa-4">
        <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
        Unable to Premiere Project
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Video Status Issues -->
        <template v-if="hasVideoStatusIssues">
          <div class="status-section mb-4">
            <div
              v-if="mainVideoStatus !== 'completed'"
              class="status-item mb-3"
            >
              <div class="d-flex align-center mb-1">
                <v-icon
                  :color="getStatusColor(mainVideoStatus)"
                  size="small"
                  class="mr-2"
                >
                  {{ getStatusIcon(mainVideoStatus) }}
                </v-icon>
                <span class="font-weight-medium">Main Video Status</span>
              </div>
              <div
                :class="[
                  'status-message',
                  `text-${getStatusColor(mainVideoStatus)}`,
                ]"
              >
                {{ getVideoStatusMessage(mainVideoStatus, 'main') }}
              </div>
            </div>

            <div v-if="trailerVideoStatus !== 'completed'" class="status-item">
              <div class="d-flex align-center mb-1">
                <v-icon
                  :color="getStatusColor(trailerVideoStatus)"
                  size="small"
                  class="mr-2"
                >
                  {{ getStatusIcon(trailerVideoStatus) }}
                </v-icon>
                <span class="font-weight-medium">Trailer Video Status</span>
              </div>
              <div
                :class="[
                  'status-message',
                  `text-${getStatusColor(trailerVideoStatus)}`,
                ]"
              >
                {{ getVideoStatusMessage(trailerVideoStatus, 'trailer') }}
              </div>
            </div>
          </div>
        </template>

        <!-- Missing Fields -->
        <template v-if="missingFields.length > 0">
          <div class="missing-fields-section">
            <div class="d-flex align-center mb-2">
              <v-icon color="warning" size="small" class="mr-2">
                mdi-information-outline
              </v-icon>
              <span class="font-weight-medium">Missing Requirements</span>
            </div>
            <ul class="missing-fields-list pl-8 mb-0">
              <li
                v-for="field in missingFields"
                :key="field"
                class="text-grey-darken-1"
              >
                {{ field }}
              </li>
            </ul>
          </div>
        </template>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <BaseButton
          title="Got it"
          color="primary"
          variant="text"
          :action="close"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UploadStatus } from '~/types/project-studio'

const props = defineProps<{
  isOpen: boolean
  mainVideoStatus: UploadStatus
  trailerVideoStatus: UploadStatus
  missingFields: string[]
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const dialogModel = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value),
})

const hasVideoStatusIssues = computed(
  () =>
    props.mainVideoStatus !== 'completed' ||
    props.trailerVideoStatus !== 'completed'
)

const getStatusColor = (status: UploadStatus): string => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'error'
    case 'processing':
    case 'uploading':
      return 'warning'
    default:
      return 'grey'
  }
}

const getStatusIcon = (status: UploadStatus): string => {
  switch (status) {
    case 'pending':
      return 'mdi-clock-outline'
    case 'uploading':
      return 'mdi-cloud-upload-outline'
    case 'processing':
      return 'mdi-cog-outline'
    case 'completed':
      return 'mdi-check-circle-outline'
    case 'failed':
      return 'mdi-alert-circle-outline'
    default:
      return 'mdi-help-circle-outline'
  }
}

const getVideoStatusMessage = (
  status: UploadStatus,
  type: 'main' | 'trailer'
): string => {
  const videoType = type === 'main' ? 'Main video' : 'Trailer'

  switch (status) {
    case 'pending':
      return `${videoType} upload hasn't started yet. Please upload your video.`
    case 'uploading':
      return `${videoType} is currently uploading. Please wait for the upload to complete.`
    case 'processing':
      return `${videoType} is being processed. This may take a few minutes.`
    case 'failed':
      return `${videoType} upload failed. Please try uploading again.`
    case 'completed':
      return `${videoType} is ready.`
    default:
      return `Unknown status for ${videoType.toLowerCase()}`
  }
}

const close = () => {
  dialogModel.value = false
}
</script>

<style scoped>
.status-section,
.missing-fields-section {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 8px;
  padding: 16px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-message {
  font-size: 0.875rem;
  margin-left: 26px;
}

.missing-fields-list {
  margin: 0;
  font-size: 0.875rem;
}

.missing-fields-list li {
  margin-bottom: 4px;
}

.missing-fields-list li:last-child {
  margin-bottom: 0;
}

/* Dark mode adjustments */
:deep(.v-dialog) {
  box-shadow: 0 0 0 1px rgba(var(--v-border-color), 0.12);
}

@media (prefers-color-scheme: dark) {
  .status-section,
  .missing-fields-section {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .status-message {
    font-size: 0.8125rem;
  }

  .missing-fields-list {
    font-size: 0.8125rem;
  }
}
</style>
