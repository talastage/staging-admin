<template>
  <v-container class="pa-0 mt-4 mx-auto" max-width="1200">
    <BaseHeader title="Manage your projects">
      <template #subtitle>
        <span class="text-subtitle-1 text-medium-emphasis">
          View and manage your projects across different stages
        </span>
      </template>
    </BaseHeader>

    <v-tabs v-model="activeTab" color="primary" class="mb-6 custom-tabs" grow>
      <v-tab value="published">Published Projects</v-tab>
      <v-tab value="draft">Draft Projects</v-tab>
    </v-tabs>

    <v-container class="pa-0 mt-4">
      <KeepAlive>
        <component
          :is="currentTabComponent"
          :key="activeTab"
          @delete-project="handleDeleteProject"
        />
      </KeepAlive>
    </v-container>

    <ProjectDeleteDialog
      v-if="projectToDelete"
      v-model:show="showDeleteDialog"
      :project="projectToDelete"
      @confirm="confirmDeleteProject"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudioProjectsStore } from '@/stores/studioProjectsStore'
import { useSnackMessageStore } from '@/stores/useSnackMessage'
import DraftProjects from '@/components/studio/StudioDraftProjects.vue'
import PublishedProjects from '@/components/studio/StudioPublishedProjects.vue'

// Initialize stores and Vue Router utilities
const projectsStore = useStudioProjectsStore()
const snackStore = useSnackMessageStore()
const route = useRoute()
const router = useRouter()

// Reactive variables
const activeTab = ref('published') // Default tab
const showDeleteDialog = ref(false)
const projectToDelete = ref(null)

// Dynamically determine the current tab component
const currentTabComponent = computed(() => {
  return activeTab.value === 'published' ? PublishedProjects : DraftProjects
})

// Set the active tab based on URL query parameter when the component mounts
onMounted(() => {
  const tab = route.query.tab
  if (tab === 'draft') {
    activeTab.value = 'draft'
  } else {
    activeTab.value = 'published' // Default to 'published' if no valid tab is specified
  }
})

// Update the URL when the active tab changes
watch(activeTab, (newTab) => {
  router.push({ query: { tab: newTab } })
})

// Handle project deletion events
const handleDeleteProject = (project) => {
  projectToDelete.value = project
  showDeleteDialog.value = true
}

const confirmDeleteProject = async () => {
  if (projectToDelete.value) {
    try {
      await projectsStore.deleteProject(projectToDelete.value.access_uuid)

      // Show success message
      snackStore.success(
        `Project "${
          projectToDelete.value.title || 'Untitled'
        }" has been deleted successfully`
      )

      showDeleteDialog.value = false
      projectToDelete.value = null
    } catch (error) {
      console.error('Error deleting project:', error)

      // Show error message
      snackStore.error('Failed to delete project. Please try again.')
    }
  }
}
</script>
