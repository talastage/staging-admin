<template>
  <ProjectInvestorEarningsPage
    :project="project"
    :access-uuid="accessUuid"
    :project-loading="projectLoading"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { PAGE_WIDTHS } from '~/constants/layouts'
import { useProjectStore } from '~/stores/useProjectStore'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'

// Page meta
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
  middleware: ['auth', 'is-project-creator'],
})

// Route setup
const route = useRoute()
const accessUuid = ref<string>(route.params.access_uuid as string)

// Project store
const projectStore = useProjectStore()
const { project, isLoading: projectLoading } = storeToRefs(projectStore)

// Apps store for app details
const appsStore = useAppsStore()
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')

// Fetch project data only once on mount
onMounted(async () => {
  // Check if we already have the project data for this UUID
  // to avoid unnecessary fetching
  if (!project.value || project.value.access_uuid !== accessUuid.value) {
    await projectStore.fetchProject(accessUuid.value)
  }
})

// SEO Logic
const pageTitle = computed(() =>
  project.value?.name
    ? `Investors & Earnings for ${project.value.name} - ${appName.value}`
    : `Project Investors & Earnings - ${appName.value}`
)

const pageDescription = computed(() =>
  project.value?.name
    ? `View the list of investors and their earnings for the project ${project.value.name} on ${appName.value}.`
    : `Explore the investors and earnings associated with a project on ${appName.value}.`
)

const pageKeywords = computed(() =>
  project.value?.name
    ? `${project.value.name}, investors, earnings, project finance, ${appName.value}`
    : `project investors, project earnings, investment details, ${appName.value}`
)

const pageUrl = computed(
  () => `/earnings/project/${accessUuid.value}/investors`
)

const pageImage = computed(
  () =>
    appsStore.talastageApp?.thumbnail_url ||
    appsStore.talastageApp?.logo_url ||
    'https://talastage.com/default-project-earnings.png'
)

const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl || 'https://talastage.com'

// SEO implementation using the updated useSeo utility
useSeo({
  title: pageTitle,
  description: pageDescription,
  keywords: pageKeywords,
  image: pageImage,
  type: 'website',
  siteName: appName,
  url: computed(() => `${baseUrl}${pageUrl.value}`),
  noIndex: true,
  structuredDataFactory: () => {
    if (!project.value) {
      return {}
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle.value,
      description: pageDescription.value,
      url: `${baseUrl}${pageUrl.value}`,
      publisher: {
        '@type': 'Organization',
        name: appName.value,
        logo: {
          '@type': 'ImageObject',
          url:
            appsStore.talastageApp?.logo_url ||
            'https://talastage.com/default-thumbnail.png',
        },
      },
    }
  },
})
</script>
