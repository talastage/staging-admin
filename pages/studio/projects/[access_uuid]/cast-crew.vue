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
          <AddProjectCredits v-if="project" :project="project" />
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
const route = useRoute()
const accessUuid = route.params.access_uuid as string

// Use the stores
const projectStore = useProjectStore()
const appsStore = useAppsStore()

// Computed references to store state
const project = computed(() => projectStore.currentProject)
const loading = computed(() => projectStore.isLoading)
const error = computed(() => projectStore.error)
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')

// On mount, fetch necessary data
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
  if (!project.value || project.value.access_uuid !== accessUuid) {
    await projectStore.fetchProject(accessUuid)
  }
})

// Extract raw values for SEO to avoid circular references
const projectName = computed(() => project.value?.name || '')
const projectUrl = computed(() => `/studio/projects/${accessUuid}/cast-crew`)
const seoImageUrl = computed(
  () =>
    appsStore.talastageApp?.thumbnail_url ||
    appsStore.talastageApp?.logo_url ||
    '/default-project-cast-crew.png'
)

// SEO Configuration using useSeo composable with structuredDataFactory
useSeo({
  title: computed(() =>
    projectName.value
      ? `Manage Cast & Crew - ${projectName.value} - ${appName.value}`
      : `Manage Cast & Crew - Project - ${appName.value}`
  ),
  description: computed(() =>
    projectName.value
      ? `Add, edit, and manage the cast and crew members for the project ${projectName.value} on ${appName.value}.`
      : `Add, edit, and manage the cast and crew details for your project on ${appName.value}.`
  ),
  keywords: computed(() =>
    projectName.value
      ? `${projectName.value}, cast management, crew management, project credits, film crew, actors, ${appName.value}`
      : `cast management, crew management, project credits, film crew, actors, ${appName.value}`
  ),
  image: seoImageUrl,
  type: 'website',
  siteName: appName,
  url: projectUrl,
  noIndex: true, // This is a management interface, so exclude from indexing

  // Use structuredDataFactory instead of structured with computed refs
  structuredDataFactory: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: projectName.value
      ? `Manage Cast & Crew - ${projectName.value} - ${appName.value}`
      : `Manage Cast & Crew - Project - ${appName.value}`,
    description: projectName.value
      ? `Add, edit, and manage the cast and crew members for the project ${projectName.value} on ${appName.value}.`
      : `Add, edit, and manage the cast and crew details for your project on ${appName.value}.`,
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
.v-chip {
  font-size: 0.875rem;
}
.v-card {
  border-radius: 12px;
}
</style>
