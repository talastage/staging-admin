<template>
  <v-container>
    <v-card class="withdrawal-card elevation-3">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-cash-multiple" class="me-2" color="primary" />
        <span class="text-h5">Withdraw Funds</span>
      </v-card-title>

      <v-divider class="my-3" />

      <!-- Error Alert for Missing Country -->
      <v-alert
        v-if="!userCountryId"
        type="error"
        variant="tonal"
        icon="mdi-alert-circle"
        class="mx-4 mt-2"
      >
        <v-alert-title>Country Information Missing</v-alert-title>
        <p>
          Unable to load withdrawal methods. Please update your profile with
          country information.
        </p>
      </v-alert>

      <v-card-text v-else>
        <!-- Available Balance Indicator -->
        <v-card variant="flat" color="surface-variant" class="mb-6 pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-2 text-medium-emphasis">
                Available Balance
              </div>
              <div class="text-h5 mt-1">
                {{ currencySymbol }}
                {{ (wallet?.balance || 0).toLocaleString() }}
              </div>
            </div>
            <v-chip color="primary" variant="elevated">{{
              currencyCode
            }}</v-chip>
          </div>
        </v-card>

        <v-form
          ref="form"
          v-model="isFormValid"
          @submit.prevent="submitForm"
          class="mt-4"
        >
          <!-- Amount Field with Currency -->
          <v-text-field
            v-model.number="formData.amount"
            :label="`Amount to withdraw`"
            type="number"
            :rules="amountRules"
            :error-messages="errors.amount"
            variant="outlined"
            density="comfortable"
            required
            class="mb-6"
            hide-details="auto"
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-currency-usd" />
            </template>
            <template v-slot:append>
              {{ currencyCode }}
            </template>
          </v-text-field>

          <!-- Payment Method Selection -->
          <div class="mb-6">
            <h3 class="text-subtitle-1 mb-3">Payment Method</h3>
            <v-sheet
              class="payment-methods-container rounded-lg pa-2"
              elevation="0"
              color="surface-variant"
            >
              <v-radio-group
                v-model="selectedMethod"
                inline
                :disabled="submitting"
                hide-details
              >
                <template v-for="method in paymentMethods" :key="method.id">
                  <v-card
                    :class="[
                      'payment-method-card mb-2 pa-3',
                      selectedMethod?.id === method.id ? 'selected-method' : '',
                    ]"
                    @click="selectedMethod = method"
                    :elevation="selectedMethod?.id === method.id ? 2 : 0"
                    :color="
                      selectedMethod?.id === method.id
                        ? 'primary-container'
                        : undefined
                    "
                  >
                    <div class="d-flex align-center">
                      <v-radio :value="method" class="me-2" />
                      <v-avatar size="32" class="me-3" color="surface">
                        <v-img
                          v-if="method.logo_url"
                          :src="method.logo_url"
                          cover
                        />
                        <v-icon v-else>{{ getMethodIcon(method.type) }}</v-icon>
                      </v-avatar>
                      <span class="text-body-1">{{ method.name }}</span>
                    </div>
                  </v-card>
                </template>
              </v-radio-group>
            </v-sheet>
            <div
              v-if="errors.payment_method_id"
              class="text-error text-caption mt-1"
            >
              {{ errors.payment_method_id }}
            </div>
          </div>

          <!-- Dynamic Fields Based on Method Type -->
          <v-expand-transition>
            <div v-if="selectedMethod" class="method-details mb-6">
              <!-- Bank Transfer Fields -->
              <template v-if="selectedMethod.type === 'bank_transfer'">
                <h3 class="text-subtitle-1 mb-3">Bank Details</h3>
                <v-card variant="outlined" class="pa-4 mb-4">
                  <SelectBank
                    v-model="selectedBank"
                    class="mb-4"
                    :disabled="submitting"
                    :error-message="errors.bank_id"
                  />

                  <v-text-field
                    v-model="formData.bank_account_number"
                    label="Account Number"
                    :rules="bankAccountRules"
                    :error-messages="errors.account_number"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Enter your bank account number"
                    required
                    class="mb-4"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-identifier" />
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="formData.account_holder_name"
                    label="Account Holder Name"
                    :rules="accountHolderRules"
                    :error-messages="errors.account_holder_name"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Enter the name on your bank account"
                    required
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-account" />
                    </template>
                  </v-text-field>
                </v-card>
              </template>

              <!-- Mobile Money Fields -->
              <template v-if="selectedMethod.type === 'mobile_money'">
                <h3 class="text-subtitle-1 mb-3">Mobile Money Details</h3>
                <v-card variant="outlined" class="pa-4 mb-4">
                  <SelectMobileMoneyProvider
                    v-model="selectedProvider"
                    :disabled="submitting"
                    :error-message="errors.mobile_money_provider_id"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="formData.phone_number"
                    label="Phone Number"
                    :rules="phoneNumberRules"
                    :error-messages="errors.account_number"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Enter your mobile money number"
                    required
                    class="mb-4"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-phone" />
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="formData.account_holder_name"
                    label="Account Holder Name"
                    :rules="accountHolderRules"
                    :error-messages="errors.account_holder_name"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Enter the name on your mobile money account"
                    required
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-account" />
                    </template>
                  </v-text-field>
                </v-card>
              </template>
              <!-- Card Fields -->
              <template v-if="selectedMethod.type === 'card'">
                <h3 class="text-subtitle-1 mb-3">Card Details</h3>
                <v-card variant="outlined" class="pa-4 mb-4">
                  <SelectCard
                    v-model="selectedCard"
                    :disabled="submitting"
                    :error-message="errors.card_id"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="formData.account_holder_name"
                    label="Cardholder Name"
                    :rules="accountHolderRules"
                    :error-messages="errors.account_holder_name"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Enter the name on your card"
                    required
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-account" />
                    </template>
                  </v-text-field>
                </v-card>
              </template>
            </div>
          </v-expand-transition>

          <!-- General Error Message -->
          <v-alert
            v-if="errors.general"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
          >
            {{ errors.general }}
          </v-alert>

          <!-- Success Message -->
          <v-alert
            v-if="isSuccess"
            type="success"
            variant="tonal"
            class="mb-4"
            icon="mdi-check-circle"
          >
            <v-alert-title>Success!</v-alert-title>
            <p>Your withdrawal request has been submitted successfully.</p>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider class="my-2" />

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          variant="tonal"
          size="large"
          :disabled="submitting"
          to="/wallet"
          prepend-icon="mdi-arrow-left"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="submitting"
          :disabled="!isFormValid || submitting || !selectedMethod"
          size="large"
          @click="submitForm"
          prepend-icon="mdi-send"
          class="ms-2"
        >
          Submit Withdrawal
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Confirmation Dialog -->
    <WithdrawalConfirmDialog
      v-if="feeData"
      v-model="showConfirmDialog"
      :amount="formData.amount || 0"
      :fee-data="feeData"
      :loading="submitting"
      :is-success="Boolean(successData)"
      :error="withdrawalError"
      :success-data="successData"
      @confirm="handleConfirmedSubmission"
      @retry="handleConfirmedSubmission"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useWalletStore } from '~/stores/useWalletStore'

