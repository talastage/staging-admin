<template>
  <v-container fluid>
    <div class="premiering-content">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Category Selection -->
          <v-card class="mb-6 pa-6" elevation="10">
            <div class="text-center mb-4">
              <h2 class="text-h5 font-weight-bold mb-2">
                Start premiering by selecting a category that best fits your
                content.
              </h2>
            </div>
            <CategorySelectDropdown
              v-model="selectedCategory"
              :items="categories"
              :is-loading="categoriesLoading"
              :disabled="requirementsStore.loading"
              :pre-selected-item="preSelectedCategory"
              @item-selected="handleCategorySelection"
              :label="'Select Premiering Category'"
              :placeholder="'Choose a category...'"
              :error-message="requirementsStore.error"
              item-title="name"
              item-value="slug"
            />
          </v-card>

          <!-- Requirements Loading Skeletons -->
          <template v-if="requirementsStore.loading">
            <v-row>
              <v-col cols="12" md="6">
                <v-skeleton-loader type="card" height="200" class="mb-4" />
              </v-col>
              <v-col cols="12" md="6">
                <v-skeleton-loader type="card" height="200" class="mb-4" />
              </v-col>
            </v-row>
            <v-skeleton-loader type="card" height="100" class="mt-4" />
          </template>

          <!-- Requirements Data -->
          <div v-else-if="showRequirements">
            <v-row class="mb-3">
              <v-col cols="12" md="6">
                <v-card flat>
                  <v-card-title class="text-subtitle-1 py-2"
                    >Main Video Requirements</v-card-title
                  >
                  <v-divider />
                  <v-card-text class="pa-2">
                    <PremieringMediaRequirements
                      :loading="requirementsStore.loading"
                      :error="requirementsStore.error"
                      :max-size="requirementsStore.mainRequirements.maxSize"
                      :resolution="
                        requirementsStore.mainRequirements.resolution
                      "
                      :format="requirementsStore.mainRequirements.format"
                      :duration="requirementsStore.mainRequirements.duration"
                      layout="vertical"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card flat>
                  <v-card-title class="text-subtitle-1 py-2"
                    >Trailer Requirements</v-card-title
                  >
                  <v-divider />
                  <v-card-text class="pa-2">
                    <PremieringMediaRequirements
                      :loading="requirementsStore.loading"
                      :error="requirementsStore.error"
                      :max-size="requirementsStore.trailerRequirements.maxSize"
                      :resolution="
                        requirementsStore.trailerRequirements.resolution
                      "
                      :format="requirementsStore.trailerRequirements.format"
                      :duration="requirementsStore.trailerRequirements.duration"
                      layout="vertical"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Payment Section - Always displayed -->
            <PaymentConfirmationCard
              :amount="
                requirementsStore.requirements?.premiering_fee?.amount || 0
              "
              :currency-symbol="
                requirementsStore.requirements?.premiering_fee?.currency
                  ?.symbol || ''
              "
              :currency-code="
                requirementsStore.requirements?.premiering_fee?.currency
                  ?.code || ''
              "
              :loading="requirementsStore.loading"
              :disabled="!isEligible"
              :payment-label="paymentLabel"
            >
              <template #actions>
                <!-- Continue Button - Only shown when wallet is eligible -->
                <BaseButton
                  v-if="isEligible"
                  title="Continue To Upload"
                  :action="handleContinue"
                  :loading="requirementsStore.loading"
                  :disabled="!isEligible"
                  color="primary"
                  variant="elevated"
                  :full-width="true"
                  :elevation="1"
                  custom-class="continue-button"
                  height="48"
                />
              </template>
            </PaymentConfirmationCard>

            <!-- Wallet Status Alert displayed separately when wallet is not eligible -->
            <WalletStatusAlert
              v-if="!isEligible"
              :amount="paymentFee.amount"
              :currency="paymentFee.currency"
              :wallet-status="walletStatus"
              :payment-label="paymentLabel"
              :insufficient-funds-message="insufficientFundsMessage"
              @validate="handleWalletValidation"
              class="mt-4"
            />
          </div>

          <!-- Help Section -->
          <v-row v-else justify="center" class="mt-8">
            <v-col cols="12" md="8" class="text-center">
              <v-divider class="mb-8" />
              <h3 class="text-h5 mb-4">Need Help Getting Started?</h3>
              <p class="text-medium-emphasis mb-4">
                Our support team is here to help you through the premiering
                process.
              </p>
              <v-btn color="primary" variant="tonal" @click="navigateToHelp">
                <v-icon start>mdi-help-circle</v-icon>
                View Premiering Guide
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'
import { usePremieringMediaUploadRequirementsStore } from '~/stores/premiering/usePremieringMediaUploadRequirementsStore'
import { usePremieringCategoriesStore } from '~/stores/usePremieringCategoriesStore'
import { useWalletStatus } from '~/composables/useWalletStatus'
import type { PremieringCategoryBase } from '~/types/PremieringCategoryBase'

