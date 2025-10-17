<template>
  <div>
    <TalentCategoriesPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'

// Fetch app data for headers and SEO
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})
const talastageApp = computed(() => appsStore.talastageApp)

// Setup headers and SEO
useSeo({
  title: computed(
    () =>
      `Explore Talent Categories - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      talastageApp.value?.seo_description ||
      `Discover a variety of talent categories like Culture Dance, Modern Dance, and more on ${talastageApp.value?.name} and connect with extraordinary talents worldwide.`
  ),
  keywords: computed(
    () =>
      'talent categories, talents, explore, connect, showcase, platform, dance categories, culture dance, modern dance'
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
      }/categories`
  ),
  canonical: computed(
    () =>
      `${
        talastageApp.value?.canonical_url || 'https://talastage.com'
      }/categories`
  ),
  openGraph: computed(() => ({
    title: `Explore Talent Categories - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description:
      talastageApp.value?.seo_description ||
      `Discover a variety of talent categories like Culture Dance, Modern Dance, and more on ${talastageApp.value?.name} and connect with extraordinary talents worldwide.`,
    url: `${
      talastageApp.value?.canonical_url || 'https://talastage.com'
    }/categories`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    type: 'website',
    siteName: talastageApp.value?.name || 'TalaStage',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: `Explore Talent Categories - ${
      talastageApp.value?.name || 'TalaStage'
    }`,
    description:
      talastageApp.value?.seo_description ||
      `Discover a variety of talent categories like Culture Dance, Modern Dance, and more on ${talastageApp.value?.name} and connect with extraordinary talents worldwide.`,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
  ]),
})
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
