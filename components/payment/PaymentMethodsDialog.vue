<template>
  <BaseDialog
    v-model="checkoutStore.showPaymentMethodsDialog"
    :title="dialogTitle"
    :max-width="props.isWalletOnly ? 500 : 600"
    :fullscreen="false"
    persistent
    scrollable
  >
    <v-card-text :class="['pa-0', { 'wallet-only-mode': props.isWalletOnly }]">
      <!-- Compact Payment Amount Display -->
      <div class="amount-display-compact pa-4 rounded-lg mb-4">
        <div class="text-center">
          <div class="text-caption text-medium-emphasis mb-1">
            {{ amountLabel }}
          </div>
          <div class="text-h4 font-weight-bold">
            {{ formattedTotal }}
          </div>
        </div>
      </div>

      <!-- Compact Loading State -->
      <div v-if="isLoading" class="pa-4 text-center">
        <v-progress-circular indeterminate color="primary" size="32" />
        <div class="mt-2 text-body-2">Loading...</div>
      </div>

      <!-- Compact Empty State -->
      <div v-else-if="filteredPaymentMethods.length === 0" class="pa-4 text-center">
        <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-wallet-outline</v-icon>
        <div class="text-body-1 font-weight-medium mb-2">
          {{ props.isWalletOnly ? 'Wallet Not Available' : 'No Payment Methods' }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-3">
          {{ props.isWalletOnly ? 'Please activate your wallet first.' : 'No methods available for your region.' }}
        </div>
        <v-btn size="small" color="primary" variant="outlined" @click="navigateToHelp">
          Get Help
        </v-btn>
      </div>

      <!-- Compact Payment Methods -->
      <div v-else class="px-2">
        <v-card
          v-for="method in filteredPaymentMethods"
          :key="method.id"
          :class="[
            'payment-method-card-compact mb-2',
            { 'payment-selected': selectedMethod?.id === method.id },
          ]"
          elevation="1"
          @click="selectPaymentMethod(method)"
        >
          <v-card-text class="d-flex align-center py-3">
            <v-avatar size="36" class="mr-3">
              <v-icon color="primary">mdi-wallet</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-body-1 font-weight-medium">
                {{ method.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ getPaymentMethodDescription(method) }}
              </div>
            </div>
            <v-icon
              v-if="selectedMethod?.id === method.id"
              color="primary"
              size="20"
            >mdi-check-circle</v-icon>
          </v-card-text>
        </v-card>
      </div>

      <!-- Compact Dynamic Payment Form -->
      <v-expand-transition>
        <div v-if="selectedMethod" class="mt-4 px-2">
          <v-divider class="mb-3" />
          <!-- If user picks wallet -->
          <WalletPaymentForm
            v-if="isWalletPayment"
            :amount="numericTotal"
            :currency="cartCurrency"
            @validate="handleWalletValidation"
            @processing="processing = $event"
            @payment-complete="handlePaymentComplete"
            ref="walletPaymentForm"
          />
          <!-- If user picks card (Flutterwave) -->
          <div v-else-if="isCardPayment">
            <v-select
              v-if="
                selectedMethod.depositables &&
                selectedMethod.depositables.length > 1
              "
              v-model="selectedCard"
              :items="cardOptions"
              item-title="name"
              item-value="id"
              label="Select Card Type"
              class="mb-4"
              @update:model-value="handleCardSelection"
              :rules="[(v) => !!v || 'Please select a card type']"
            ></v-select>
            <CardPaymentForm
              v-if="
                (selectedMethod.depositables &&
                  selectedMethod.depositables.length === 1) ||
                selectedCard
              "
              :gateway="
                selectedCard
                  ? selectedCard.gateway
                  : selectedMethod.depositables &&
                    selectedMethod.depositables.length > 0
                  ? selectedMethod.depositables[0].gateway
                  : null
              "
              @validate="handleCardValidation"
            />
          </div>
          <!-- If user picks mobile money -->
          <div v-else-if="isMobileMoneyPayment">
            <v-select
              v-model="selectedMobileProvider"
              :items="mobileMoneyOptions"
              item-title="name"
              item-value="id"
              label="Select Mobile Money Provider"
              class="mb-4"
              @update:model-value="handleMobileProviderSelection"
              :rules="[(v) => !!v || 'Please select a mobile money provider']"
            ></v-select>
            <MobileMoneyForm
              v-if="selectedMobileProvider"
              :provider="selectedMobileProvider.depositable"
              @validate="handleMobileMoneyValidation"
            />
          </div>
          <!-- If user picks bank transfer - Using SelectBank component -->
          <div v-else-if="isBankTransferPayment">
            <SelectBank
              v-model="selectedBank"
              :banks="bankOptions"
              label="Select Bank"
              @update:model-value="handleBankSelection"
            />
            <BankTransferForm
              v-if="selectedBank"
              :bank="selectedBank"
              @validate="handleBankValidation"
              class="mt-4"
            />
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>

    <!-- Compact Payment Footer -->
    <template #actions>
      <v-card class="payment-footer-compact w-100 px-3 py-2">
        <BaseButton
          :title="actionButtonText"
          :action="processPayment"
          :loading="processing"
          :disabled="!isValidPayment || isLoading"
          color="primary"
          variant="elevated"
          height="44"
          :prepend-icon="actionButtonIcon"
          custom-class="action-button-compact"
          full-width
        />
      </v-card>
    </template>

    <!-- Processing Dialog -->
    <v-dialog v-model="showProcessing" persistent width="300">
      <v-card>
        <v-card-text class="text-center pa-6">
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="mt-4 text-body-1">{{ processingMessage }}</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { useWalletStore } from '~/stores/useWalletStore'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useAuthStore } from '~/stores/auth'
import { useCountryPaymentMethods } from '~/composables/useCountryPaymentMethods'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useCountries } from '~/composables/useCountries'
import type { CountryPaymentMethod, PaymentValidation } from '~/types/payment'
import EmptyStateCard from '~/components/common/EmptyStateCard.vue'

