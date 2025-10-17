<template>
  <div>
    <ProjectCastAndCrewPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})

// Fetch app data for dynamic headers and SEO
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})
const talastageApp = computed(() => appsStore.talastageApp)

// Set up headers and SEO
useSeo({
  title: computed(
    () => `Cast & Crew - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      'Discover the talented cast and crew behind this project. Explore actors, directors, producers, and all team members who contributed to this production.'
  ),
  keywords: computed(
    () =>
      `cast, crew, actors, directors, production team, behind the scenes, filmmakers, talent, ${
        talastageApp.value?.name || 'TalaStage'
      }`
  ),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/project/cast-crew`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/project/cast-crew`
  ),
  noIndex: false, // Allow indexing to improve discoverability of cast and crew information
  openGraph: computed(() => ({
    title: `Cast & Crew - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Discover the talented cast and crew behind this project. Explore actors, directors, producers, and all team members who contributed to this production.',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/project/cast-crew`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    type: 'website',
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Cast & Crew - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Discover the talented cast and crew behind this project. Explore actors, directors, producers, and all team members who contributed to this production.',
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
    {
      rel: 'canonical',
      href: `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/project/cast-crew`,
    },
  ]),
  // Schema.org structured data for enhanced search results
  structuredDataFactory: () => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `Cast & Crew - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Discover the talented cast and crew behind this project. Explore actors, directors, producers, and all team members who contributed to this production.',
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/project/cast-crew`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    provider: {
      '@type': 'Organization',
      name: talastageApp.value?.name || 'TalaStage',
      url: talastageApp.value?.canonical_url || 'https://talastage.com',
    },
  }),
})
</script>

<style scoped>
/* Add any page-specific styles if necessary */
</style>
