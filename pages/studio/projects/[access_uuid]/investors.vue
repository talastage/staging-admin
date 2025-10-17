<template>
  <v-row class="justify-content-center mt-5">
    <v-col cols="12" md="12">
      <v-card elevation="10" class="pa-6">
        <template v-if="loading">
          <v-progress-circular indeterminate color="primary" class="ma-4" />
        </template>

        <template v-else-if="error">
          <v-alert type="error">{{ error }}</v-alert>
        </template>

        <template v-else>
          <AddProjectInvestors v-if="project" :project="project" />
          <div v-else class="text-center text-danger">Project not found</div>
        </template>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '~/stores/useProjectStore'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'

import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: false, // Set this to true to have the drawer minimized on page load
  },
  layout: 'studio-project-layout',
  middleware: ['auth', 'noindex'],
})

// Grab the access_uuid from the route
const route = useRoute()
const param = route.params.access_uuid
const accessUuid = typeof param === 'string' ? param : String(param ?? '')

// Use the project and apps stores
const projectStore = useProjectStore()
const appsStore = useAppsStore()

// Computed refs for project data & store state
const project = computed(() => projectStore.currentProject)
const loading = computed(() => projectStore.isLoading)
const error = computed(() => projectStore.error)
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')

// On mount, fetch the project and app data if needed
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
  // Only fetch the project if it's not already loaded or if it's a different project
  if (!project.value || project.value.access_uuid !== accessUuid) {
    const fetchedProject = await projectStore.fetchProject(accessUuid)
    if (!fetchedProject) {
      projectStore.error = 'Project not found'
    }
  }
})

// Get raw values for SEO configuration to avoid circular references
const projectName = computed(() => project.value?.name || '')
const projectUrl = computed(() => `/studio/projects/${accessUuid}/investors`)
const seoImageUrl = computed(
  () =>
    appsStore.talastageApp?.thumbnail_url ||
    appsStore.talastageApp?.logo_url ||
    '/default-project-investors.png'
)

// SEO Configuration using useSeo composable with unwrapped values
useSeo({
  title: computed(() =>
    projectName.value
      ? `Manage Investors - ${projectName.value} - ${appName.value}`
      : `Manage Investors - Project - ${appName.value}`
  ),
  description: computed(() =>
    projectName.value
      ? `Add and manage the investors for the project ${projectName.value} on ${appName.value}.`
      : `Add and manage the investor details for your project on ${appName.value}.`
  ),
  keywords: computed(() =>
    projectName.value
      ? `${projectName.value}, investors, project funding, stakeholders, manage finance, ${appName.value}`
      : `investors, project funding, stakeholders, manage finance, ${appName.value}`
  ),
  image: seoImageUrl,
  type: 'website',
  siteName: appName,
  url: projectUrl,
  noIndex: true, // This is a management interface, so exclude from indexing
  // Provide a factory function that returns structured data instead of nested computed refs
  structuredDataFactory: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: projectName.value
      ? `Manage Investors - ${projectName.value} - ${appName.value}`
      : `Manage Investors - Project - ${appName.value}`,
    description: projectName.value
      ? `Add and manage the investors for the project ${projectName.value} on ${appName.value}.`
      : `Add and manage the investor details for your project on ${appName.value}.`,
    url: projectUrl.value,
    isPartOf: {
      '@type': 'CreativeWork',
      name: projectName.value || 'Project',
    },
    publisher: {
      '@type': 'Organization',
      name: appName.value,
      logo: {
        '@type': 'ImageObject',
        url: appsStore.talastageApp?.logo_url || '/default-thumbnail.png',
      },
    },
  }),
})
</script>

<style scoped>
.v-card-title {
  display: flex;
  align-items: center;
}
</style>