interface WithdrawalMethod {
  id: number
  name: string
  type: string
  logo_url: string | null
}

interface Bank {
  id: number
  name: string
  logo_url?: string
}

interface MobileMoneyProvider {
  id: number
  name: string
}

interface Card {
  id: number
  name: string
  last4: string
  expiry: string
}

interface FormData {
  amount: number | null
  bank_account_number: string
  account_holder_name: string
  phone_number: string
  card_number: string
}

interface FeeData {
  fee: number
  details: string
  gateway: string
  currency: {
    code: string
    symbol: string
  }
  formatted_fee: string
  total_amount: number
  formatted_total: string
}

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const { $axios } = useNuxtApp()

// Form refs and state
const form = ref<any>(null)
const errors = ref<Record<string, string>>({})
const isFormValid = ref(false)
const submitting = ref(false)
const isSuccess = ref(false)
const showConfirmDialog = ref(false)
const feeData = ref<FeeData | null>(null)
const successData = ref<{ reference_number: string; status: string } | null>(
  null
)
const withdrawalError = ref('')

// Payment methods
const paymentMethods = ref<WithdrawalMethod[]>([])
const loadingMethods = ref(false)

// Selection states
const selectedMethod = ref<WithdrawalMethod | null>(null)
const selectedBank = ref<Bank | null>(null)
const selectedProvider = ref<MobileMoneyProvider | null>(null)
const selectedCard = ref<Card | null>(null)

