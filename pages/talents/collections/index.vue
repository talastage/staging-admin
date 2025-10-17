<template>
  <div>
    <TalentCollectionPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'

definePageMeta({
  middleware: ['auth', 'noindex'],
})

// Initialize the app store
const appsStore = useAppsStore()

// Fetch the app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Get the app data
const talastageApp = computed(() => appsStore.talastageApp)

// Define SEO metadata dynamically using app data
useSeo({
  title: computed(
    () => `Talent Collections - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      'Browse and manage your talent collections on TalaStage. Organize your favorite talents and explore their work.'
  ),
  keywords: computed(() => 'talent collections, organize talents, TalaStage'),
  image: computed(
    () =>
      talastageApp.value?.logo_url || 'https://talastage.com/social-card.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(() =>
    talastageApp.value?.canonical_url
      ? `${talastageApp.value.canonical_url}/talents/collections`
      : 'https://talastage.com/talents/collections'
  ),
  noIndex: true, // User-specific page, no need for indexing
  canonical: computed(() =>
    talastageApp.value?.canonical_url
      ? `${talastageApp.value.canonical_url}/talents/collections`
      : 'https://talastage.com/talents/collections'
  ),
  openGraph: computed(() => ({
    title: `Talent Collections - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Browse and manage your talent collections on TalaStage. Organize your favorite talents and explore their work.',
    url: talastageApp.value?.canonical_url
      ? `${talastageApp.value.canonical_url}/talents/collections`
      : 'https://talastage.com/talents/collections',
    image:
      talastageApp.value?.logo_url || 'https://talastage.com/social-card.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Talent Collections - ${talastageApp.value?.name || 'TalaStage'}`,
    description:
      'Browse and manage your talent collections on TalaStage. Organize your favorite talents and explore their work.',
    image:
      talastageApp.value?.logo_url || 'https://talastage.com/social-card.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style lang="scss" scoped></style>
