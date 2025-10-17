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
          <PremieringProjectSettings v-if="project" :project="project" />
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

// Access the route param
const route = useRoute()
const accessUuid = route.params.access_uuid as string

// Directly use the project and apps stores
const projectStore = useProjectStore()
const appsStore = useAppsStore()

// Computed references for project, loading state, errors, and app name
const project = computed(() => projectStore.currentProject)
const loading = computed(() => projectStore.isLoading)
const error = computed(() => projectStore.error)
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')

// On mount, fetch project and app data if needed
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
  if (!project.value || project.value.access_uuid !== accessUuid) {
    await projectStore.fetchProject(accessUuid)
  }
})

// SEO Configuration using useSeo composable
useSeo({
  title: computed(() =>
    project.value?.name
      ? `Publish Project - ${project.value.name} - ${appName.value}`
      : `Publish Project - ${appName.value}`
  ),
  description: computed(() =>
    project.value?.name
      ? `Configure the publishing settings for your project ${project.value.name} on ${appName.value}.`
      : `Configure the publishing settings for your project on ${appName.value}.`
  ),
  keywords: computed(() =>
    project.value?.name
      ? `${project.value?.name}, publish, project settings, distribution, visibility, ${appName.value}`
      : `publish project, project settings, distribution, visibility, ${appName.value}`
  ),
  image: computed(
    () =>
      appsStore.talastageApp?.thumbnail_url ||
      appsStore.talastageApp?.logo_url ||
      '/default-project-publish.png'
  ),
  type: 'website',
  siteName: appName,
  url: computed(() => `/studio/projects/${accessUuid}/publish`),
  noIndex: true, // This is a management interface, so exclude from indexing
  structured: computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: computed(() =>
      project.value?.name
        ? `Publish Project - ${project.value.name} - ${appName.value}`
        : `Publish Project - ${appName.value}`
    ).value,
    description: computed(() =>
      project.value?.name
        ? `Configure the publishing settings for your project ${project.value.name} on ${appName.value}.`
        : `Configure the publishing settings for your project on ${appName.value}.`
    ).value,
    url: computed(() => `/studio/projects/${accessUuid}/publish`).value,
    isPartOf: {
      '@type': 'CreativeWork',
      name: project.value?.name || 'Project',
    },
    publisher: {
      '@type': 'Organization',
      name: appName.value,
      logo: {
        '@type': 'ImageObject',
        url: appsStore.talastageApp?.logo_url || '/default-thumbnail.png',
      },
    },
  })),
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
