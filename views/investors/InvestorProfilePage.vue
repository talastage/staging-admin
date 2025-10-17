<template>
  <div class="investor-profile">
    <!-- Loading State -->
    <v-skeleton-loader v-if="loading" type="article" class="mb-4" />

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Content State -->
    <template v-else-if="page">
      <!-- Page Header Section -->
      <v-container class="header-section mb-4">
        <v-row>
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center">
                <v-avatar size="120" class="mr-4">
                  <v-img :src="page.avatar_url" :alt="page.name" />
                </v-avatar>
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h4 font-weight-bold mb-1">
                      {{ page.name }}
                      <v-icon
                        v-if="page.is_verified"
                        color="primary"
                        class="ml-2"
                      >
                        mdi-check-decagram
                      </v-icon>
                    </h1>
                  </div>
                  <div class="text-subtitle-1 mb-2">{{ page.tagline }}</div>
                  <div class="d-flex align-center">
                    <v-chip v-if="page.country" size="small" class="mr-2">
                      <v-icon start size="small">mdi-map-marker</v-icon>
                      {{ page.country.name }}
                    </v-chip>
                    <v-chip v-if="page.category" size="small">
                      <v-icon start size="small">mdi-briefcase</v-icon>
                      {{ page.category.name }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <!-- Page Actions -->
              <div class="d-flex align-center">
                <!-- Edit Button -->
                <v-btn
                  v-if="canEditPage"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  class="mr-2"
                  @click="openEditDialog"
                >
                  Edit Page
                </v-btn>

                <!-- Management Menu -->
                <v-menu v-if="canManagePage">
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item v-if="canDeletePage" @click="handleDeletePage">
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title class="text-error"
                        >Delete Page</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Main Content Section -->
      <v-container>
        <v-row>
          <!-- Main Content Area -->
          <v-col cols="12" md="8">
            <v-card>
              <v-tabs v-model="activeTab" background-color="primary" dark>
                <v-tab value="home">
                  <v-icon start>mdi-home</v-icon>
                  Home
                </v-tab>
                <v-tab value="about">
                  <v-icon start>mdi-information</v-icon>
                  About
                </v-tab>
                <v-tab value="investments">
                  <v-icon start>mdi-chart-line</v-icon>
                  Investments
                </v-tab>
              </v-tabs>

              <v-window v-model="activeTab">
                <!-- Home Tab -->
                <v-window-item value="home">
                  <v-card-text>
                    <div class="mb-4">
                      <h3 class="text-h6 mb-2">Description</h3>
                      <p>{{ page.description }}</p>
                    </div>
                  </v-card-text>
                </v-window-item>

                <!-- About Tab -->
                <v-window-item value="about">
                  <v-card-text>
                    <PageAboutTab :page="page" />
                  </v-card-text>
                </v-window-item>

                <!-- Investments Tab -->
                <v-window-item value="investments">
                  <v-card-text>
                    <PageInvestmentsTab :page="page" />
                  </v-card-text>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>

          <!-- Sidebar -->
          <v-col cols="12" md="4">
            <!-- Related Pages -->
            <v-card class="mb-4">
              <v-card-title>
                <v-icon start>mdi-account-group</v-icon>
                Related Pages
              </v-card-title>
              <v-card-text>
                <v-list v-if="page.related_pages?.length">
                  <v-list-item
                    v-for="relatedPage in page.related_pages"
                    :key="relatedPage.id"
                    :to="`/investors/${relatedPage.slug}`"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="40">
                        <v-img :src="relatedPage.avatar_url" />
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{
                      relatedPage.name
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      relatedPage.tagline
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <div v-else class="text-center pa-4">
                  No related pages found
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <!-- Edit Page Dialog -->
    <BaseDialog
      v-model="showEditDialog"
      title="Edit Page Information"
      max-width="800px"
    >
      <PageEditForm
        :page="page"
        @saved="handlePageUpdate"
        @cancel="showEditDialog = false"
      />
    </BaseDialog>
  </div>
</template>

<!-- pages/investors/[pageSlug].vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSnackMessageStore } from '@/stores/useSnackMessage'
import { usePagePermissions } from '@/composables/usePagePermissions'

definePageMeta({
  layout: 'page-layout',
})

const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()
const auth = useAuthStore()
const snackStore = useSnackMessageStore()

// State
const page = ref(null)
const loading = ref(true)
const error = ref(null)
const activeTab = ref('home')
const showEditDialog = ref(false)

// Page Permissions
const { canEditPage, canDeletePage, canManagePage } = usePagePermissions(page)

// Methods
const fetchPageData = async () => {
  try {
    loading.value = true
    error.value = null

    const { data } = await $axios.get(`/api/pages/${route.params.pageSlug}`)
    page.value = data.data
  } catch (err) {
    console.error('Error fetching page:', err)
    error.value = err.response?.data?.message || 'Failed to load page data'

    if (err.response?.status === 404) {
      router.push('/404')
    }
  } finally {
    loading.value = false
  }
}

const openEditDialog = () => {
  if (!canEditPage.value) {
    snackStore.error('You do not have permission to edit this page')
    return
  }
  showEditDialog.value = true
}

const handlePageUpdate = async (updatedData) => {
  if (!canEditPage.value) {
    snackStore.error('You do not have permission to update this page')
    return
  }

  try {
    loading.value = true
    const { data } = await $axios.put(
      `/api/pages/${route.params.pageSlug}`,
      updatedData
    )
    page.value = data.data
    showEditDialog.value = false
    snackStore.success('Page updated successfully')
  } catch (err) {
    console.error('Error updating page:', err)
    snackStore.error(err.response?.data?.message || 'Failed to update page')

    if (err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors
    }
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchPageData()
})
</script>

<style scoped>
.investor-profile {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 960px) {
  .v-col-md-8,
  .v-col-md-4 {
    padding: 12px;
  }
}
</style>