const props = defineProps<{
  transactionType: string
  isWalletOnly?: boolean
}>()

const { $axios } = useNuxtApp()
const router = useRouter()
const checkoutStore = useCheckoutStore()
const walletStore = useWalletStore()
const snackStore = useSnackMessageStore()
const authStore = useAuthStore()
const { currencyFormatter } = useCurrencyFormatter()

// State
const selectedMethod = ref<CountryPaymentMethod | null>(null)
const selectedBank = ref<any>(null)
const selectedCard = ref<any>(null)
const selectedMobileProvider = ref<any>(null)
const processing = ref(false)
const showProcessing = ref(false)
const paymentValidation = ref<boolean>(false)
const paymentData = ref<any>(null)
const walletPaymentForm = ref(null)
const isLoading = ref(false)
const baseAmount = ref(0)

// Create payment methods with lazy initialization
const { paymentMethods, fetchPaymentMethods } = useCountryPaymentMethods()
const { countries } = useCountries()

// Get the base amount without fees
const numericBaseAmount = computed(() => {
  const val = Number(checkoutStore.totalAmount)
  return isNaN(val) ? 0 : val
})

// Calculate fee percentage based on selected payment method
const selectedFeePercentage = computed(() => {
  if (!selectedMethod.value || isWalletPayment.value) return 0

  // For bank transfers, use the selected bank's fee percentage
  if (isBankTransferPayment.value && selectedBank.value) {
    return parseFloat(selectedBank.value.gateway_fee_percentage || '0')
  }

  // For other payment types with depositables
  if (
    selectedMethod.value.depositables &&
    selectedMethod.value.depositables.length > 0
  ) {
    // Use the first depositable's fee percentage as default
    return parseFloat(
      selectedMethod.value.depositables[0].gateway_fee_percentage || '0'
    )
  }

  return 0
})

