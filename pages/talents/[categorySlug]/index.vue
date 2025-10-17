<template>
  <div>
    <TalentCategoryDetailPage />
  </div>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { computed, onMounted } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { useRoute } from 'vue-router'

// Initialize the app store and route
const appsStore = useAppsStore()
const route = useRoute()

// Fetch the app data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Get the app data and category slug
const talastageApp = computed(() => appsStore.talastageApp)
const categorySlug = computed(() => route.params.categorySlug as string)

// Define SEO metadata dynamically
useSeo({
  title: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    const category = categorySlug.value
      ? categorySlug.value.replace(/-/g, ' ')
      : 'Category'
    return `Talents in ${category} - ${appName}`
  }),
  description: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    const category = categorySlug.value
      ? categorySlug.value.replace(/-/g, ' ')
      : 'this category'
    return `Explore talented individuals in the ${category} category on ${appName}. Discover amazing artists and professionals.`
  }),
  keywords: computed(() => {
    const appName = talastageApp.value?.name || 'TalaStage'
    const category = categorySlug.value
      ? `${categorySlug.value.replace(/-/g, ' ')},`
      : ''
    return `talents, ${category} talent, artists, professionals, discover, ${appName}`
  }),
  image: computed(
    () => talastageApp.value?.logo_url || '/default-social-image.png'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  url: computed(() => {
    const canonical =
      talastageApp.value?.canonical_url || 'https://talastage.com'
    return categorySlug.value
      ? `${canonical}/talents/categories/${categorySlug.value}`
      : `${canonical}/talents/categories`
  }),
  canonical: computed(() => {
    const canonical =
      talastageApp.value?.canonical_url || 'https://talastage.com'
    return categorySlug.value
      ? `${canonical}/talents/categories/${categorySlug.value}`
      : `${canonical}/talents/categories`
  }),
  openGraph: computed(() => ({
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      const category = categorySlug.value
        ? categorySlug.value.replace(/-/g, ' ')
        : 'Category'
      return `Talents in ${category} - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      const category = categorySlug.value
        ? categorySlug.value.replace(/-/g, ' ')
        : 'this category'
      return `Explore talented individuals in the ${category} category on ${appName}. Discover amazing artists and professionals.`
    }).value,
    url: computed(() => {
      const canonical =
        talastageApp.value?.canonical_url || 'https://talastage.com'
      return categorySlug.value
        ? `${canonical}/talents/categories/${categorySlug.value}`
        : `${canonical}/talents/categories`
    }).value,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
    siteName: talastageApp.value?.name || 'TalaStage',
    type: 'website',
  })),
  twitter: computed(() => ({
    card: 'summary_large_image',
    title: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      const category = categorySlug.value
        ? categorySlug.value.replace(/-/g, ' ')
        : 'Category'
      return `Talents in ${category} - ${appName}`
    }).value,
    description: computed(() => {
      const appName = talastageApp.value?.name || 'TalaStage'
      const category = categorySlug.value
        ? categorySlug.value.replace(/-/g, ' ')
        : 'this category'
      return `Explore talented individuals in the ${category} category on ${appName}. Discover amazing artists and professionals.`
    }).value,
    image: talastageApp.value?.logo_url || '/default-social-image.png',
  })),
  link: computed(() => [
    { rel: 'icon', href: talastageApp.value?.favicon_url || '/favicon.ico' },
  ]),
})
</script>

<style lang="scss" scoped>
/* Add any page-specific styles if necessary */
</style>