// Initialize stores
const walletStore = useWalletStore()
const requirementsStore = usePremieringMediaUploadRequirementsStore()
const categoriesStore = usePremieringCategoriesStore()
const router = useRouter()

// Local state
const selectedCategory = ref<PremieringCategoryBase | null>(null)
const preSelectedCategory = ref<PremieringCategoryBase | null>(null)
const isInitializing = ref(true)
const walletValidationData = ref(null)

// Computed properties for categories
const categories = computed(() => categoriesStore.categories)
const categoriesLoading = computed(
  () => categoriesStore.loading && categories.value.length === 0
)

const paymentFee = computed(() => ({
  amount: requirementsStore.requirements?.premiering_fee?.amount || 0,
  currency: {
    id: requirementsStore.requirements?.premiering_fee?.currency?.id || 0,
    name: requirementsStore.requirements?.premiering_fee?.currency?.name || '',
    code: requirementsStore.requirements?.premiering_fee?.currency?.code || '',
    symbol:
      requirementsStore.requirements?.premiering_fee?.currency?.symbol || '',
  },
}))

const paymentLabel = computed(() => {
  const categoryName =
    requirementsStore.selectedCategory?.name || 'Selected Category'
  return `Premiering Fee for ${categoryName}`
})

// Use the updated wallet status composable
const { status: walletStatus, isEligible } = useWalletStatus(paymentFee)

const insufficientFundsMessage = computed(() => {
  const currencyCode = paymentFee.value.currency.code
  const requiredAmount = paymentFee.value.amount
  const currentBalance = walletStore.currentBalance
  return `You need ${currencyCode}${requiredAmount} to proceed, but your current balance is ${currencyCode}${currentBalance}.`
})

const showRequirements = computed(
  () =>
    requirementsStore.requirements &&
    !requirementsStore.loading &&
    !requirementsStore.error
)

// Handle wallet validation from the WalletStatusAlert component
const handleWalletValidation = (validationData) => {
  walletValidationData.value = validationData
}

// Watch for categories to be loaded and set pre-selected category
watch(
  () => categories.value,
  (newCategories) => {
    if (isInitializing.value && newCategories.length > 0) {
      const musicVideosCategory = newCategories.find(
        (cat) => cat.slug === 'music-video'
      )
      if (musicVideosCategory) {
        preSelectedCategory.value = musicVideosCategory
        selectedCategory.value = musicVideosCategory
        handleCategorySelection(musicVideosCategory)
      }
      isInitializing.value = false
    }
  },
  { immediate: true }
)

const handleCategorySelection = async (
  category: PremieringCategoryBase | null
) => {
  if (!category) return
  try {
    requirementsStore.error = null
    selectedCategory.value = category
    await requirementsStore.selectCategory(category)
  } catch (error) {
    console.error('Error selecting category:', error)
    if (category) {
      requirementsStore.error =
        'Unable to load category requirements. Please try again.'
    }
  }
}

const handleContinue = () => {
  if (isEligible && requirementsStore.selectedCategory) {
    const slug = requirementsStore.selectedCategory.slug
    if (slug) router.push(`/premiering/${slug}`)
    else console.error('Selected category does not have a slug.')
  }
}

const navigateToHelp = () => {
  router.push('/help/premiering-guide')
}

onMounted(async () => {
  try {
    // Parallel fetching of wallet and categories for better performance
    const promises = []

    if (!walletStore.wallet) {
      promises.push(walletStore.fetchWallet())
    }

    if (!categories.value.length) {
      promises.push(categoriesStore.fetchCategories())
    }

    await Promise.all(promises)
  } catch (error) {
    console.error('Error during initialization:', error)
  }
})

onUnmounted(() => {
  requirementsStore.resetState()
})
</script>

<style scoped>
.premiering-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.v-card {
  padding: 1.5rem !important;
}

@media (max-width: 960px) {
  .premiering-content {
    padding: 1.5rem;
  }
}

@media (max-width: 600px) {
  .premiering-content {
    padding: 1rem 0.5rem;
  }
  .text-h3 {
    font-size: 2rem !important;
  }
  .text-h4 {
    font-size: 1.5rem !important;
  }
  .v-card {
    padding: 1rem !important;
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Additional styling for the continue button */
.continue-button {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
  height: 48px !important;
  font-size: 16px !important;
  min-width: 180px !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
  white-space: nowrap !important;
}
</style>
