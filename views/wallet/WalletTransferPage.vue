<template>
  <div class="wallet-transfer-container">
    <!-- Header Section -->
    <BaseHeader
      title="Transfer Funds"
      subtitle="Send money instantly to other users with no transfer fees"
      icon="mdi-wallet-travel"
      iconColor="primary"
      :marginBottom="'2rem'"
    >
      <template v-slot:actionable>
        <v-chip color="success" variant="elevated" size="small" class="ml-2">
          <v-icon start size="small">mdi-cash-remove</v-icon>
          No Transfer Fees
        </v-chip>
      </template>
    </BaseHeader>

    <!-- Main Transfer Container -->
    <v-container fluid class="pa-0">
      <v-row>
        <!-- Left Column: Transfer Form -->
        <v-col cols="12" md="8">
          <v-card elevation="3" class="transfer-form rounded-lg mb-4">
            <v-card-text class="pa-6">
              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-6"
                closable
                border="start"
                density="comfortable"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-alert-circle"></v-icon>
                </template>
                <div class="d-flex flex-column">
                  <span class="font-weight-medium">{{ error }}</span>
                  <span v-if="maxPerTransaction" class="text-body-2 mt-1">
                    Maximum transfer amount per transaction:
                    {{ formatCurrency(maxPerTransaction, transferCurrency) }}
                  </span>
                </div>
              </v-alert>

              <!-- Transfer Progress Indicator -->
              <div class="text-center mb-6">
                <v-progress-linear
                  :model-value="(step / 2) * 100"
                  height="8"
                  rounded
                  color="primary"
                  class="mb-3"
                  bg-color="grey-lighten-3"
                ></v-progress-linear>
                <div class="d-flex justify-space-between">
                  <span
                    class="text-body-2"
                    :class="{ 'text-primary font-weight-bold': step === 1 }"
                  >
                    <v-icon
                      size="small"
                      :color="step === 1 ? 'primary' : 'medium-emphasis'"
                      class="mr-1"
                    >
                      {{
                        step === 1
                          ? 'mdi-numeric-1-circle'
                          : 'mdi-numeric-1-circle-outline'
                      }}
                    </v-icon>
                    Find Receiver
                  </span>
                  <span
                    class="text-body-2"
                    :class="{ 'text-primary font-weight-bold': step === 2 }"
                  >
                    <v-icon
                      size="small"
                      :color="step === 2 ? 'primary' : 'medium-emphasis'"
                      class="mr-1"
                    >
                      {{
                        step === 2
                          ? 'mdi-numeric-2-circle'
                          : 'mdi-numeric-2-circle-outline'
                      }}
                    </v-icon>
                    Amount Details
                  </span>
                </div>
              </div>

              <!-- Transfer Steps -->
              <v-window v-model="step" class="transfer-steps">
                <!-- Step 1: Find Receiver -->
                <v-window-item :value="1">
                  <div class="text-center mb-6">
                    <div class="icon-container">
                      <v-icon
                        icon="mdi-wallet-search"
                        size="64"
                        color="primary"
                        class="mb-2 pulse-animation"
                      ></v-icon>
                    </div>
                    <h3 class="text-h5 font-weight-medium mb-2">
                      Find Receiver
                    </h3>
                    <span class="text-body-2 text-medium-emphasis">
                      Enter the wallet code of the person you want to send money
                      to
                    </span>
                  </div>

                  <v-form @submit.prevent="verifyWallet">
                    <v-text-field
                      v-model="receiverCode"
                      label="Receiver's Wallet Code"
                      :rules="[(v) => !!v || 'Wallet code is required']"
                      required
                      persistent-placeholder
                      variant="outlined"
                      class="mb-4"
                      prepend-inner-icon="mdi-wallet"
                      placeholder="Enter wallet code"
                      hide-details="auto"
                      bg-color="grey-lighten-5"
                      rounded="lg"
                    ></v-text-field>

                    <v-btn
                      color="primary"
                      @click="verifyWallet"
                      :loading="loading"
                      block
                      class="mt-6"
                      size="large"
                      elevation="2"
                      rounded="lg"
                    >
                      <v-icon start>mdi-magnify</v-icon>
                      Find Receiver
                    </v-btn>
                  </v-form>
                </v-window-item>

                <!-- Step 2: Transfer Amount -->
                <v-window-item :value="2" v-if="receiverWallet">
                  <v-card class="mb-6" variant="outlined" rounded="lg">
                    <v-card-title
                      class="text-body-1 py-3 px-4 bg-grey-lighten-4 d-flex justify-space-between"
                    >
                      <span>Sending money to</span>
                      <v-chip size="small" color="success" variant="flat">
                        <v-icon start size="small">mdi-check-circle</v-icon>
                        Verified
                      </v-chip>
                    </v-card-title>
                    <UserCard :user="receiverWallet.user" layout="compact" />
                  </v-card>

                  <!-- Transfer Amount Form -->
                  <v-form @submit.prevent="proceedToConfirmation">
                    <v-text-field
                      v-model.number="amount"
                      label="Amount to Transfer"
                      type="number"
                      :rules="amountRules"
                      :prefix="senderWallet?.data?.currency?.symbol"
                      required
                      variant="outlined"
                      class="mb-4"
                      prepend-inner-icon="mdi-cash"
                      placeholder="Enter amount"
                      bg-color="grey-lighten-5"
                      rounded="lg"
                    ></v-text-field>

                    <!-- Currency Exchange Information Card -->
                    <v-card
                      v-if="showExchangeInfo"
                      class="mb-6"
                      variant="outlined"
                      color="info-lighten-5"
                      rounded="lg"
                    >
                      <v-card-title
                        class="text-body-1 py-3 px-4 bg-info-lighten-4 d-flex align-center"
                      >
                        <v-icon color="info" class="mr-2"
                          >mdi-currency-exchange</v-icon
                        >
                        Currency Exchange
                      </v-card-title>
                      <v-card-text class="pa-4">
                        <div
                          class="d-flex justify-space-between align-center mb-4"
                        >
                          <div class="text-body-2 font-weight-medium">
                            <v-icon size="small" color="primary" class="mr-1"
                              >mdi-arrow-right</v-icon
                            >
                            You send
                          </div>
                          <div class="text-h6 font-weight-bold">
                            {{
                              formatCurrency(
                                amount,
                                senderWallet?.data?.currency?.code
                              )
                            }}
                          </div>
                        </div>

                        <div
                          class="exchange-rate-container pa-3 rounded-lg bg-grey-lighten-5 mb-4"
                        >
                          <div
                            class="d-flex justify-space-between align-center"
                          >
                            <div class="d-flex align-center">
                              <v-icon color="primary" class="mr-2"
                                >mdi-swap-horizontal</v-icon
                              >
                              <span class="text-caption">Exchange Rate</span>
                            </div>
                            <div class="text-caption font-weight-medium">
                              1 {{ senderWallet?.data?.currency?.code }} =
                              {{ exchangeRate.toFixed(4) }}
                              {{ receiverWallet?.currency?.code }}
                            </div>
                          </div>
                        </div>

                        <div class="d-flex justify-space-between align-center">
                          <div class="text-body-2 font-weight-medium">
                            <v-icon size="small" color="success" class="mr-1"
                              >mdi-arrow-left</v-icon
                            >
                            Receiver gets
                          </div>
                          <div class="text-h6 font-weight-bold text-success">
                            {{
                              formatCurrency(
                                convertedAmount,
                                receiverWallet?.currency?.code
                              )
                            }}
                          </div>
                        </div>
                      </v-card-text>
                      <v-divider></v-divider>
                      <v-card-text class="pa-3 bg-grey-lighten-6">
                        <div
                          class="d-flex align-center text-caption text-medium-emphasis"
                        >
                          <v-icon size="small" class="mr-1"
                            >mdi-information-outline</v-icon
                          >
                          Exchange rates are updated regularly. The final amount
                          may vary slightly.
                        </div>
                      </v-card-text>
                    </v-card>

                    <!-- Free Transfer Reminder -->
                    <v-card
                      class="mb-6 free-transfer-card"
                      variant="tonal"
                      color="success-lighten-5"
                      rounded="lg"
                    >
                      <v-card-text class="pa-4">
                        <div class="d-flex align-center">
                          <v-avatar
                            size="48"
                            color="success-lighten-4"
                            class="mr-4"
                          >
                            <v-icon color="success" size="24"
                              >mdi-cash-remove</v-icon
                            >
                          </v-avatar>
                          <div>
                            <div
                              class="text-subtitle-1 font-weight-bold text-success mb-1"
                            >
                              Free Transfer
                            </div>
                            <div class="text-body-2">
                              We don't charge any fees for wallet-to-wallet
                              transfers within our platform.
                              <template v-if="maxPerTransaction">
                                <br />
                                Maximum transfer amount:
                                {{
                                  formatCurrency(
                                    maxPerTransaction,
                                    transferCurrency
                                  )
                                }}
                              </template>
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>

                    <div class="d-flex flex-column gap-3">
                      <v-btn
                        color="primary"
                        @click="proceedToConfirmation"
                        :disabled="!isAmountValid"
                        block
                        size="large"
                        elevation="2"
                        rounded="lg"
                      >
                        <v-icon start>mdi-send</v-icon>
                        Continue to Transfer
                      </v-btn>

                      <v-btn
                        variant="outlined"
                        @click="step = 1"
                        block
                        prepend-icon="mdi-arrow-left"
                        rounded="lg"
                      >
                        Back
                      </v-btn>
                    </div>
                  </v-form>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column: Summary & Info -->
        <v-col cols="12" md="4">
          <!-- Summary Card -->
          <v-expand-transition>
            <v-card
              v-if="step === 2 && amount > 0 && receiverWallet"
              class="mb-4"
              variant="outlined"
              rounded="lg"
            >
              <v-card-title class="text-body-1 py-3 px-4 bg-grey-lighten-4">
                <v-icon start color="primary" class="mr-2"
                  >mdi-calculator</v-icon
                >
                Transfer Summary
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2">You're sending</span>
                  <span class="font-weight-medium">
                    {{
                      formatCurrency(amount, senderWallet?.data?.currency?.code)
                    }}
                  </span>
                </div>
                <v-divider class="my-3"></v-divider>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2"
                    >Available balance after transfer</span
                  >
                  <span
                    class="font-weight-medium"
                    :class="{
                      'text-error':
                        (senderWallet?.data?.balance || 0) - amount < 0,
                    }"
                  >
                    {{
                      formatCurrency(
                        (senderWallet?.data?.balance || 0) - amount,
                        senderWallet?.data?.currency?.code
                      )
                    }}
                  </span>
                </div>
                <div v-if="showExchangeInfo" class="mt-4 pt-3 border-top">
                  <div class="text-body-2 mb-2">Receiver will get</div>
                  <div class="text-h6 font-weight-bold text-success">
                    {{
                      formatCurrency(
                        convertedAmount,
                        receiverWallet?.currency?.code
                      )
                    }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-expand-transition>

          <!-- Transfer Benefits Card -->
          <v-card variant="outlined" rounded="lg" class="benefits-card">
            <v-card-title class="text-body-1 py-3 px-4 bg-grey-lighten-4">
              <v-icon start color="primary" class="mr-2"
                >mdi-information-outline</v-icon
              >
              Transfer Benefits
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar size="36" color="success-lighten-5" class="mr-3">
                  <v-icon color="success" size="20">mdi-cash-remove</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-medium">
                    No Transfer Fees
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Transfer funds between wallets without any fees
                  </div>
                </div>
              </div>

              <div class="d-flex align-center mb-3">
                <v-avatar size="36" color="info-lighten-5" class="mr-3">
                  <v-icon color="info" size="20">mdi-lightning-bolt</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-medium">
                    Instant Transfers
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Money is transferred instantly to the receiver
                  </div>
                </div>
              </div>

              <div class="d-flex align-center">
                <v-avatar size="36" color="primary-lighten-5" class="mr-3">
                  <v-icon color="primary" size="20">mdi-shield-check</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-medium">
                    Secure Transactions
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    All transfers are protected with PIN verification
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Confirmation Dialog -->
    <WalletPinVerificationDialog
      v-model="showPinDialog"
      @verified="confirmTransfer"
      @error="handlePinError"
      @forgot-pin="handleForgotPin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useWalletTransferStore,
  type TransferData,
} from '@/stores/wallet/useWalletTransferStore'
import { useWalletStore } from '@/stores/useWalletStore'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