// Form data
const formData = ref<FormData>({
  amount: null,
  bank_account_number: '',
  account_holder_name: '',
  phone_number: '',
  card_number: '',
})

// Computed properties
const userCountryId = computed(() => authStore.user?.value?.country_id)
const wallet = computed(() => walletStore.wallet?.data)
const walletId = computed(() => wallet.value?.id)
const walletCurrency = computed(() => {
  const currency = wallet.value?.currency
  return typeof currency === 'object' ? currency : null
})

const currencySymbol = computed(() => walletCurrency.value?.symbol || '')
const currencyCode = computed(() => walletCurrency.value?.code || '')

// Validation Rules
const amountRules = [
  (v: number) => !!v || 'Amount is required',
  (v: number) => v > 0 || 'Amount must be greater than 0',
  (v: number) => Number.isInteger(v) || 'Amount must be a whole number',
  (v: number) => {
    const balance = wallet.value?.balance || 0
    return (
      v <= balance ||
      `Amount cannot exceed your balance of ${
        currencySymbol.value
      } ${balance.toLocaleString()}`
    )
  },
]

const bankAccountRules = [
  (v: string) => !!v || 'Account number is required',
  (v: string) =>
    v.length >= 10 || 'Account number must be at least 10 characters',
]

const accountHolderRules = [
  (v: string) => !!v || 'Account holder name is required',
  (v: string) => v.length >= 3 || 'Name must be at least 3 characters',
]

const phoneNumberRules = [
  (v: string) => !!v || 'Phone number is required',
  (v: string) =>
    v.length >= 10 || 'Phone number must be at least 10 characters',
  (v: string) => /^\d+$/.test(v) || 'Phone number must contain only digits',
]

// Fetch payment methods
const fetchPaymentMethods = async () => {
  if (!userCountryId.value) return

  loadingMethods.value = true
  try {
    const { data } = await $axios.get(
      `/api/countries/${userCountryId.value}/withdrawal-methods`
    )
    paymentMethods.value = data.withdrawal_methods
  } catch (error: any) {
    console.error(
      'Error fetching withdrawal methods:',
      error.response?.data || error.message
    )
    errors.value.general =
      'Failed to load payment methods. Please refresh and try again.'
  } finally {
    loadingMethods.value = false
  }
}

// Get icon based on payment method type
const getMethodIcon = (type: string): string => {
  const icons: Record<string, string> = {
    card: 'mdi-credit-card',
    mobile_money: 'mdi-phone',
    bank_transfer: 'mdi-bank',
  }
  return icons[type] || 'mdi-cash'
}

// Calculate fees based on gateway_fees table
const calculateFees = async () => {
  try {
    const response = await $axios.get('/api/gateway-fees/calculate', {
      params: {
        country_id: userCountryId.value,
        currency_id: walletCurrency.value?.id,
        payment_method_id: selectedMethod.value?.id,
        is_withdrawal: true,
        amount: formData.value.amount,
      },
    })

    if (response.data.success) {
      feeData.value = response.data.data
      return true
    }
    return false
  } catch (error: any) {
    console.error('Error calculating fees:', error)
    errors.value.general =
      error.response?.data?.message || 'Unable to calculate withdrawal fees'
    return false
  }
}

