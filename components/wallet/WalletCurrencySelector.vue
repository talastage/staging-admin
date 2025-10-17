<!-- components/wallet/WalletCurrencySelector.vue -->
<template>
  <div class="wallet-currency-selector">
    <div class="currency-header mb-4">
      <div class="text-center">
        <v-avatar size="40" color="primary" class="mb-3">
          <v-icon color="white" size="20">mdi-currency-usd</v-icon>
        </v-avatar>
        <h3 class="text-h6 font-weight-bold mb-2">Select Currency</h3>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Choose your wallet's default currency
        </p>
      </div>
    </div>

    <div class="current-currency-info mb-4" v-if="userCurrency">
      <v-card class="current-currency-card" elevation="1" rounded="lg">
        <v-card-text class="pa-3">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3">
              <img
                v-if="userCurrency.country_flag"
                :src="getFullImagePath(userCurrency.country_flag)"
                :alt="userCurrency.country_name || userCurrency.code"
                class="currency-flag"
                @error="onImageError"
              />
              <span v-else class="text-caption font-weight-bold">{{ userCurrency.symbol }}</span>
            </v-avatar>
            <div class="flex-grow-1 min-width-0">
              <div class="text-caption text-medium-emphasis">Current Currency</div>
              <div class="text-body-1 font-weight-medium text-truncate">
                {{ userCurrency.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ userCurrency.code }} • {{ userCurrency.symbol }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-form ref="form" @submit.prevent="submitForm">
      <div class="currency-selector-section mb-4">
        <CurrencyCountrySelector
          v-model="selectedCurrencyId"
          label="Select Currency"
          density="compact"
        />
      </div>

      <div class="action-buttons mt-4">
        <v-btn
          v-if="allowSkip && userCurrency"
          variant="outlined"
          @click="skipSelection"
          :disabled="isLoading"
          size="small"
          class="mb-2"
          block
        >
          <v-icon start size="16">mdi-skip-next</v-icon>
          Keep Current
        </v-btn>

        <v-btn
          color="primary"
          type="submit"
          :loading="isLoading"
          :disabled="!selectedCurrencyId || isLoading"
          size="default"
          block
        >
          <v-icon start size="18">mdi-check</v-icon>
          {{ hasSelectedNewCurrency ? 'Confirm Currency' : 'Save Currency' }}
        </v-btn>
      </div>
    </v-form>

    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="5000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNuxtApp } from '#app'
import { useWalletStore } from '~/stores/useWalletStore'
import { useWalletActivationStore } from '~/stores/useWalletActivationStore'
import { useCurrencies } from '~/composables/useCurrencies'

// Props
const props = defineProps({
  walletId: {
    type: Number,
    default: null,
  },
  allowSkip: {
    type: Boolean,
    default: false,
  },
  preselectedCurrencyId: {
    type: Number,
    default: null,
  },
})

// Emits
const emit = defineEmits(['success', 'skip', 'error'])

// Stores
const walletStore = useWalletStore()
const activationStore = useWalletActivationStore()

// Get currencies and user currency
const { userCurrency, currencies } = useCurrencies()

// Reactive references
const selectedCurrencyId = ref(props.preselectedCurrencyId)
const isLoading = ref(false)
const errorMessage = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const form = ref(null)
const initialCurrencyId = ref(null) // Store initial currency ID to detect changes

// Methods
const submitForm = async () => {
  if (!selectedCurrencyId.value) return

  try {
    isLoading.value = true
    errorMessage.value = ''

    // Determine wallet ID from available sources
    let walletId = props.walletId
    if (!walletId && activationStore.walletId) {
      walletId = activationStore.walletId
    } else if (!walletId && walletStore.wallet?.id) {
      walletId = walletStore.wallet.id
    } else if (!walletId && activationStore.activationStatus?.wallet?.id) {
      walletId = activationStore.activationStatus.wallet.id
    }

    // Fallback: Fetch wallet ID from API if not found
    if (!walletId) {
      const { $axios } = useNuxtApp()
      const response = await $axios.get('/api/wallet')
      walletId = response.data.data.id
    }

    if (!walletId) {
      throw new Error('No wallet found. Please try again later.')
    }

    // Submit currency selection to complete wallet activation
    const { $axios } = useNuxtApp()
    const result = await $axios.post('/api/wallet/activation/complete', {
      currency_id: selectedCurrencyId.value,
    })

    showSuccess('Wallet activated successfully')
    emit('success', result.data)
  } catch (error: any) {
    console.error('Currency selection error:', error)
    showError(
      error.response?.data?.message ||
        error.message ||
        'Failed to update currency'
    )
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

const skipSelection = async () => {
  try {
    isLoading.value = true

    // Complete activation without a currency
    const { $axios } = useNuxtApp()
    const result = await $axios.post('/api/wallet/activation/complete')

    emit('skip', result.data)
  } catch (error: any) {
    showError(
      error.response?.data?.message ||
        error.message ||
        'Failed to complete activation'
    )
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

const showSuccess = (message: string) => {
  snackbarText.value = message
  snackbarColor.value = 'success'
  showSnackbar.value = true
}

const showError = (message: string) => {
  errorMessage.value = message
  snackbarText.value = message
  snackbarColor.value = 'error'
  showSnackbar.value = true
}

// Helper function to get full image path
const getFullImagePath = (imagePath: string) => {
  if (!imagePath) return ''

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath

  // If it starts with /, it's relative to domain root
  if (imagePath.startsWith('/')) {
    // You might need to adjust this based on your API base URL
    const config = useRuntimeConfig()
    return `${config.public.apiBase || ''}${imagePath}`
  }

  return imagePath
}

const onImageError = (event: Event) => {
  console.warn('Failed to load currency flag image:', event)
  // You could hide the img element or replace with a placeholder
}

// Computed property to check if user has selected a new currency
const hasSelectedNewCurrency = computed(() => {
  return (
    selectedCurrencyId.value !== initialCurrencyId.value &&
    selectedCurrencyId.value !== null
  )
})

// Lifecycle hooks
onMounted(() => {
  // Set preselected currency if provided
  if (props.preselectedCurrencyId) {
    selectedCurrencyId.value = props.preselectedCurrencyId
  }

  // Store the initial currency ID for comparison
  if (userCurrency?.id) {
    initialCurrencyId.value = userCurrency.id
    // If no preselected currency, use the user's current currency
    if (!selectedCurrencyId.value) {
      selectedCurrencyId.value = userCurrency.id
    }
  }
  // CurrencyCountrySelector will handle default selection if no preselected value
})
</script>

<style scoped>
.wallet-currency-selector {
  width: 100%;
}

.currency-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.current-currency-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.min-width-0 {
  min-width: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.currency-flag {
  width: 20px;
  height: 15px;
  object-fit: cover;
  border-radius: 2px;
}

.currency-selector-section {
  margin: 16px 0;
}

.action-buttons {
  margin-top: 20px;
}

@media (max-width: 600px) {
  .currency-header {
    padding-bottom: 12px;
  }
  
  .current-currency-info {
    margin: 0 -8px 16px -8px;
  }
  
  .action-buttons {
    margin: 16px -8px 0 -8px;
  }
}
</style>
