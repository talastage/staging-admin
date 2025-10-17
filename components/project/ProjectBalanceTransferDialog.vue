<!-- components/project/BalanceTransferDialog.vue -->
<template>
  <BaseDialog
    v-model="dialogModel"
    :title="
      currentStep === 'amount'
        ? 'Transfer to Wallet'
        : currentStep === 'confirm'
        ? 'Confirm Transfer'
        : 'Transfer Successful'
    "
    :max-width="'450px'"
  >
    <!-- Amount Entry Step -->
    <v-form
      v-if="currentStep === 'amount'"
      ref="form"
      v-model="isFormValid"
      @submit.prevent="goToConfirmation"
    >
      <v-card-text>
        <div class="mb-4">
          <div class="text-subtitle-2 mb-2">Available Balance</div>
          <div class="text-h5 font-weight-bold">
            {{ formatAmount(availableBalance) }}
          </div>
        </div>

        <EnterAmount
          v-model="amount"
          :currency-symbol="currencySymbol"
          :max="availableBalance"
          :min="1"
        />
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :disabled="!isFormValid || !isValidAmount"
        >
          Continue
        </v-btn>
      </v-card-actions>
    </v-form>

    <!-- Confirmation Step -->
    <v-form
      v-else-if="currentStep === 'confirm'"
      @submit.prevent="handleTransfer"
    >
      <v-card-text>
        <v-list>
          <v-list-subheader class="text-subtitle-1 px-0">
            Transfer Details
          </v-list-subheader>

          <!-- Amount -->
          <v-list-item>
            <template #prepend>
              <v-icon color="primary">mdi-cash-multiple</v-icon>
            </template>
            <v-list-item-title>Amount</v-list-item-title>
            <v-list-item-subtitle class="text-right">
              {{ formatAmount(amount) }}
            </v-list-item-subtitle>
          </v-list-item>

          <!-- Destination Wallet -->
          <v-list-item>
            <template #prepend>
              <v-icon color="primary">mdi-wallet</v-icon>
            </template>
            <v-list-item-title>Destination Wallet</v-list-item-title>
            <template v-if="walletStore.isFetching">
              <v-list-item-subtitle>
                <v-skeleton-loader type="text" width="120" />
              </v-list-item-subtitle>
            </template>
            <v-list-item-subtitle
              v-else-if="walletStore.wallet"
              class="text-right"
            >
              {{ walletStore.wallet.data.wallet_code }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-else class="text-error">
              Failed to load wallet
            </v-list-item-subtitle>
          </v-list-item>

          <!-- Current Wallet Balance -->
          <v-list-item>
            <template #prepend>
              <v-icon color="primary">mdi-wallet-outline</v-icon>
            </template>
            <v-list-item-title>Current Wallet Balance</v-list-item-title>
            <template v-if="walletStore.isFetching">
              <v-list-item-subtitle>
                <v-skeleton-loader type="text" width="100" />
              </v-list-item-subtitle>
            </template>
            <v-list-item-subtitle v-else class="text-right">
              {{ formatAmount(Number(walletStore.currentBalance)) }}
            </v-list-item-subtitle>
          </v-list-item>

          <!-- New Balance After Transfer -->
          <v-list-item>
            <template #prepend>
              <v-icon color="success">mdi-wallet-plus</v-icon>
            </template>
            <v-list-item-title>New Balance After Transfer</v-list-item-title>
            <template v-if="walletStore.isFetching">
              <v-list-item-subtitle>
                <v-skeleton-loader type="text" width="100" />
              </v-list-item-subtitle>
            </template>
            <v-list-item-subtitle v-else class="text-right font-weight-bold">
              {{ formatAmount(Number(walletStore.currentBalance) + amount) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <!-- Error States -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-3"
          density="comfortable"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="currentStep = 'amount'"
          :disabled="isLoading"
        >
          Back
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="isLoading"
          :disabled="isLoading || !walletStore.wallet"
        >
          Confirm Transfer
        </v-btn>
      </v-card-actions>
    </v-form>

    <!-- Success Step -->
    <div v-else-if="currentStep === 'success'">
      <v-card-text>
        <v-alert type="success" variant="tonal" class="mt-3">
          You have successfully transferred {{ formatAmount(amount) }} into your
          wallet.
        </v-alert>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
          Close
        </v-btn>
        <v-btn color="primary" @click="goToWallet" :disabled="isLoading">
          Go to Wallet
        </v-btn>
      </v-card-actions>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'
import { useProjectInvestorBalanceStore } from '~/stores/useProjectInvestorBalanceStore'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

interface Props {
  modelValue: boolean
  availableBalance: number
  currencySymbol: string
  currencyCode: string
}

interface FormRef extends HTMLFormElement {
  resetValidation: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'transfer-success': [amount: number]
}>()

const snackMessage = useSnackMessageStore()
const { currencyFormatter } = useCurrencyFormatter()
const walletStore = useWalletStore()
const projectInvestorBalanceStore = useProjectInvestorBalanceStore()

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
const currentStep = ref<'amount' | 'confirm' | 'success'>('amount')

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
  currentStep.value = 'amount'
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

async function goToConfirmation(): Promise<void> {
  if (!isValidAmount.value) return
  await ensureWalletLoaded()
  currentStep.value = 'confirm'
}

async function handleTransfer(): Promise<void> {
  if (!isValidAmount.value) return

  isLoading.value = true
  error.value = ''

  try {
    // Use the store to handle the transfer
    const result = await projectInvestorBalanceStore.transferToWallet(
      amount.value,
      props.currencyCode
    )

    if (result.success) {
      // Refresh wallet so we can show updated balances
      await walletStore.fetchWallet()

      // Emit the transfer success event with the amount
      emit('transfer-success', amount.value)

      snackMessage.success(result.message || 'Funds transferred successfully')
      currentStep.value = 'success'
    } else {
      throw new Error(result.message || 'Transfer failed')
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'An unexpected error occurred'
    }
    currentStep.value = 'amount'
  } finally {
    isLoading.value = false
  }
}

function goToWallet(): void {
  router.push('/wallet')
  closeDialog()
}
</script>
