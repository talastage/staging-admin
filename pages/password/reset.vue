<template>
  <v-container class="password-reset-page">
    <PasswordResetPage />
  </v-container>
</template>

<script setup lang="ts">
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { computed, onMounted } from 'vue'
import { PAGE_WIDTHS } from '~/constants/layouts'

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: true,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'auth-layout',
  middleware: ['noindex'],
})

// Fetch app data on mount
const appsStore = useAppsStore()
onMounted(async () => {
  await appsStore.fetchTalaStageApp()
})

// Access the TalaStage app data
const talastageApp = computed(() => appsStore.talastageApp)

// Use the useSeo composable to handle SEO
useSeo({
  title: computed(() =>
    talastageApp.value?.name
      ? `Password Reset - ${talastageApp.value.name}`
      : 'Password Reset - TalaStage'
  ),
  description: computed(
    () =>
      `Reset your password to regain access to your ${
        talastageApp.value?.name || 'TalaStage'
      } account.`
  ),
  keywords: 'password reset, account recovery, TalaStage',
  image: computed(
    () => talastageApp.value?.logo_url || '/default-password-reset-image.png'
  ),
  url: computed(
    () => `${useRuntimeConfig().public.frontendUrl}/password/reset`
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitterUsername: '@talastage',
  structured: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: computed(() =>
      talastageApp.value?.name
        ? `Password Reset - ${talastageApp.value.name}`
        : 'Password Reset - TalaStage'
    ),
    description: computed(
      () =>
        `Reset your password to regain access to your ${
          talastageApp.value?.name || 'TalaStage'
        } account.`
    ),
    url: computed(
      () => `${useRuntimeConfig().public.frontendUrl}/password/reset`
    ),
    publisher: {
      '@type': 'Organization',
      name: computed(() => talastageApp.value?.name || 'TalaStage'),
      logo: {
        '@type': 'ImageObject',
        url: computed(
          () =>
            talastageApp.value?.logo_url || '/default-password-reset-image.png'
        ),
      },
    },
  },
})
</script>

<style scoped>
.password-reset-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