// Form submission handler
const submitForm = async () => {
  if (!form.value) return

  const { valid } = await form.value.validate()

  if (!valid || !selectedMethod.value || !walletId.value) {
    return
  }

  errors.value = {}

  // Calculate fees first
  const feesCalculated = await calculateFees()

  if (feesCalculated && feeData.value) {
    // Show confirmation dialog
    showConfirmDialog.value = true
  }
}

// Get the appropriate account number based on selected method
const getAccountNumber = () => {
  if (!selectedMethod.value) return null

  switch (selectedMethod.value.type) {
    case 'mobile_money':
      return formData.value.phone_number
    case 'bank_transfer':
      return formData.value.bank_account_number
    case 'card':
      return selectedCard.value?.last4
        ? `**** **** **** ${selectedCard.value.last4}`
        : null
    default:
      return null
  }
}

// Handle confirmed submission
const handleConfirmedSubmission = async () => {
  submitting.value = true
  withdrawalError.value = ''

  try {
    const accountNumber = getAccountNumber()

    if (!accountNumber) {
      throw new Error('Account number is required')
    }

    const payload = {
      amount: formData.value.amount,
      payment_method_id: selectedMethod.value?.id,
      bank_id: selectedBank.value?.id,
      mobile_money_provider_id: selectedProvider.value?.id,
      card_id: selectedCard.value?.id,
      wallet_id: walletId.value,
      currency_id: walletCurrency.value?.id,
      country_id: userCountryId.value,
      fee_amount: feeData.value?.fee ?? 0,
      total_amount: feeData.value?.total_amount ?? formData.value.amount,
      account_number: accountNumber,
      account_holder_name: formData.value.account_holder_name,
    }

    const { data } = await $axios.post('/api/withdrawal-requests', payload)

    if (data.success) {
      successData.value = data.data.withdrawal_request
      isSuccess.value = true
      await walletStore.fetchWallet()

      // Redirect to the withdrawal details page using the reference number
      const referenceNumber = data.data.withdrawal_request.reference_number
      router.push(
        `/wallet/transactions/withdrawal-requests/withdrawal-${referenceNumber}`
      )
    }
  } catch (error: any) {
    const apiError = error.response?.data
    withdrawalError.value = apiError?.errors
      ? Object.values(apiError.errors)[0]
      : apiError?.message ?? 'An error occurred while processing your request'
  } finally {
    submitting.value = false
  }
}

// Reset form handler
const resetForm = () => {
  formData.value = {
    amount: null,
    bank_account_number: '',
    account_holder_name: '',
    phone_number: '',
    card_number: '',
  }
  selectedMethod.value = null
  selectedBank.value = null
  selectedProvider.value = null
  selectedCard.value = null
  errors.value = {}
  isSuccess.value = false
  if (form.value) {
    form.value.reset()
  }
}

// Watch for selected method changes to reset related fields
watch(
  () => selectedMethod.value,
  (newMethod) => {
    // Reset provider and bank selections when method changes
    selectedBank.value = null
    selectedProvider.value = null
    selectedCard.value = null

    // Reset related form fields
    if (newMethod?.type !== 'bank_transfer') {
      formData.value.bank_account_number = ''
    }

    if (newMethod?.type !== 'mobile_money') {
      formData.value.phone_number = ''
    }

    if (newMethod?.type !== 'card') {
      // Reset any card specific fields if needed
    }

    // Always reset account holder name when changing methods
    formData.value.account_holder_name = ''
  }
)

// Fetch data on component mount
onMounted(async () => {
  // Fetch wallet data if not already loaded
  if (!walletStore.wallet) {
    await walletStore.fetchWallet()
  }

  // Fetch payment methods
  await fetchPaymentMethods()
})

// Navigation guard
onBeforeRouteLeave((to, from, next) => {
  if (submitting.value) {
    // Show confirmation if trying to leave during submission
    if (
      window.confirm(
        'A withdrawal is in progress. Are you sure you want to leave?'
      )
    ) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>

<style scoped>
.withdrawal-card {
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.payment-methods-container {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.payment-method-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.selected-method {
  border: 2px solid rgb(var(--v-theme-primary));
}

.method-details {
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