// Calculate fee amount
const feeAmount = computed(() => {
  if (selectedFeePercentage.value === 0) return 0
  return (numericBaseAmount.value * selectedFeePercentage.value) / 100
})

// Calculate total with fees
const numericTotal = computed(() => {
  if (isWalletPayment.value) return numericBaseAmount.value
  return numericBaseAmount.value + feeAmount.value
})

// Format the base amount
const formattedBaseAmount = computed(() => {
  if (!numericBaseAmount.value) return `${cartCurrency.value.symbol || ''}0.00`

  if (
    cartCurrency.value &&
    cartCurrency.value.symbol &&
    cartCurrency.value.code
  ) {
    return currencyFormatter(
      numericBaseAmount.value,
      cartCurrency.value.symbol,
      cartCurrency.value.code
    )
  }

  return `${numericBaseAmount.value.toFixed(2)}`
})

// Format the fee amount
const formattedFeeAmount = computed(() => {
  if (!feeAmount.value) return `${cartCurrency.value.symbol || ''}0.00`

  if (
    cartCurrency.value &&
    cartCurrency.value.symbol &&
    cartCurrency.value.code
  ) {
    return currencyFormatter(
      feeAmount.value,
      cartCurrency.value.symbol,
      cartCurrency.value.code
    )
  }

  return `${feeAmount.value.toFixed(2)}`
})

// Get the cart currency
const cartCurrency = computed(() => {
  return checkoutStore.currency || {}
})

// Show fee info when a non-wallet payment method is selected
const showFeeInfo = computed(() => {
  return (
    selectedMethod.value &&
    !isWalletPayment.value &&
    selectedFeePercentage.value > 0
  )
})

// Dialog title based on transaction type and wallet-only mode
const dialogTitle = computed(() => {
  if (props.isWalletOnly) {
    return 'Pay with your wallet'
  }
  
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Select Withdrawal Method'
    case 'deposit':
      return 'Select Deposit Method'
    default:
      return 'Select Payment Method'
  }
})

// Amount label based on transaction type and wallet-only mode
const amountLabel = computed(() => {
  if (props.isWalletOnly) {
    return 'Amount to Pay'
  }
  
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Withdrawal Amount'
    case 'deposit':
      return 'Deposit Amount'
    default:
      return 'Payment Amount'
  }
})

// Action button text based on transaction type
const actionButtonText = computed(() => {
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Withdraw Now'
    case 'deposit':
      return 'Deposit Now'
    default:
      return 'Pay Now'
  }
})

// Action button icon based on transaction type
const actionButtonIcon = computed(() => {
  switch (props.transactionType) {
    case 'withdrawal':
      return 'mdi-cash-minus'
    case 'deposit':
      return 'mdi-cash-plus'
    default:
      return 'mdi-cash-multiple'
  }
})

// Processing message based on transaction type
const processingMessage = computed(() => {
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Processing your withdrawal...'
    case 'deposit':
      return 'Processing your deposit...'
    default:
      return 'Processing your payment...'
  }
})

// Extract options for different payment methods
const bankOptions = computed(() => {
  const bankMethod = paymentMethods.value.find(
    (method) => method.type === 'bank_transfer'
  )

  if (!bankMethod || !bankMethod.depositables) return []

  return bankMethod.depositables.map((item) => ({
    ...item.depositable,
    method_id: item.id, // Store the payment method ID for reference
    gateway: item.gateway,
    gateway_fee_percentage: item.gateway_fee_percentage,
  }))
})

const cardOptions = computed(() => {
  const cardMethod = paymentMethods.value.find(
    (method) => method.type === 'card'
  )

  if (!cardMethod || !cardMethod.depositables) return []

  return cardMethod.depositables.map((item) => ({
    ...item.depositable,
    id: item.depositable.id,
    method_id: item.id,
    gateway: item.gateway,
    gateway_fee_percentage: item.gateway_fee_percentage,
  }))
})