// Store and utility setup
const transferStore = useWalletTransferStore()
const walletStore = useWalletStore()
const { wallet: senderWallet } = storeToRefs(walletStore)
const toast = useToast()
const router = useRouter()

// Component state
const step = ref(1)
const receiverCode = ref('')
const receiverWallet = ref<any>(null)
const amount = ref<number>(0)
const loading = ref(false)
const showPinDialog = ref(false)
const error = ref('')
const maxPerTransaction = ref<number | null>(null)
const transferCurrency = ref('')
const exchangeRate = ref(1)
const convertedAmount = ref(0)

// Lifecycle hooks
onMounted(async () => {
  if (!senderWallet.value?.data) {
    try {
      await walletStore.fetchWallet()
      console.log('Wallet data loaded:', senderWallet.value?.data)
    } catch (err) {
      console.error('Failed to fetch wallet:', err)
      error.value = 'Unable to load wallet data'
      toast.error(error.value)
    }
  }
})

// Computed properties
const showExchangeInfo = computed(() => {
  if (!receiverWallet.value || !senderWallet.value?.data) return false
  return (
    receiverWallet.value.currency?.id !== senderWallet.value.data.currency?.id
  )
})

const amountRules = computed(() => [
  (v: number) => !!v || 'Amount is required',
  (v: number) => v > 0 || 'Amount must be greater than 0',
  (v: number) =>
    v <= (senderWallet.value?.data?.balance || 0) || 'Insufficient funds',
  (v: number) =>
    !maxPerTransaction.value ||
    v <= maxPerTransaction.value ||
    `Amount exceeds maximum transfer limit of ${formatCurrency(
      maxPerTransaction.value,
      transferCurrency.value
    )}`,
])

