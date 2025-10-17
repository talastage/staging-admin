<template>
  <div class="wallet-status-compact">
    <!-- Wallet Inactive - Compact Alert -->
    <v-card
      v-if="!isWalletActive"
      class="inactive-card"
      elevation="2"
      rounded="lg"
    >
      <v-card-text class="pa-3">
        <div class="d-flex align-center mb-2">
          <v-icon color="warning" size="20" class="mr-2"
            >mdi-wallet-outline</v-icon
          >
          <span class="text-body-2 font-weight-medium"
            >Wallet Activation Required</span
          >
        </div>
        <p class="text-caption text-medium-emphasis mb-3">
          To complete this payment, please activate your wallet first.
        </p>
        <div class="d-flex gap-2">
          <v-btn
            size="small"
            color="warning"
            variant="elevated"
            @click="navigateToActivate"
          >
            Activate Now
          </v-btn>
          <v-btn
            size="small"
            color="grey"
            variant="outlined"
            @click="navigateToHelp"
          >
            Need Help?
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Insufficient Funds - Compact Alert -->
    <v-card
      v-else-if="insufficientFunds"
      class="insufficient-card"
      elevation="2"
      rounded="lg"
    >
      <v-card-text class="pa-3">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon color="warning" size="20" class="mr-2"
              >mdi-cash-remove</v-icon
            >
            <span class="text-body-2 font-weight-medium"
              >Insufficient Balance</span
            >
          </div>
          <v-chip size="small" color="warning" variant="tonal">
            {{ balancePercentage.toFixed(0) }}% available
          </v-chip>
        </div>

        <!-- Compact Balance Display -->
        <div class="balance-row mb-2">
          <div class="balance-item">
            <span class="text-caption text-medium-emphasis">Balance:</span>
            <span class="text-body-2 font-weight-bold text-success">{{
              formattedWalletBalance
            }}</span>
          </div>
          <v-icon size="16" color="grey">mdi-arrow-right</v-icon>
          <div class="balance-item">
            <span class="text-caption text-medium-emphasis">Required:</span>
            <span class="text-body-2 font-weight-bold text-error">{{
              formattedAmount
            }}</span>
          </div>
        </div>

        <v-progress-linear
          :model-value="balancePercentage"
          color="warning"
          bg-color="grey-lighten-4"
          height="4"
          rounded
          class="mb-3"
        ></v-progress-linear>

        <p class="text-caption text-medium-emphasis mb-3">
          Please deposit funds to your wallet to complete this payment.
        </p>

        <div class="d-flex gap-2">
          <v-btn
            size="small"
            color="primary"
            variant="elevated"
            @click="navigateToDeposit"
          >
            Add Funds
          </v-btn>
          <v-btn
            size="small"
            color="grey"
            variant="outlined"
            @click="navigateToHelp"
          >
            Need Help?
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Sufficient Funds - Compact Success -->
    <v-card
      v-else-if="showSuccessAlert"
      class="success-card"
      elevation="1"
      rounded="lg"
    >
      <v-card-text class="pa-3">
        <div class="d-flex align-center">
          <v-icon color="success" size="20" class="mr-2"
            >mdi-check-circle</v-icon
          >
          <div>
            <span class="text-body-2 font-weight-medium text-success"
              >Ready to Pay</span
            >
            <div class="text-caption text-medium-emphasis">
              Balance: {{ formattedWalletBalance }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Error States - Compact -->
    <v-card
      v-else-if="walletStatus === 'error'"
      class="error-card"
      elevation="2"
      rounded="lg"
    >
      <v-card-text class="pa-3">
        <div class="d-flex align-center mb-2">
          <v-icon color="error" size="20" class="mr-2">mdi-alert</v-icon>
          <span class="text-body-2 font-weight-medium">Wallet Error</span>
        </div>
        <p class="text-caption text-medium-emphasis mb-3">{{ errorMessage }}</p>
        <v-btn
          size="small"
          color="grey"
          variant="outlined"
          @click="navigateToHelp"
        >
          Get Support
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '~/stores/useWalletStore'

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: Object,
    required: true,
    default: () => ({
      id: 0,
      code: 'RWF',
      symbol: 'RWF',
    }),
  },
  // UI Configuration
  useCompactLayout: {
    type: Boolean,
    default: false,
  },
  hideCompactLayout: {
    type: Boolean,
    default: false,
  },
  showSuccessAlert: {
    type: Boolean,
    default: true,
  },
  // Custom messages
  inactiveMessage: {
    type: String,
    default: 'Your wallet is inactive. Please activate it to continue.',
  },
  insufficientFundsMessage: {
    type: String,
    default: 'Insufficient wallet balance',
  },
  successMessage: {
    type: String,
    default: 'Your wallet has sufficient funds for this payment',
  },
  currencyMismatchMessage: {
    type: String,
    default: 'Currency mismatch between wallet and payment',
  },
  errorMessage: {
    type: String,
    default: 'Unable to verify wallet status. Please try again later.',
  },
  // Custom labels
  balanceLabel: {
    type: String,
    default: 'Available Balance',
  },
  paymentLabel: {
    type: String,
    default: 'Payment Amount',
  },
  // Button text
  activateButtonText: {
    type: String,
    default: 'Activate Wallet',
  },
  depositButtonText: {
    type: String,
    default: 'Deposit Funds',
  },
  // Externally provided wallet status (optional)
  walletStatus: {
    type: String,
    default: '',
    validator: (value) => {
      return [
        '',
        'active',
        'inactive',
        'insufficient',
        'sufficient',
        'currencyMismatch',
        'error',
      ].includes(value)
    },
  },
})