const mobileMoneyOptions = computed(() => {
  const mobileMethod = paymentMethods.value.find(
    (method) => method.type === 'mobile_money'
  )

  if (!mobileMethod || !mobileMethod.depositables) return []

  return mobileMethod.depositables.map((item) => ({
    ...item.depositable,
    id: item.depositable.id,
    method_id: item.id,
    gateway: item.gateway,
    depositable: item.depositable,
    gateway_fee_percentage: item.gateway_fee_percentage,
  }))
})

// Initialize data when dialog opens
watch(
  () => checkoutStore.showPaymentMethodsDialog,
  async (isOpen) => {
    if (isOpen) {
      isLoading.value = true
      selectedBank.value = null
      selectedCard.value = null
      selectedMobileProvider.value = null

      try {
        // Fetch wallet data if not already loaded
        if (!walletStore.wallet) {
          await walletStore.fetchWallet()
        }

        // Fetch payment methods with the current transaction type
        await fetchPaymentMethods(props.transactionType)

        // Auto-select the wallet payment method if available or if wallet-only mode
        if (!selectedMethod.value || props.isWalletOnly) {
          const walletMethod = paymentMethods.value.find(
            (method) => method.type === 'wallet'
          )

          if (walletMethod) {
            selectPaymentMethod(walletMethod)
          }
        }
      } catch (error) {
        console.error('Error initializing payment dialog:', error)
        snackStore.error('Failed to load payment methods')
      } finally {
        isLoading.value = false
      }
    } else {
      // Reset state when dialog closes
      if (!isOpen) {
        selectedMethod.value = null
        selectedBank.value = null
        selectedCard.value = null
        selectedMobileProvider.value = null
        paymentValidation.value = false
        paymentData.value = null
      }
    }
  }
)

// Watch for transaction type changes
watch(
  () => props.transactionType,
  async (newType, oldType) => {
    if (newType !== oldType && checkoutStore.showPaymentMethodsDialog) {
      isLoading.value = true
      selectedMethod.value = null
      selectedBank.value = null
      selectedCard.value = null
      selectedMobileProvider.value = null

      try {
        await fetchPaymentMethods(newType)

        // Auto-select wallet again if available
        const walletMethod = paymentMethods.value.find(
          (method) => method.type === 'wallet'
        )

        if (walletMethod) {
          selectPaymentMethod(walletMethod)
        }
      } catch (error) {
        console.error('Error updating payment methods:', error)
        snackStore.error('Failed to update payment methods')
      } finally {
        isLoading.value = false
      }
    }
  }
)

// Compute a formatted total using the cart currency
const formattedTotal = computed(() => {
  if (!numericTotal.value) return `${cartCurrency.value.symbol || ''}0.00`

  // Use the cart's currency
  if (
    cartCurrency.value &&
    cartCurrency.value.symbol &&
    cartCurrency.value.code
  ) {
    return (
      currencyFormatter(
        numericTotal.value,
        cartCurrency.value.symbol,
        cartCurrency.value.code
      ) || `${cartCurrency.value.symbol}${numericTotal.value.toFixed(2)}`
    )
  }

  // Fallback if currency info is missing
  return `${numericTotal.value.toFixed(2)}`
})

// Filter and sort payment methods based on wallet-only requirement
const filteredPaymentMethods = computed(() => {
  let methods = paymentMethods.value
  
  // If wallet-only mode, filter to show only wallet payment method
  if (props.isWalletOnly) {
    methods = methods.filter(method => method.type === 'wallet')
  }
  
  // Sort payment methods
  return methods.sort((a, b) => {
    const order: Record<string, number> = {
      wallet: 1,
      card: 2,
      mobile_money: 3,
      bank_transfer: 4,
    }
    return (
      order[a.type as keyof typeof order] - order[b.type as keyof typeof order]
    )
  })
})

