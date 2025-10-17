<template>
  <div>
    <UserWithTalentTips v-if="hasTalent" />
    <UserWithoutTalentTips v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { useUserTalentState } from '@/composables/useUserTalentState'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
  },
})

// Initialize app store and get talent state
const appsStore = useAppsStore()
const { hasTalent } = useUserTalentState()

// Fetch necessary data on mount
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Access the TalaStage app
const talastageApp = computed(() => appsStore.talastageApp)

// Apply SEO settings
useSeo({
  title: computed(() => talastageApp.value?.name || 'TalaStage'),
  description: computed(
    () =>
      talastageApp.value?.seo_description ||
      'Connecting talents across the globe with opportunities to shine and thrive ✨'
  ),
  keywords: computed(() => talastageApp.value?.meta_keywords || ''),
  image: computed(
    () =>
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/app-logo.png'
  ),
  url: computed(
    () => talastageApp.value?.canonical_url || 'https://talastage.com'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitter: {
    card: 'summary_large_image',
    site: '@talastage',
  },
  script: computed(() => {
    const schemaMarkup = talastageApp.value?.schema_markup
    if (schemaMarkup) {
      return [
        {
          type: 'application/ld+json',
          innerHTML: schemaMarkup,
        },
      ]
    }
    return []
  }),
  link: computed(() => [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
  ]),
})
</script>
