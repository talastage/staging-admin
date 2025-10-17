<template>
  <v-container>
    <v-stepper v-model="currentStep">
      <!-- Stepper Header -->
      <v-stepper-header>
        <v-stepper-item :value="1" :complete="isStepComplete(1)">
          Upload Videos
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="2" :complete="isStepComplete(2)">
          Project Details
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="3" :complete="isStepComplete(3)">
          Fees
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="4" :complete="isStepComplete(4)">
          Credits
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="5" :complete="isStepComplete(5)">
          Publish Settings
        </v-stepper-item>
      </v-stepper-header>

      <!-- Stepper Content -->
      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <PremieringUploadContent
            :project-access-uuid="project?.access_uuid"
            @uploads-complete="handleUploadsComplete"
          />
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <ProjectDetailsForm
            :access-uuid="project?.access_uuid"
            @details-saved="handleDetailsSaved"
            @thumbnail-upload="handleThumbnailUpload"
          />
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <ProjectFeesSettings
            :access-uuid="project?.access_uuid"
            @fees-saved="handleFeesSaved"
          />
        </v-stepper-window-item>

        <v-stepper-window-item :value="4">
          <ProjectCreditSettings
            :access-uuid="project?.access_uuid"
            @credits-saved="handleCreditsSaved"
          />
        </v-stepper-window-item>

        <v-stepper-window-item :value="5">
          <ProjectPublishSettings
            :access-uuid="project?.access_uuid"
            @settings-saved="handleSettingsSaved"
          />
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>

    <!-- Navigation -->
    <v-card v-if="project?.access_uuid" class="navigation-card" elevation="2">
      <v-card-actions class="d-flex justify-space-between pa-4">
        <v-btn
          v-if="currentStep > 1"
          color="secondary"
          variant="elevated"
          size="large"
          @click="previousStep"
          :disabled="isLoading"
        >
          <v-icon left>mdi-arrow-left</v-icon>
          Back
        </v-btn>
        <v-spacer v-else />
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          @click="nextStep"
          :disabled="isStepDisabled"
        >
          {{ currentStep === 5 ? 'Finish' : 'Next' }}
          <v-icon right>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Delete Dialog -->
    <ProjectDeleteDialog
      v-if="project?.access_uuid"
      v-model:show="showDeleteDialog"
      :project="project"
      @confirm="deleteProject"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useProjectPremieringStore } from '~/stores/premiering/projectPremieringStoreDELETE'
import { useVideoProcessingStatus } from '@/composables/premiering/useVideoProcessingStatus'

const router = useRouter()
const toast = useToast()
const projectStore = useProjectPremieringStore()

// State
const currentStep = ref(1)
const showDeleteDialog = ref(false)

// Computed
const project = computed(() => projectStore.project)
const isLoading = computed(() => projectStore.isLoading)
const isStepDisabled = computed(() => {
  if (isLoading.value) return true
  if (currentStep.value === 1) return !areUploadsComplete.value
  // Add other step validations as needed
  return false
})

const areUploadsComplete = computed(() => {
  return (
    project.value?.main_upload_status === 'completed' &&
    project.value?.trailer_upload_status === 'completed'
  )
})

// Watchers
watch(
  () => project.value?.access_uuid,
  (accessUuid) => {
    if (accessUuid) {
      useVideoProcessingStatus(accessUuid)
    }
  }
)

watch(currentStep, (newStep) => {
  if (project.value?.access_uuid) {
    projectStore.updateProject({
      lastCompletedStep: newStep - 1,
    })
  }
})

// Methods
function isStepComplete(step: number) {
  return (project.value?.lastCompletedStep ?? 0) >= step
}

function nextStep() {
  if (currentStep.value < 5) {
    currentStep.value++
  } else {
    publishProject()
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Handlers
function handleUploadsComplete() {
  nextStep()
}

function handleDetailsSaved(updatedProject: any) {
  projectStore.updateProject(updatedProject)
  nextStep()
}

function handleThumbnailUpload(thumbnailUrl: string) {
  projectStore.updateProject({ thumbnail_url: thumbnailUrl })
}

function handleFeesSaved(updatedFees: any) {
  projectStore.updateProject(updatedFees)
  nextStep()
}

function handleCreditsSaved() {
  nextStep()
}

function handleSettingsSaved(updatedSettings: any) {
  projectStore.updateProject(updatedSettings)
  publishProject()
}

// Project operations
async function publishProject() {
  if (!project.value?.access_uuid) return
  try {
    await projectStore.saveProjectDetails(project.value.access_uuid, {
      ...project.value,
      status: 'published',
    })
    toast.success('Project published successfully!')
    router.push({ name: 'studio-projects' })
  } catch (error) {
    toast.error('Failed to publish project')
  }
}

async function deleteProject() {
  if (!project.value?.access_uuid) return
  try {
    await projectStore.deleteProject(project.value.access_uuid)
    toast.success('Project deleted successfully')
    router.push({ name: 'studio-projects-manage-projects' })
  } catch (error) {
    toast.error('Failed to delete project')
  }
  showDeleteDialog.value = false
}

// Lifecycle
onMounted(() => {
  if (project.value?.lastCompletedStep) {
    currentStep.value = project.value.lastCompletedStep + 1
  }
})
</script>

<style scoped>
.navigation-card {
  position: sticky;
  bottom: 20px;
  z-index: 1;
  background-color: white;
  border-radius: 12px;
}
</style>