// Keep the old computed for backward compatibility
const groupedPaymentMethods = computed(() => filteredPaymentMethods.value)

// Payment type checks.
const isWalletPayment = computed(() => selectedMethod.value?.type === 'wallet')
const isCardPayment = computed(() => selectedMethod.value?.type === 'card')
const isMobileMoneyPayment = computed(
  () => selectedMethod.value?.type === 'mobile_money'
)
const isBankTransferPayment = computed(
  () => selectedMethod.value?.type === 'bank_transfer'
)

// Overall validation check.
const isValidPayment = computed(() => {
  if (!selectedMethod.value) return false

  // For bank transfers, we need both a selected method and a selected bank
  if (isBankTransferPayment.value) {
    return paymentValidation.value && selectedBank.value
  }

  // For mobile money, we need a selected provider
  if (isMobileMoneyPayment.value) {
    return paymentValidation.value && selectedMobileProvider.value
  }

  // For card payments, we need a selected card
  if (isCardPayment.value) {
    return paymentValidation.value && selectedCard.value
  }

  return paymentValidation.value
})

// Get formatted wallet balance
const formattedWalletBalance = computed(() => {
  if (!walletStore.currentBalance) {
    return (walletStore.currentCurrency?.code || 'RWF') + '0.00'
  }

  return currencyFormatter(
    Number(walletStore.currentBalance),
    walletStore.currentCurrency?.symbol ||
      walletStore.currentCurrency?.code ||
      'RWF',
    walletStore.currentCurrency?.code || 'RWF'
  )
})

// UI helpers.
function getPaymentMethodIcon(method: any): string {
  return method.logo_url || `/icons/${method.type}.png`
}

function getPaymentMethodDescription(method: any): string {
  switch (method.type) {
    case 'wallet':
      return `Balance: ${formattedWalletBalance.value}`
    case 'mobile_money':
      if (method.depositables && method.depositables.length > 0) {
        const providers = method.depositables
          .map((item: any) => item.depositable.name)
          .join(', ')
        return `Mobile Operators: ${providers || 'N/A'}`
      }
      return 'Mobile Money'
    case 'bank_transfer':
      return `Select from ${bankOptions.value.length} banks`
    case 'card':
      if (method.depositables && method.depositables.length > 0) {
        const cards = method.depositables
          .map((item: any) => item.depositable.name)
          .join(', ')
        return `Cards: ${cards || 'N/A'}`
      }
      return 'Card Payment'
    default:
      return method.name
  }
}

function selectPaymentMethod(method: any) {
  selectedMethod.value = method
  paymentValidation.value = false
  paymentData.value = null

  // Reset selections when changing payment method
  if (method.type !== 'bank_transfer') {
    selectedBank.value = null
  }

  if (method.type !== 'card') {
    selectedCard.value = null
  }

  if (method.type !== 'mobile_money') {
    selectedMobileProvider.value = null
  }

  // Auto-select first option if only one is available
  if (method.type === 'card' && cardOptions.value.length === 1) {
    selectedCard.value = cardOptions.value[0]
  }

  if (method.type === 'mobile_money' && mobileMoneyOptions.value.length === 1) {
    selectedMobileProvider.value = mobileMoneyOptions.value[0]
  }

  // For mobile money with multiple options, show the dropdown but don't auto-select
  if (method.type === 'mobile_money' && mobileMoneyOptions.value.length > 1) {
    // Don't auto-select, let user choose
  }
}

// Handle bank selection from SelectBank component
function handleBankSelection(bank: any) {
  if (!bank) return

  // Find the bank transfer payment method
  const bankMethod = paymentMethods.value.find(
    (method) => method.type === 'bank_transfer'
  )

  if (bankMethod) {
    // Update the selected method to the bank transfer method
    selectedMethod.value = bankMethod

    // The selected bank is already set by v-model on SelectBank component
    // We don't need to find the specific depositable as the bank object already has all needed info
  }
}

