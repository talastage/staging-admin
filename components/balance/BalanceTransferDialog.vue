<!-- components/balance/BalanceTransferDialog.vue -->
<template>
  <BaseDialog
    v-model="dialogModel"
    title="Transfer to Wallet"
    :max-width="'400px'"
  >
    <!-- Loading State -->
    <v-card-text v-if="walletStore.isFetching" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" class="mb-3" />
      <p class="text-body-2">Loading wallet...</p>
    </v-card-text>

    <!-- Inactive Wallet Message -->
    <v-card-text v-else-if="!walletStore.isWalletActive" class="text-center py-6">
      <v-icon color="warning" size="48" class="mb-3">mdi-wallet-outline</v-icon>
      <p class="text-body-1 mb-4">Your wallet is currently inactive.</p>
      <v-btn
        color="primary"
        variant="elevated"
        @click="navigateToActivate"
      >
        Activate Wallet
      </v-btn>
    </v-card-text>

    <v-form v-else ref="form" v-model="isFormValid" @submit.prevent="handleTransfer">
      <v-card-text class="pb-2">
        <!-- Amount Input -->
        <EnterAmount
          v-model="amount"
          :currency-symbol="currencySymbol"
          :max="availableBalance"
          :min="1"
          class="mb-4"
        />

        <!-- Transfer Preview -->
        <v-card
          v-if="amount > 0"
          variant="outlined"
          class="bg-surface-variant"
          elevation="0"
        >
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2">Current Wallet Balance</span>
              <template v-if="walletStore.isFetching">
                <v-skeleton-loader type="text" width="80" height="16" />
              </template>
              <span v-else class="text-body-2">
                {{ formatAmount(Number(walletStore.currentBalance)) }}
              </span>
            </div>

            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2 font-weight-medium"
                >New Wallet Balance</span
              >
              <template v-if="walletStore.isFetching">
                <v-skeleton-loader type="text" width="80" height="16" />
              </template>
              <span v-else class="text-body-2 font-weight-bold text-success">
                {{ formatAmount(Number(walletStore.currentBalance) + amount) }}
              </span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-3"
          density="compact"
        >
          {{ error }}
        </v-alert>

        <!-- Success Alert -->
        <v-alert
          v-if="showSuccess"
          type="success"
          variant="tonal"
          class="mt-3"
          density="compact"
        >
          Transfer completed successfully!
        </v-alert>
      </v-card-text>

      <v-card-actions class="pt-2">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="isLoading"
          :disabled="!isFormValid || !isValidAmount || showSuccess"
        >
          {{ showSuccess ? 'Completed' : 'Transfer Now' }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

interface Props {
  modelValue: boolean
  availableBalance: number
  currencySymbol: string
  currencyCode: string
  transferEndpoint: string
}

interface TransferResponse {
  success: boolean
  message: string
  data?: {
    new_tip_balance: string
    transaction_id: number
  }
}

interface FormRef extends HTMLFormElement {
  resetValidation: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'transfer-success': [amount: number]
}>()

const { $axios } = useNuxtApp()
const snackMessage = useSnackMessageStore()
const { currencyFormatter } = useCurrencyFormatter()
const walletStore = useWalletStore()

const router = useRouter()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const form: Ref<FormRef | null> = ref(null)
const isFormValid = ref(true)
const amount = ref(0)
const error = ref<string>('')
const isLoading = ref(false)
const showSuccess = ref(false)

const isValidAmount = computed((): boolean => {
  return amount.value > 0 && amount.value <= props.availableBalance
})

const formatAmount = (value: number): string => {
  return currencyFormatter(value, props.currencySymbol, props.currencyCode)
}

const closeDialog = (): void => {
  dialogModel.value = false
  resetForm()
}

const resetForm = (): void => {
  amount.value = 0
  error.value = ''
  isLoading.value = false
  showSuccess.value = false
  if (form.value) {
    form.value.resetValidation()
  }
}

watch(
  () => props.modelValue,
  (newVal: boolean) => {
    if (newVal) {
      resetForm()
      ensureWalletLoaded()
    }
  }
)

// Ensure the wallet is loaded before proceeding
async function ensureWalletLoaded(): Promise<void> {
  if (!walletStore.wallet && !walletStore.isFetching) {
    await walletStore.fetchWallet()
  }
}

function navigateToActivate(): void {
  router.push('/wallet/activate')
  closeDialog()
}

async function handleTransfer(): Promise<void> {
  if (!isValidAmount.value) return

  isLoading.value = true
  error.value = ''

  try {
    await ensureWalletLoaded()

    const response = await $axios.post<TransferResponse>(
      props.transferEndpoint,
      {
        amount: amount.value,
        currency_code: props.currencyCode,
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Transfer failed')
    }

    // Refresh wallet to show updated balances
    await walletStore.fetchWallet()

    // Emit the transfer success event
    emit('transfer-success', amount.value)

    // Show success state
    showSuccess.value = true

    snackMessage.success('Transfer completed successfully')
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = (err as any).response?.data?.message || err.message
    } else {
      error.value = 'Transfer failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
