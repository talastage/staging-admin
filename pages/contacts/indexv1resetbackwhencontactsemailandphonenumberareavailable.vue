<template>
  <v-container class="max-width">
    <!-- Page Header -->
    <v-row>
      <v-col cols="12" class="text-center">
        <BaseTitle :margin-bottom="4" size="h1" tag="h1">
          Need Help? Contact Us
        </BaseTitle>
        <p class="text-body-1 text-medium-emphasis mb-8">
          Choose a department below and our team will be happy to assist you
        </p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" border="start">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Departments Grid -->
    <v-row v-else class="mt-4">
      <v-col
        v-for="department in departments"
        :key="department.id"
        cols="12"
        md="6"
        class="d-flex"
      >
        <BaseCard
          class="department-card h-100 w-100"
          :class="{ 'department-card--hover': !loading }"
          :to="!loading ? `/contacts/${department.slug}` : undefined"
        >
          <div class="d-flex flex-column h-100 pa-6">
            <h3 class="text-h5 mb-4">{{ department.name }}</h3>
            <p class="text-body-1 text-medium-emphasis mb-6 flex-grow-1">
              {{
                department.description || getDefaultDescription(department.name)
              }}
            </p>
            <BaseButton
              :title="`Contact ${department.name}`"
              :to="`/contacts/${department.slug}`"
              variant="text"
              :color="getDepartmentColor(department.slug)"
              prepend-icon="mdi-arrow-right"
              custom-class="px-0"
            >
              Get Support
            </BaseButton>
          </div>
        </BaseCard>
      </v-col>
    </v-row>

    <!-- Popular Articles Section at the bottom -->
    <v-container class="mt-8">
      <HelpPopularArticles />
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNuxtApp } from '#app'
import { useSeo } from '@/composables/seo/useSeo'
import { useAppsStore } from '@/stores/useApps'
import HelpPopularArticles from '@/components/help/HelpPopularArticles.vue'
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

const { $axios } = useNuxtApp()
const appsStore = useAppsStore()

const departments = ref([])
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch app data for SEO and header meta
await appsStore.fetchTalaStageApp()

// Access the app data
const talastageApp = computed(() => appsStore.talastageApp)

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

const getDefaultDescription = (name: string) => {
  return `Our ${name.toLowerCase()} team is ready to assist you with any questions or concerns you may have.`
}

const getDepartmentColor = (slug: string) => {
  switch (slug) {
    case 'general-inquiries':
      return 'primary'
    case 'billing':
      return 'success'
    case 'technical-support':
      return 'warning'
    default:
      return 'primary'
  }
}

onMounted(async () => {
  try {
    const response = await $axios.get('/api/support/departments')
    if (response.data.success) {
      departments.value = response.data.data.sort(
        (a, b) => a.priority - b.priority
      )
    } else {
      error.value = response.data.message || 'Failed to load departments'
    }
  } catch (e) {
    error.value = 'Failed to load departments. Please try again later.'
    console.error('Error:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.max-width {
  max-width: 1280px;
  margin: 0 auto;
}

.department-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.department-card--hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

@media (max-width: 600px) {
  .department-card {
    margin-bottom: 16px;
  }
}
</style>
