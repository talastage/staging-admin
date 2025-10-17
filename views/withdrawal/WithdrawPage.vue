<template>
  <div class="withdraw-content">
    <!-- Compact Header -->
    <div class="withdraw-header mb-4">
      <div class="d-flex align-center">
        <v-avatar size="32" color="warning" class="mr-3">
          <v-icon color="white" size="18">mdi-cash-minus</v-icon>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-bold mb-0">Withdraw Funds</h2>
          <p class="text-caption text-medium-emphasis mb-0">Request a withdrawal from your wallet</p>
        </div>
      </div>
    </div>

    <!-- Compact Amount Input -->
    <v-card class="amount-card mb-4" elevation="1" rounded="lg">
      <v-card-text class="pa-3">
        <div class="text-body-2 text-medium-emphasis mb-2">
          Amount to withdraw
        </div>
        <CurrencyAmountInput
          v-model="withdrawAmount"
          label="0.00"
          :rules="[amountValidation]"
          required
          :disabled="isProcessing"
          :loading="isProcessing"
          :error-messages="errorMessages"
          variant="outlined"
          density="compact"
          class="withdraw-amount-input"
        />
      </v-card-text>
    </v-card>

    <!-- Compact Action Buttons -->
    <div class="action-buttons mb-4">
      <v-btn
        color="warning"
        size="large"
        :loading="isProcessing"
        :disabled="!isValidAmount || isProcessing"
        @click="handleWithdraw"
        class="withdraw-button"
        block
        rounded="lg"
      >
        <v-icon class="mr-2">mdi-cash-minus</v-icon>
        Continue to Withdrawal
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
          <v-icon size="16" color="warning" class="mr-2">mdi-information-outline</v-icon>
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
const withdrawAmount = ref<number | null>(null)
const isProcessing = ref(false)
const errorMessages = ref<string[]>([])
const transactionType = ref('withdrawal')
const selectedPaymentMethod = ref(null)

// Computed properties
const currentBalance = computed(() => {
  return wallet.value?.data?.balance || '0'
})

const isValidAmount = computed(() => {
  return withdrawAmount.value !== null && 
         withdrawAmount.value > 0 && 
         withdrawAmount.value <= parseFloat(currentBalance.value)
})

const transactionInfo = [
  {
    icon: 'mdi-shield-check-outline',
    text: 'Secure transaction with end-to-end encryption',
  },
  {
    icon: 'mdi-cash-check',
    text: 'Withdrawal requests are processed within 1-3 business days',
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
  if (parseFloat(value) > parseFloat(currentBalance.value)) 
    return `Withdrawal amount cannot exceed your current balance of ${currentBalance.value}`
  return true
}

// Reset form
const resetForm = () => {
  withdrawAmount.value = null
  errorMessages.value = []
}

// Handle payment method selection
const selectPaymentMethod = (method: any) => {
  selectedPaymentMethod.value = method
}

// Handle withdrawal action
const handleWithdraw = async () => {
  if (!isValidAmount.value || !currencyStore.selectedCurrency) {
    return
  }

  try {
    isProcessing.value = true
    errorMessages.value = []

    const payload = {
      paying_amount: withdrawAmount.value,
      currency_id: currencyStore.selectedCurrency.id,
      payment_type: 'withdrawal',
      payable_type: 'App\\Models\\Wallet',
      payable_id: wallet.value?.data?.id,
    }

    const response = await $axios.post('/api/cart/items', payload)

    if (response.data?.success) {
      snackStore.success('Withdrawal initiated successfully')
      router.push('/checkout')
    } else {
      throw new Error(response.data?.message || 'Failed to process withdrawal')
    }
  } catch (error: any) {
    console.error('Withdrawal error:', error)
    const errorMessage =
      error.response?.data?.message || 'Failed to process withdrawal request'
    errorMessages.value = [errorMessage]
    snackStore.error(errorMessage)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.withdraw-content {
  width: 100%;
}

.withdraw-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.amount-card {
  background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
  border: 1px solid rgba(255, 152, 0, 0.1);
}

.info-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.withdraw-button {
  font-weight: 600;
  text-transform: none;
  transition: all 0.2s ease;
}

.withdraw-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.info-item {
  min-height: 20px;
}

.action-buttons {
  margin-top: 16px;
}

@media (max-width: 600px) {
  .withdraw-header {
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