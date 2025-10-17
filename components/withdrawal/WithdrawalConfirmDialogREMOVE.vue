<template>
  <BaseDialog
    v-model="dialog"
    :title="dialogTitle"
    :max-width="400"
    :show-close-button="true"
  >
    <div v-if="isSuccess" class="pa-4 text-center">
      <v-icon color="success" size="64" class="mb-4"> mdi-check-circle </v-icon>
      <h2 class="text-h5 mb-2">Withdrawal Request Submitted</h2>
      <p class="text-body-1 mb-4">
        Your withdrawal request has been submitted successfully. You can track
        its status in your transaction history.
      </p>
      <p class="text-subtitle-2 mb-2">Reference Number:</p>
      <p class="text-body-2 font-weight-bold">
        {{ successData?.reference_number }}
      </p>
    </div>

    <div v-else-if="error" class="pa-4 text-center">
      <v-icon color="error" size="64" class="mb-4"> mdi-alert-circle </v-icon>
      <h2 class="text-h5 mb-2">Withdrawal Failed</h2>
      <p class="text-body-1 text-error mb-4">
        {{ error }}
      </p>
    </div>

    <div v-else>
      <v-list>
        <v-list-item>
          <v-list-item-title>Amount to Withdraw</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ feeData.currency.symbol }} {{ formatAmount(amount) }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>Service Fee</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ feeData.formatted_fee }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item>
          <v-list-item-title class="text-subtitle-1 font-weight-bold">
            Total Amount
          </v-list-item-title>
          <v-list-item-subtitle
            class="text-right text-subtitle-1 font-weight-bold"
          >
            {{ feeData.formatted_total }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-alert
        v-if="feeData.details"
        type="info"
        class="mt-4"
        density="compact"
      >
        {{ feeData.details }}
      </v-alert>
    </div>

    <template #actions>
      <v-spacer></v-spacer>
      <template v-if="isSuccess">
        <v-btn color="primary" @click="goToWallet" block> Go to Wallet </v-btn>
      </template>

      <template v-else-if="error">
        <v-btn color="grey-darken-1" variant="text" @click="closeDialog">
          Close
        </v-btn>
        <v-btn color="primary" @click="retryWithdrawal">Try Again</v-btn>
      </template>

      <template v-else>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn color="primary" @click="confirmWithdrawal" :loading="loading">
          Confirm Withdrawal
        </v-btn>
      </template>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
// Make sure this import path is correct for your project structure
import BaseDialog from '../dialogs/BaseDialog.vue'

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

interface SuccessData {
  reference_number: string
  status: string
}

interface Props {
  modelValue: boolean
  amount: number
  feeData: FeeData
  loading?: boolean
  isSuccess?: boolean
  error?: string
  successData: SuccessData | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isSuccess: false,
  error: '',
  successData: null,
})

const router = useRouter()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  retry: []
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const dialogTitle = computed(() => {
  if (props.isSuccess) return ''
  if (props.error) return ''
  return 'Confirm Withdrawal'
})

const formatAmount = (amount: number) => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

const confirmWithdrawal = () => {
  emit('confirm')
}

const retryWithdrawal = () => {
  emit('retry')
}

const goToWallet = () => {
  router.push('/wallet')
}
</script>