const emit = defineEmits(['validate', 'deposit-click', 'activate-click'])

const router = useRouter()
const walletStore = useWalletStore()

// Fetch wallet data on mount if not already loaded
onMounted(async () => {
  if (!walletStore.wallet) {
    await walletStore.fetchWallet()
  }
})

// Currency and balance formatting
function formatAmount(amount, currencySymbol, currencyCode) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'RWF',
      currencyDisplay: 'symbol',
    })
      .format(amount)
      .replace(currencyCode, currencySymbol || currencyCode)
  } catch (e) {
    return `${currencySymbol || currencyCode}${amount.toFixed(2)}`
  }
}

const walletCurrency = computed(() => {
  return walletStore.currentCurrency || { code: 'RWF', symbol: 'RWF' }
})

const formattedWalletBalance = computed(() => {
  if (!walletStore.currentBalance) {
    return walletCurrency.value?.code
      ? `${walletCurrency.value.symbol || walletCurrency.value.code}0.00`
      : 'RWF0.00'
  }

  return formatAmount(
    Number(walletStore.currentBalance),
    walletCurrency.value.symbol || walletCurrency.value.code,
    walletCurrency.value.code
  )
})

const formattedAmount = computed(() => {
  if (!props.amount) {
    return props.currency?.code
      ? `${props.currency.symbol || props.currency.code}0.00`
      : 'RWF0.00'
  }

  return formatAmount(
    props.amount,
    props.currency.symbol || props.currency.code,
    props.currency.code
  )
})

// Determine wallet status based on props and store
const isWalletActive = computed(() => {
  if (props.walletStatus === 'inactive') return false
  if (
    props.walletStatus === 'active' ||
    props.walletStatus === 'sufficient' ||
    props.walletStatus === 'insufficient'
  )
    return true
  return walletStore.isWalletActive
})

const insufficientFunds = computed(() => {
  if (props.walletStatus === 'insufficient') return true
  if (props.walletStatus === 'sufficient') return false

  const balance = Number(walletStore.currentBalance || 0)

  // If currencies match, perform direct comparison
  if (walletCurrency.value?.code === props.currency?.code) {
    return balance < props.amount
  }

  // For different currencies, direct comparison (in a real app would need exchange rates)
  return balance < props.amount
})

// Calculate balance percentage for progress indicator
const balancePercentage = computed(() => {
  const balance = Number(walletStore.currentBalance || 0)
  const amount = props.amount || 1

  if (amount === 0) return 100

  const percentage = (balance / amount) * 100
  return Math.min(percentage, 100) // Cap at 100%
})

// Navigation methods
const navigateToHelp = () => {
  router.push(
    '/help/wallet/wallet-deposits/how-to-deposit-funds-to-your-wallet'
  )
}

const navigateToActivate = () => {
  router.push('/wallet/activate')
  emit('activate-click')
}

const navigateToDeposit = () => {
  router.push('/wallet/deposit')
  emit('deposit-click')
}

// Emit validation event when any relevant data changes
watch(
  [
    () => walletStore.currentBalance,
    () => props.amount,
    () => walletCurrency.value?.code,
    () => props.currency?.code,
    () => isWalletActive.value,
    () => insufficientFunds.value,
    () => props.walletStatus,
  ],
  () => {
    const status =
      props.walletStatus ||
      (!isWalletActive.value
        ? 'inactive'
        : insufficientFunds.value
        ? 'insufficient'
        : 'sufficient')

    emit('validate', {
      valid:
        isWalletActive.value &&
        !insufficientFunds.value &&
        props.walletStatus !== 'currencyMismatch' &&
        props.walletStatus !== 'error',
      status,
      data: { wallet_id: walletStore.wallet?.data?.id },
    })
  },
  { immediate: true }
)


</script>

<style scoped>
.wallet-status-compact {
  width: 100%;
}

.inactive-card {
  background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
  border-left: 4px solid #ff9800;
}

.insufficient-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
  border-left: 4px solid #ff9800;
}

.success-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
  border-left: 4px solid #4caf50;
}

.error-card {
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
  border-left: 4px solid #f44336;
}

.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.gap-2 {
  gap: 8px;
}

/* Compact button styling */
:deep(.v-btn--size-small) {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  min-width: 80px;
}

@media (max-width: 600px) {
  .balance-row {
    flex-direction: column;
    gap: 4px;
  }

  .balance-item {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  :deep(.v-btn--size-small) {
    width: 100%;
    min-width: unset;
  }
}
ng-bg {
  background-color: rgba(255, 193, 7, 0.1);
}

.balance-card {
  background-color: rgb(250, 250, 250);
  border-radius: 8px;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.balance-info {
  display: flex;
  align-items: center;
}

.v-btn {
  transition: transform 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}
</style>
