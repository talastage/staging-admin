<!-- pages\project\[access_uuid]\earnings\index.vue -->
<template>
  <ProjectEarningsPage
    :project="project"
    :access-uuid="accessUuid"
    :is-project-loading="isProjectLoading"
    @refresh-project="fetchProjectData"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '~/stores/useProjectStore'
import { PAGE_WIDTHS } from '~/constants/layouts'
import { useSeo } from '~/composables/seo/useSeo'

// Page metadata
definePageMeta({
  middleware: ['auth', 'is-project-creator'],
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})

// Route & Store
const route = useRoute()
const projectStore = useProjectStore()
const {
  project,
  error: projectError,
  isLoading: isProjectLoading,
} = storeToRefs(projectStore)

// Access UUID from route params
const accessUuid = computed<string>(() => route.params.access_uuid as string)

// Computed Properties
const pageTitle = computed((): string => {
  if (!project.value) return 'Project Earnings'
  return `${project.value.name} - Earnings & Revenue`
})

// Dynamic description based on project data
const pageDescription = computed((): string => {
  if (!project.value) {
    return 'Project earnings and revenue analytics dashboard'
  }
  return `View earnings and revenue analytics for ${project.value.name}`
})

// Fetch project data
const fetchProjectData = async (): Promise<void> => {
  if (!accessUuid.value) return
  await projectStore.fetchProject(accessUuid.value)
  if (projectError.value) {
    console.error('Error fetching project:', projectError.value)
  }
}

// Initialize page data
fetchProjectData()

// SEO Configuration - outside the fetchProjectData to ensure it's reactive
const { seo, updateSeo } = useSeo({
  title: isProjectLoading.value
    ? 'Loading Project Earnings...'
    : pageTitle.value,
  description: pageDescription.value,
  keywords:
    'project earnings, revenue analytics, financial data, project finance',
  type: 'website',
  noIndex: true,
})

// Watch for changes in project data and loading state to update SEO
watch(
  [project, isProjectLoading],
  ([newProject, newIsLoading]) => {
    // Only update the title when loading completes or project data changes
    updateSeo({
      title: newIsLoading ? 'Loading Project Earnings...' : pageTitle.value,
      description: pageDescription.value,
    })
  },
  { immediate: true }
)
</script>
