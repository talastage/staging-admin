<template>
  <v-container class="report-page py-8">
    <!-- Page Header -->
    <v-row class="mb-8">
      <v-col cols="12" class="text-center">
        <div class="d-flex align-center justify-center mb-4">
          <v-icon
            icon="mdi-alert-circle-outline"
            color="primary"
            size="40"
            class="mr-3"
          />
          <h1 class="text-h4 font-weight-medium mb-0">Report a Problem</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis max-width-md mx-auto">
          We're here to help! Please let us know about any issues you're
          experiencing, and our team will address them as quickly as possible.
        </p>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card
          class="report-card"
          :elevation="2"
          :theme="isDarkMode ? 'dark' : 'light'"
        >
          <v-card-text>
            <SendReportMessage />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Help Section -->
    <v-row class="mt-8" justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-alert color="info" variant="tonal" border="start" class="help-alert">
          <template #prepend>
            <v-icon icon="mdi-information" />
          </template>
          <div class="d-flex flex-column">
            <span class="text-subtitle-1 font-weight-medium mb-1">
              Need immediate assistance?
            </span>
            <span class="text-body-2">
              Check our
              <v-btn variant="text" to="/help" class="px-1">Help Center</v-btn>
              for quick solutions to common problems.
            </span>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { useSeo } from '@/composables/seo/useSeo'
import { useAppsStore } from '@/stores/useApps'
import { PAGE_WIDTHS } from '~/constants/layouts'
import { computed } from 'vue'

const theme = useTheme()
const isDarkMode = computed(() => theme.global.current.value.dark)

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})

// Fetch app data for SEO and header meta
const appsStore = useAppsStore()
await appsStore.fetchTalaStageApp()

// Access the app data
const talastageApp = computed(() => appsStore.talastageApp)

// Use the useSeo composable to set SEO metadata
useSeo({
  title: `Report a Problem - ${talastageApp.value?.name || 'TalaStage'}`,
  description:
    talastageApp.value?.seo_description ||
    'Report any issues you are experiencing, and our team will address them as quickly as possible.',
  keywords:
    talastageApp.value?.meta_keywords ||
    'report, problem, feedback, support, help, assistance',
  image: talastageApp.value?.logo_url || '/default-social-image.png',
  url: `${useRuntimeConfig().public.frontendUrl}/feedback/report`,
  type: 'website',
  siteName: talastageApp.value?.name || 'TalaStage',
  twitterUsername: '@talastage',
})
</script>

<style lang="scss" scoped>
.report-page {
  .max-width-md {
    max-width: 600px;
  }

  .report-card {
    border-radius: 8px;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .help-alert {
    border-radius: 8px;
  }

  :deep(.v-card-text) {
    padding: 0;

    .report-problem {
      box-shadow: none !important;
    }
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .report-page {
    .text-h4 {
      font-size: 1.5rem !important;
    }

    .v-container {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  }
}
</style>
