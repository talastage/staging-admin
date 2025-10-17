<template>
  <BaseDialog
    v-model="dialog"
    :title="`Support ${entityTypeDisplay}`"
    @update:modelValue="handleDialogUpdate"
    max-width="500px"
  >
    <v-container class="pa-0">
      <!-- Entity Info -->
      <v-row no-gutters class="mb-4">
        <v-col cols="12">
          <UserCard
            v-if="entityType === 'user'"
            :user="entity"
            layout="compact"
            class="entity-card"
          />
          <ProjectHeader
            v-else-if="entityType === 'project'"
            :project="entity"
            compact
            class="entity-card"
          />
        </v-col>
      </v-row>

      <!-- Only show amount selection if user is logged in -->
      <template v-if="isLoggedIn">
        <!-- DefaultAmountSelector -->
        <v-row no-gutters class="mb-4">
          <v-col cols="12">
            <div class="amount-section-header mb-2">
              <BaseTitle size="h5" class="support-amount-title text-center">
                Choose your support amount
              </BaseTitle>
            </div>

            <v-card variant="outlined" class="pa-4 amount-selector-card">
              <DefaultAmountSelector
                v-model="amount"
                :currency="selectedCurrency"
                :maxAmount="100000"
              />
            </v-card>
          </v-col>
        </v-row>

        <!-- Give Tip Button -->
        <v-row no-gutters>
          <v-col cols="12">
            <v-btn
              color="primary"
              block
              class="give-tip-button"
              @click="handleGiveTip"
              :disabled="!isAmountValid || isProcessing"
              :loading="isProcessing"
              size="large"
              elevation="3"
            >
              <v-icon start>mdi-gift</v-icon>
              {{
                isProcessing
                  ? 'Processing...'
                  : `Send ${formattedAmount} Support`
              }}
            </v-btn>

            <div class="text-center mt-2 text-caption text-grey">
              <v-icon size="x-small" class="mr-1">mdi-shield-check</v-icon>
              Secure payment processing
            </div>
          </v-col>
        </v-row>
      </template>

      <!-- Non-logged-in user content -->
      <template v-else>
        <v-alert
          type="info"
          class="mb-4"
          variant="tonal"
          border="start"
          density="comfortable"
        >
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          Please log in or register to support this
          {{ entityTypeDisplay.toLowerCase() }}.
        </v-alert>
        <v-row>
          <v-col cols="6">
            <LoginButton useDialog @login-success="handleLoginSuccess" />
          </v-col>
          <v-col cols="6">
            <RegisterButton @register-success="handleRegisterSuccess" />
          </v-col>
        </v-row>
      </template>
    </v-container>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useCurrencyStore } from '~/stores/useCurrencies'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'

interface Entity {
  id: number
  [key: string]: any
}

interface Currency {
  id: number
  code: string
  symbol: string
  [key: string]: any
}

const props = defineProps({
  modelValue: Boolean,
  entity: {
    type: Object as () => Entity,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
    validator: (value: string) => ['user', 'project'].includes(value),
  },
  defaultAmount: {
    type: Number,
    default: 0, // Change from 100 to 0 to allow DefaultAmountSelector to use API values
  },
})

const emit = defineEmits(['update:modelValue', 'transactionComplete'])

const router = useRouter()
const snackStore = useSnackMessageStore()
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)
const { currencyFormatter } = useCurrencyFormatter()

// Use the currency store instead of hardcoded values
const currencyStore = useCurrencyStore()
const { selectedCurrency } = storeToRefs(currencyStore)

// This is the actual tip amount the user chooses (will be set by DefaultAmountSelector)
const amount = ref<number>(props.defaultAmount)

// If you have a max limit, set it here
const maxAmount = ref<number>(100000)

// Entity icon based on type
const entityIcon = computed(() => {
  return props.entityType === 'user' ? 'mdi-account' : 'mdi-folder-open'
})

// Fetch currencies when component mounts
onMounted(async () => {
  if (!currencyStore.isFetched) {
    // Fetch the appropriate currencies based on authentication status
    if (isLoggedIn.value) {
      await currencyStore.fetchCurrencies()
    } else {
      await currencyStore.fetchGuestCurrencies()
    }
  }
})

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// A computed property that returns formatted currency amount
const formattedAmount = computed<string>(() => {
  if (!selectedCurrency.value) return `${Number(amount.value).toFixed(2)}`

  const { symbol, code } = selectedCurrency.value
  const displaySymbol = symbol || ''

  // Use the formatter with proper error handling
  const formatted = currencyFormatter(Number(amount.value), displaySymbol, code)
  return formatted || `${displaySymbol}${Number(amount.value).toFixed(2)}`
})

// Validate if amount is within range
const isAmountValid = computed<boolean>(() => {
  const val = Number(amount.value)
  return !isNaN(val) && val > 0 && val <= maxAmount.value
})

const entityTypeDisplay = computed<string>(() => {
  return props.entityType === 'user' ? 'User' : 'Project'
})

function handleDialogUpdate(value: boolean): void {
  dialog.value = value
}

function handleLoginSuccess(): void {
  authStore.fetchUser()
  // After login, fetch the authenticated user's currencies
  currencyStore.fetchCurrencies()
}

function handleRegisterSuccess(): void {
  authStore.fetchUser()
  // After registration, fetch the authenticated user's currencies
  currencyStore.fetchCurrencies()
}

const isProcessing = ref<boolean>(false)

interface TipPayload {
  paying_amount: number
  currency_id: number | undefined
  payment_type: string
  payable_type: string
  payable_id: number
}

async function handleGiveTip(): Promise<void> {
  if (!isLoggedIn.value) {
    snackStore.error('Please log in to continue.')
    return
  }
  if (!isAmountValid.value) {
    snackStore.error('Please enter a valid amount.')
    return
  }

  try {
    isProcessing.value = true

    // Build the payload
    const payload: TipPayload = {
      paying_amount: Number(amount.value),
      currency_id: selectedCurrency.value?.id,
      payment_type: props.entityType === 'user' ? 'tip' : 'project_tip',
      payable_type: 'App\\Models\\' + entityTypeDisplay.value,
      payable_id: props.entity.id,
    }

    // Update to use /api/cart/items (new route)
    const { $axios } = useNuxtApp()
    const response = await $axios.post('/api/cart/items', payload)

    // Check new response signature (success = true/false)
    if (response.data?.success) {
      dialog.value = false
      // Use API's message or a fallback success message
      snackStore.success(
        response.data.message || 'Support added to cart successfully!'
      )

      // Optionally emit transaction complete
      emit('transactionComplete', Number(amount.value))

      // Redirect to checkout
      router.push('/checkout')
    } else {
      throw new Error(response.data?.message || 'Transaction failed')
    }
  } catch (error: any) {
    if (error.response?.status === 422) {
      snackStore.error(
        error.response.data.message || 'Invalid transaction data'
      )
    } else if (error.response?.status === 403) {
      snackStore.error('You are not authorized to perform this transaction')
    } else if (error.response?.status === 429) {
      snackStore.error('Too many attempts. Please try again later')
    } else {
      snackStore.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to process support. Please try again.'
      )
    }
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.entity-header {
  display: flex;
  align-items: center;
}

.entity-card {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.02);
}

.amount-section-header {
  display: flex;
  justify-content: center;
  align-items: center;
}
.support-amount-title {
  width: 100%;
}

.amount-selector-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.amount-selector-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.give-tip-button {
  height: 54px;
  font-size: 1.1rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.give-tip-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}
</style>