// Handle card selection
function handleCardSelection(cardId: any) {
  if (!cardId) {
    selectedCard.value = null
    paymentValidation.value = false
    return
  }

  const card = cardOptions.value.find((c) => c.id === cardId)
  if (card) {
    selectedCard.value = card
    paymentValidation.value = false
  }
}

// Handle mobile money provider selection
function handleMobileProviderSelection(providerId: any) {
  if (!providerId) {
    selectedMobileProvider.value = null
    paymentValidation.value = false
    return
  }

  const provider = mobileMoneyOptions.value.find((p) => p.id === providerId)
  if (provider) {
    selectedMobileProvider.value = provider
    paymentValidation.value = false
  }
}

// Child form validation handlers.
function handleWalletValidation(validation: PaymentValidation) {
  paymentValidation.value = validation.valid
  paymentData.value = validation.data
}
function handleCardValidation(validation: PaymentValidation) {
  paymentValidation.value = validation.valid
  paymentData.value = validation.data
}
function handleMobileMoneyValidation(validation: PaymentValidation) {
  paymentValidation.value = validation.valid
  
  if (validation.data?.phone_number) {
    const userCountryId = authStore.user?.country_id
    const userCountry = countries.value.find(c => c.id === userCountryId)
    const countryCode = userCountry?.phone_code || '250'
    
    paymentData.value = {
      phone_number: validation.data.phone_number,
      country_code: countryCode
    }
  } else {
    paymentData.value = validation.data
  }
}
function handleBankValidation(validation: PaymentValidation) {
  paymentValidation.value = validation.valid
  paymentData.value = validation.data
}

// Handle payment completion from wallet
function handlePaymentComplete() {
  processPaymentSubmission()
}

// Payment process handling
async function processPayment() {
  if (!selectedMethod.value || !paymentValidation.value) return

  // If this is a wallet payment, show PIN verification first
  if (isWalletPayment.value && walletPaymentForm.value) {
    // Use the wallet form's method to show PIN verification
    walletPaymentForm.value.showPinVerification()
    return
  } else {
    // For other payment methods, process directly
    processing.value = true
    showProcessing.value = true
    await processPaymentSubmission()
  }
}

