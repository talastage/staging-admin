<!-- pages/premiering/[premiering_category_slug].vue -->
<template>
  <v-container fluid>
    <!-- Loading State -->
    <v-overlay
      v-model="isLoading"
      class="align-center justify-center"
      persistent
    >
      <div class="d-flex flex-column align-center">
        <v-progress-circular indeterminate size="64" />
        <span class="mt-2">Loading...</span>
      </div>
    </v-overlay>

    <div v-if="!isLoading" class="premiering-page">
      <!-- Validation Warning -->
      <v-alert
        v-if="!isValidAccess"
        type="warning"
        variant="tonal"
        closable
        class="mb-6"
      >
        <template #prepend>
          <v-icon icon="mdi-alert-circle" />
        </template>
        <div class="d-flex flex-column gap-2">
          <div class="font-weight-bold">Important Notice</div>
          <div>
            Please review the premiering requirements and fees before
            proceeding.
          </div>
          <v-btn
            color="warning"
            variant="tonal"
            size="small"
            class="mt-2"
            @click="redirectToHome"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Review Requirements
          </v-btn>
        </div>
      </v-alert>

      <!-- Main Content -->
      <v-row v-if="canShowContent" justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Header -->
          <BaseHeader
            :title="category?.name || 'Premiering'"
            :subtitle="category?.description"
            class="mb-6"
          >
            <template #additional>
              <v-chip color="primary" variant="tonal" class="mt-2">
                {{ category?.slug }}
              </v-chip>
            </template>
          </BaseHeader>

          <!-- Premiere Constraints -->
          <PremieringVideoConstraints :fee-data="store.feeData" />

          <!-- Conditional rendering based on balance -->
          <template v-if="store.isInsufficientBalance">
            <WalletInsufficientFund
              :message="store.insufficientFundsMessage"
              :require-amount="store.amountToPay"
              :current-balance="walletStore.currentBalance"
              class="mt-4"
              @close="handleClose"
            />
          </template>
          <template v-else>
            <!-- Premiering Form Content -->
            <div class="premiering-form mt-6">
              <!-- Your form content will go here -->
              <v-card elevation="10" class="pa-4">
                <v-card-title class="px-0"> Upload Your Content </v-card-title>
                <!-- Form components will go here -->
              </v-card>
            </div>
          </template>

          <!-- Error Alert -->
          <v-alert
            v-if="store.error"
            type="error"
            variant="tonal"
            closable
            class="mt-4"
            @click:close="store.error = null"
          >
            {{ store.error }}
          </v-alert>
        </v-col>
      </v-row>

      <!-- Invalid Category Error -->
      <v-alert
        v-else-if="!category && !isLoading"
        type="error"
        variant="tonal"
        class="mb-6"
      >
        <template #prepend>
          <v-icon icon="mdi-alert" />
        </template>
        <div class="d-flex flex-column gap-2">
          <div class="font-weight-bold">Invalid Category</div>
          <div>The requested premiering category does not exist.</div>
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            class="mt-2"
            @click="redirectToHome"
          >
            <v-icon start>mdi-home</v-icon>
            Return to Home
          </v-btn>
        </div>
      </v-alert>

      <!-- Help Section -->
      <v-row
        v-if="!showFeeData && !store.loading"
        justify="center"
        class="mt-8"
      >
        <v-col cols="12" md="8" class="text-center">
          <v-divider class="mb-8" />
          <h3 class="text-h5 mb-4">Need Help Getting Started?</h3>
          <p class="text-medium-emphasis mb-4">
            Our support team is here to help you through the premiering process.
          </p>
          <v-btn color="primary" variant="tonal" @click="navigateToHelp">
            <v-icon start>mdi-help-circle</v-icon>
            View Premiering Guide
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter, navigateTo } from '#app'
import { useStartPremieringStore } from '~/stores/useStartPremieringStoreREMOVE'
import { usePremieringCategoriesStore } from '~/stores/usePremieringCategoriesStore'
import { useWalletStore } from '~/stores/useWalletStore'

const route = useRoute()
const router = useRouter()
const store = useStartPremieringStore()
const categoryStore = usePremieringCategoriesStore()
const walletStore = useWalletStore()

const isLoading = ref(true)
const hasAcknowledgedWarning = ref(false)

// Get category slug from route
const categorySlug = computed(
  () => route.params.premiering_category_slug as string
)

// Check if the access is valid (came through proper flow)
const isValidAccess = computed(() => {
  return store.feeData && store.selectedCategory?.slug === categorySlug.value
})

// Determine if we can show the main content
const canShowContent = computed(() => {
  return isValidAccess.value || hasAcknowledgedWarning.value
})

// Get category details
const category = computed(() => {
  return categoryStore.categories.find((cat) => cat.slug === categorySlug.value)
})

// Show fee data computed
const showFeeData = computed(
  () => store.feeData && !store.loading && !store.error
)

// Initialize page
async function initializePage() {
  isLoading.value = true

  try {
    // Fetch categories if not available
    if (!categoryStore.categories.length) {
      await categoryStore.fetchCategories()
    }

    // If category exists but no fee data, fetch it
    if (category.value && !store.feeData) {
      await store.selectCategory(category.value)
    }

    // Validate category existence
    if (!category.value) {
      throw new Error('Invalid category')
    }

    // Check wallet balance if needed
    if (!store.hasCheckedBalance) {
      await store.checkWalletBalance()
    }

    // If insufficient balance, redirect to home
    if (store.isInsufficientBalance) {
      await redirectToHome()
      return
    }
  } catch (error) {
    console.error('Error initializing page:', error)
    store.error = 'Failed to load premiering details. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Handle close
const handleClose = () => {
  store.error = null
  redirectToHome()
}

// Redirect to home page
async function redirectToHome() {
  await navigateTo('/')
}

// Navigate to help
const navigateToHelp = () => {
  navigateTo('/help/premiering-guide')
}

// Middleware
definePageMeta({
  middleware: [
    async function (to, from) {
      if (from.path === '/') {
        return
      }

      const categoryStore = usePremieringCategoriesStore()
      if (!categoryStore.categories.length) {
        await categoryStore.fetchCategories()
      }

      const categoryExists = categoryStore.categories.some(
        (cat) => cat.slug === to.params.premiering_category_slug
      )

      if (!categoryExists) {
        return navigateTo('/')
      }
    },
  ],
})

// Watch for route changes
watch(
  () => route.params.premiering_category_slug,
  async (newSlug) => {
    if (newSlug) {
      await initializePage()
    }
  }
)

onMounted(async () => {
  await initializePage()
})
</script>

<style scoped>
.premiering-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

@media (max-width: 600px) {
  .premiering-page {
    padding: 0.5rem;
  }
}
</style>
