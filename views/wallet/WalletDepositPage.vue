<template>
  <div class="deposit-content">
    <!-- Compact Header -->
    <div class="deposit-header mb-4">
      <div class="d-flex align-center">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon color="white" size="18">mdi-cash-plus</v-icon>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-bold mb-0">Add Funds</h2>
          <p class="text-caption text-medium-emphasis mb-0">Deposit money to your wallet</p>
        </div>
      </div>
    </div>

    <!-- Compact Amount Input -->
    <v-card class="amount-card mb-4" elevation="1" rounded="lg">
      <v-card-text class="pa-3">
        <div class="text-body-2 text-medium-emphasis mb-2">
          Amount to deposit
        </div>
        <CurrencyAmountInput
          v-model="depositAmount"
          label="0.00"
          :rules="[amountValidation]"
          required
          :disabled="isProcessing"
          :loading="isProcessing"
          :error-messages="errorMessages"
          variant="outlined"
          density="compact"
          class="deposit-amount-input"
        />
      </v-card-text>
    </v-card>

    <!-- Compact Action Buttons -->
    <div class="action-buttons mb-4">
      <v-btn
        color="primary"
        size="large"
        :loading="isProcessing"
        :disabled="!isValidAmount || isProcessing"
        @click="handleDeposit"
        class="deposit-button"
        block
        rounded="lg"
      >
        <v-icon class="mr-2">mdi-cash-plus</v-icon>
        Continue to Payment
      </v-btn>
      
      <v-btn
        color="grey"
        variant="outlined"
        :disabled="isProcessing"
        @click="resetForm"
        size="small"
        class="mt-2"
        block
        rounded="lg"
      >
        Reset Amount
      </v-btn>
    </div>

    <!-- Compact Info Section -->
    <v-card class="info-card" elevation="1" rounded="lg">
      <v-card-text class="pa-3">
        <div class="text-body-2 font-weight-medium mb-2 d-flex align-center">
          <v-icon size="16" color="primary" class="mr-2">mdi-information-outline</v-icon>
          Important Information
        </div>
        <div class="info-list">
          <div
            v-for="(item, i) in transactionInfo"
            :key="i"
            class="info-item d-flex align-center mb-1"
          >
            <v-icon color="success" size="14" class="mr-2">{{ item.icon }}</v-icon>
            <span class="text-caption">{{ item.text }}</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'
import { useCurrencyStore } from '~/stores/useCurrencies'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'

const router = useRouter()
const snackStore = useSnackMessageStore()
const { $axios } = useNuxtApp()
const { mobile, smAndDown } = useDisplay()

// Store instances
const walletStore = useWalletStore()
const currencyStore = useCurrencyStore()

// Get reactive wallet data using storeToRefs
const { wallet } = storeToRefs(walletStore)

// Reactive state
const depositAmount = ref<number | null>(null)
const isProcessing = ref(false)
const errorMessages = ref<string[]>([])
const transactionType = ref('deposit')
const selectedPaymentMethod = ref(null)

// Computed properties
const currentBalance = computed(() => {
  return wallet.value?.data?.balance || '0'
})

const isValidAmount = computed(() => {
  return depositAmount.value !== null && depositAmount.value > 0
})

const transactionInfo = [
  {
    icon: 'mdi-shield-check-outline',
    text: 'Secure transaction with end-to-end encryption',
  },
  {
    icon: 'mdi-cash-check',
    text: 'Funds available immediately for in-app purchases',
  },
  {
    icon: 'mdi-information-outline',
    text: 'Transaction receipt will be sent to your email',
  },
]

// Initialize required data
onMounted(async () => {
  try {
    if (!currencyStore.isFetched) {
      await currencyStore.fetchCurrencies()
    }
    await walletStore.fetchWallet()
  } catch (error) {
    snackStore.error('Failed to load wallet information')
  }
})

// Validation rules
const amountValidation = (value: any) => {
  if (!value) return 'Amount is required'
  if (isNaN(value) || value <= 0) return 'Please enter a valid amount'
  return true
}

// Reset form
const resetForm = () => {
  depositAmount.value = null
  errorMessages.value = []
}

// Handle payment method selection
const selectPaymentMethod = (method: any) => {
  selectedPaymentMethod.value = method
}

// Handle deposit action
const handleDeposit = async () => {
  if (!isValidAmount.value || !currencyStore.selectedCurrency) {
    return
  }

  try {
    isProcessing.value = true
    errorMessages.value = []

    const payload = {
      paying_amount: depositAmount.value,
      currency_id: currencyStore.selectedCurrency.id,
      payment_type: 'deposit',
      payable_type: 'App\\Models\\Wallet',
      payable_id: wallet.value?.data?.id,
    }

    const response = await $axios.post('/api/cart/items', payload)

    if (response.data?.success) {
      snackStore.success('Deposit initiated successfully')
      router.push('/checkout')
    } else {
      throw new Error(response.data?.message || 'Failed to process deposit')
    }
  } catch (error: any) {
    console.error('Deposit error:', error)
    const errorMessage =
      error.response?.data?.message || 'Failed to process deposit request'
    errorMessages.value = [errorMessage]
    snackStore.error(errorMessage)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.deposit-content {
  width: 100%;
}

.deposit-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.amount-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 1px solid rgba(98, 0, 234, 0.1);
}

.info-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.deposit-button {
  font-weight: 600;
  text-transform: none;
  transition: all 0.2s ease;
}

.deposit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(98, 0, 234, 0.3);
}

.info-item {
  min-height: 20px;
}

.action-buttons {
  margin-top: 16px;
}

@media (max-width: 600px) {
  .deposit-header {
    text-align: center;
    padding-bottom: 12px;
  }
  
  .amount-card,
  .info-card {
    margin: 0 -8px 16px -8px;
  }
  
  .action-buttons {
    margin: 16px -8px 0 -8px;
  }
}
</style>
