<template>
  <v-container class="max-width">
    <!-- Page Header -->
    <v-row>
      <v-col cols="12" class="text-center">
        <BaseTitle :margin-bottom="4" size="h1" tag="h1">
          Need Help? Contact Us
        </BaseTitle>
        <p class="text-body-1 text-medium-emphasis mb-8">
          Send us a message and our team will be happy to assist you
        </p>
      </v-col>
    </v-row>

    <!-- Contact Form Section -->
    <v-row>
      <v-col cols="12">
        <SendSupportMessage />
      </v-col>
    </v-row>

    <!-- Popular Articles Section at the bottom -->
    <v-container v-if="hasPopularArticles" class="mt-8">
      <HelpPopularArticles />
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSeo } from '@/composables/seo/useSeo'
import { useAppsStore } from '@/stores/useApps'
import { useHelp } from '@/composables/useHelp'
import HelpPopularArticles from '@/components/help/HelpPopularArticles.vue'
import SendSupportMessage from '@/components/support/SendSupportMessage.vue'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})

const appsStore = useAppsStore()
const { popularArticles, fetchPopularArticles } = useHelp()

// Fetch app data for SEO and header meta
await appsStore.fetchTalaStageApp()

// Access the app data
const talastageApp = computed(() => appsStore.talastageApp)

// Check if popular articles exist
const hasPopularArticles = computed(() => popularArticles.value.length > 0)

// Use the useSeo composable to set SEO metadata
useSeo({
  title: `Contact Us - ${talastageApp.value?.name || 'TalaStage'}`,
  description:
    talastageApp.value?.seo_description ||
    'Need help? Contact our support team for assistance with any questions or concerns you may have.',
  keywords:
    talastageApp.value?.meta_keywords ||
    'contact, support, help, assistance, customer service',
  image: talastageApp.value?.logo_url || '/default-social-image.png',
  url: talastageApp.value?.canonical_url || 'https://talastage.com/contacts',
  type: 'website',
  siteName: talastageApp.value?.name || 'TalaStage',
  twitterUsername: '@talastage',
})

onMounted(async () => {
  // Fetch popular articles to check if they exist
  await fetchPopularArticles()
})
</script>

<style scoped>
.max-width {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
