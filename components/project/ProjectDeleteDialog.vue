<template>
  <BaseDialog
    v-model="internalShow"
    :title="'Delete Project'"
    max-width="550px"
  >
    <div class="delete-project-dialog">
      <div v-if="project" class="project-preview pa-4">
        <div class="d-flex">
          <div class="thumbnail-wrapper">
            <MediaThumbnail
              :thumbnail-url="project.thumbnail_url"
              :video_url="project.project_url"
              :access_uuid="project.access_uuid"
              size="sm"
              class="rounded-lg"
            />
          </div>
          <div class="project-info ml-4">
            <h3 class="text-h6 font-weight-medium mb-1">{{ project.name }}</h3>
            <div class="text-body-2 text-medium-emphasis">
              Published {{ formatRelativeDate(project.created_at) }}
            </div>
            <div class="d-flex align-center mt-1">
              <v-icon size="small" class="mr-1">mdi-eye</v-icon>
              <span class="text-body-2 text-medium-emphasis">
                {{ project.views_count || 0 }} views
              </span>
            </div>
          </div>
        </div>
      </div>

      <v-divider class="my-4"></v-divider>

      <div class="warning-section pa-4">
        <div class="text-h6 text-error mb-4">
          Are you sure you want to delete this project?
        </div>
        <div class="text-body-1 mb-4">
          This action cannot be undone. You will permanently lose:
          <ul class="mt-2">
            <li>Project content and data</li>
            <li>Audience analytics</li>
            <li>Video statistics</li>
            <li>Associated comments and engagement</li>
          </ul>
        </div>

        <v-checkbox
          v-model="localConfirmed"
          color="error"
          class="confirmation-checkbox"
        >
          <template #label>
            <span class="text-body-2">
              I understand that this action is permanent and cannot be reversed
            </span>
          </template>
        </v-checkbox>
      </div>

      <v-divider></v-divider>

      <div class="dialog-actions pa-4">
        <v-btn
          variant="tonal"
          color="grey-darken-1"
          @click="onCancel"
          class="mr-3"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          :disabled="!localConfirmed"
          @click="onConfirm"
          :loading="isDeleting"
        >
          Delete Forever
          <v-icon right class="ml-2">mdi-delete-forever</v-icon>
        </v-btn>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

interface Project {
  name: string
  thumbnail_url?: string
  project_url: string
  access_uuid: string
  created_at: string
  views_count?: number
}

const props = defineProps<{
  show: boolean
  project: Project
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  confirm: []
  cancel: []
}>()

const { formatRelativeDate } = useDateFormatter()
const localConfirmed = ref(false)
const isDeleting = ref(false)
const internalShow = ref(props.show)

watch(
  () => props.show,
  (newValue) => {
    internalShow.value = newValue
    if (!newValue) {
      localConfirmed.value = false
      isDeleting.value = false
    }
  }
)

watch(internalShow, (newValue) => {
  emit('update:show', newValue)
})

const onConfirm = async () => {
  if (!localConfirmed.value) return
  isDeleting.value = true
  try {
    emit('confirm')
  } finally {
    isDeleting.value = false
  }
}

const onCancel = () => {
  internalShow.value = false
  emit('cancel')
}
</script>

<style scoped>
.delete-project-dialog {
  background-color: rgb(var(--v-theme-surface));
}

.thumbnail-wrapper {
  width: 120px;
  min-width: 120px;
  height: 68px;
  overflow: hidden;
  border-radius: 8px;
}

.project-info {
  flex: 1;
}

.warning-section {
  background-color: rgb(var(--v-theme-error), 0.05);
}

.confirmation-checkbox {
  margin-top: 16px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

ul {
  padding-left: 20px;
  color: rgb(var(--v-theme-error));
}

li {
  margin-bottom: 4px;
}
</style>