// Payment submission: Process the payment request.
async function processPaymentSubmission() {
  if (!selectedMethod.value || !paymentValidation.value) return

  processing.value = true
  showProcessing.value = true

  try {
    // Map cart items. For deposit or withdrawal, override payable_id with the user's wallet.
    const formattedCartItems = checkoutStore.cartItems.map((item) => {
      const paying_amount =
        typeof item.paying_amount === 'string'
          ? parseFloat(item.paying_amount)
          : item.paying_amount

      let payable_id = item.payable?.id
      if (
        item.payment_type === 'deposit' ||
        item.payment_type === 'withdrawal'
      ) {
        payable_id = walletStore.wallet?.data?.id
      }
      return {
        id: item.id,
        payment_type: item.payment_type,
        payable_id,
        paying_amount,
      }
    })

    // Determine gateway and depositable based on payment method type
    let gateway_id, depositable_id, depositable_type

    if (isBankTransferPayment.value && selectedBank.value) {
      // For bank transfers, use the selected bank's gateway
      gateway_id = selectedBank.value.gateway.id
      depositable_id = selectedBank.value.id
      depositable_type = 'App\\Models\\Bank'
    } else if (isCardPayment.value && selectedCard.value) {
      // For card payments, use the selected card
      gateway_id = selectedCard.value.gateway.id
      depositable_id = selectedCard.value.id
      depositable_type = 'App\\Models\\CardBrand'
    } else if (isMobileMoneyPayment.value && selectedMobileProvider.value) {
      // For mobile money, use the selected provider
      gateway_id = selectedMobileProvider.value.gateway.id
      depositable_id = selectedMobileProvider.value.id
      depositable_type = 'App\\Models\\MobileMoneyProvider'
    } else if (
      selectedMethod.value.depositables &&
      selectedMethod.value.depositables.length > 0
    ) {
      // For other methods with depositables, use the first one
      const firstDepositable = selectedMethod.value.depositables[0]
      gateway_id = firstDepositable.gateway.id
      depositable_id = firstDepositable.depositable.id
      depositable_type = firstDepositable.depositable_type
    }

    const payload = {
      payment_method_id: selectedMethod.value.id,
      gateway_id: gateway_id,
      depositable_id: depositable_id,
      depositable_type: depositable_type,
      currency_id: cartCurrency.value.id,
      country_id: authStore.user?.country_id,
      total_amount: numericTotal.value,
      base_amount: numericBaseAmount.value,
      fee_amount: feeAmount.value,
      cart_items: formattedCartItems,
      // Include the cart_id from the checkout store
      cart_id: checkoutStore.cart?.id,
      payment_data: {
        payment_type: selectedMethod.value.type,
        ...paymentData.value,
        currency_code: cartCurrency.value.code,
        currency_symbol: cartCurrency.value.symbol,
        total_amount: numericTotal.value,
      },
    }

    const response = await $axios.post('/api/orders', payload)
    const result = response.data

    if (result.status === 'success') {
      const { order, payment } = result.data
      if (payment?.redirect_url) {
        window.location.href = payment.redirect_url
      } else {
        if (
          payment?.status === 'completed' &&
          payment?.payment_method === 'wallet' &&
          payment.redirect_url
        ) {
          snackStore.success('Wallet payment successful! Redirecting...')
          setTimeout(() => {
            window.location.href = payment.redirect_url
          }, 1500)
        } else {
          const successMessage = getSuccessMessage()
          snackStore.success(successMessage)
          checkoutStore.clearCart()
          checkoutStore.showPaymentMethodsDialog = false
          router.push(`/orders/order-${order.reference}`)
        }
      }
    } else {
      snackStore.error(result.message || 'Order creation failed.')
    }
  } catch (error: any) {
    console.error('Payment processing error:', error)
    const errorMessage = error.response?.data?.message || getErrorMessage()
    snackStore.error(errorMessage)
  } finally {
    processing.value = false
    showProcessing.value = false
  }
}

// Get success message based on transaction type
function getSuccessMessage() {
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Withdrawal processed successfully!'
    case 'deposit':
      return 'Deposit processed successfully!'
    default:
      return 'Payment processed successfully!'
  }
}

// Get error message based on transaction type
function getErrorMessage() {
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Withdrawal processing failed'
    case 'deposit':
      return 'Deposit processing failed'
    default:
      return 'Payment processing failed'
  }
}

// Navigate to help page
function navigateToHelp() {
  checkoutStore.showPaymentMethodsDialog = false
  router.push('/help')
}
</script>

<style scoped>
.amount-display {
  background-color: var(--v-primary-lighten5, #e3f2fd);
  color: var(--v-primary-darken2, #1976d2);
}

.fee-info {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
}

.payment-method-card {
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.payment-selected {
  border-color: var(--v-primary-base, #2196f3);
  background-color: var(--v-primary-lighten5, #e3f2fd);
}

.payment-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Compact styling */
.amount-display-compact {
  background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%);
  border: 1px solid rgba(98, 0, 234, 0.2);
}

.payment-method-card-compact {
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
}

.payment-method-card-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-selected {
  border-color: var(--v-primary-base, #2196f3);
  background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%);
  box-shadow: 0 2px 8px rgba(98, 0, 234, 0.2);
}

.payment-footer-compact {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
}

.action-button-compact {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .amount-display-compact {
    margin: 0 -8px 16px -8px;
  }
  
  .payment-method-card-compact {
    margin: 0 -8px 8px -8px;
  }
}
</style>