const isAmountValid = computed(() => {
  return (
    amount.value > 0 &&
    amount.value <= (senderWallet.value?.data?.balance || 0) &&
    (!maxPerTransaction.value || amount.value <= maxPerTransaction.value)
  )
})

const confirmMessage = computed(() => {
  const currencyCode = senderWallet.value?.data?.currency?.code
  if (receiverWallet.value) {
    return `Are you sure you want to transfer ${formatCurrency(
      amount.value,
      currencyCode
    )} to ${receiverWallet.value.user.display_name}?`
  }
  return `Are you sure you want to transfer ${formatCurrency(
    amount.value,
    currencyCode
  )}?`
})

// Helper functions
const formatCurrency = (value: number, currencyCode?: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency:
        currencyCode || senderWallet.value?.data?.currency?.code || 'USD',
    }).format(value)
  } catch (err) {
    console.error('Currency formatting error:', err)
    return `${value}` // Fallback
  }
}

// Action methods
const verifyWallet = async () => {
  if (!receiverCode.value) {
    error.value = 'Wallet code is required'
    return
  }

  // Check if attempting to transfer to own wallet using wallet code
  if (receiverCode.value === senderWallet.value?.data?.wallet_code) {
    error.value = 'You cannot transfer funds to your own wallet'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await transferStore.verifyWallet(receiverCode.value)

    // Additional validation after API response
    if (!result || !result.user) {
      throw new Error('Invalid wallet information received')
    }

    receiverWallet.value = result

    // Get currency exchange rate if currencies are different
    if (senderWallet.value?.data?.currency?.id !== result.currency?.id) {
      try {
        const rate = await transferStore.getExchangeRate(
          senderWallet.value?.data?.currency?.id,
          result.currency?.id
        )
        exchangeRate.value = rate
        console.log('Exchange rate loaded:', exchangeRate.value)
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err)
        // Continue but display warning
        toast.warning('Exchange rate information may not be up to date')
      }
    }

    step.value = 2
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const handlePinError = (err) => {
  error.value = 'PIN verification failed. Please try again.'
  toast.error(error.value)
  console.error('PIN verification error:', err)
}

const handleForgotPin = () => {
  router.push('/wallet/reset-pin')
}

const proceedToConfirmation = () => {
  if (!isAmountValid.value) {
    error.value = 'Please enter a valid amount'
    return
  }
  showPinDialog.value = true // Show PIN verification dialog
}

const confirmTransfer = async () => {
  // Validate sender wallet data upfront
  if (!senderWallet.value?.data) {
    error.value = 'Sender wallet data not available'
    toast.error(error.value)
    return
  }

  // Validate currency ID before entering try-catch
  const currencyId = senderWallet.value.data.currency?.id
  if (!currencyId) {
    error.value = 'Currency information is missing'
    toast.error(error.value)
    console.error('Missing currency ID:', senderWallet.value.data)
    return
  }

  loading.value = true
  error.value = ''
  maxPerTransaction.value = null
  transferCurrency.value = ''

  try {
    const transferData: TransferData = {
      sender_wallet_id: senderWallet.value.data.id,
      receiver_wallet_code: receiverCode.value,
      amount: Number(amount.value),
      currency_id: currencyId,
      exchange_rate: showExchangeInfo.value ? exchangeRate.value : null,
      converted_amount: showExchangeInfo.value ? convertedAmount.value : null,
    }

    console.log('Sending transfer data:', transferData)

    const response = await transferStore.transferFunds(transferData)
    console.log('Transfer response:', response)

    await walletStore.fetchWallet()

    // Navigate to the success page using the reference number from response
    if (response.data?.reference_number) {
      await router.push(
        `/wallet/transactions/transfers/transfer-${response.data.reference_number}`
      )
    } else {
      toast.success(response.message || 'Transfer completed successfully')
      router.push('/wallet')
    }
  } catch (err: any) {
    console.error('Transfer failed:', err)
    handleError(err)
  } finally {
    loading.value = false
    showPinDialog.value = false
  }
}
// Updated error handler
const handleError = (err: any) => {
  console.error('Transfer error:', err)

  error.value = err.message || 'An error occurred during the transfer'
  toast.error(error.value)

  // Handle specific error cases
  if (err.data?.max_per_transaction) {
    maxPerTransaction.value = parseFloat(err.data.max_per_transaction)
    transferCurrency.value = err.data.currency
  }
}

// Reset form
const resetForm = () => {
  step.value = 1
  amount.value = 0
  receiverCode.value = ''
  receiverWallet.value = null
  error.value = ''
  maxPerTransaction.value = null
  transferCurrency.value = ''
  exchangeRate.value = 1
  convertedAmount.value = 0
}

// Watchers
watch(step, (newStep) => {
  if (newStep === 1) {
    receiverWallet.value = null
    amount.value = 0
    error.value = ''
  }
})

// Calculate converted amount when amount or exchange rate changes
watch([amount, exchangeRate], ([newAmount, newRate]) => {
  if (newAmount && newRate) {
    convertedAmount.value = newAmount * newRate
  } else {
    convertedAmount.value = 0
  }
})
</script>

<style scoped>
.wallet-transfer-container {
  width: 100%;
}

.transfer-form {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.transfer-steps {
  min-height: 360px;
}

.exchange-rate-container {
  border: 1px dashed rgba(0, 0, 0, 0.12);
}

.benefits-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.free-transfer-card {
  border: 1px solid rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
}

.free-transfer-card:hover {
  border-color: rgba(76, 175, 80, 0.4);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

/* Responsive styles */
@media (max-width: 960px) {
  .wallet-transfer-container {
    padding: 0;
  }

  .benefits-card {
    margin-top: 1rem;
  }
}
</style>
