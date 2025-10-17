<template>
  <div class="wallet-payment-form">
    <!-- Compact Wallet Payment Container -->
    <div class="wallet-payment-compact">
      <!-- Compact Payment Header -->
      <div class="payment-header-compact mb-3">
        <div class="d-flex align-center">
          <v-avatar size="32" class="mr-3" color="primary">
            <v-icon color="white" size="18">mdi-wallet</v-icon>
          </v-avatar>
          <div>
            <h4 class="text-h6 font-weight-bold mb-0">Pay with your wallet</h4>
            <p class="text-caption text-medium-emphasis mb-0">
              Use your wallet balance
            </p>
          </div>
        </div>
      </div>

      <!-- Compact Wallet Status Alert -->
      <WalletStatusAlert
        :amount="amount"
        :currency="currency"
        @validate="handleWalletValidation"
        @deposit-click="handleDepositClick"
        @activate-click="handleActivateClick"
      />
    </div>

    <!-- Pin Verification Dialog -->
    <WalletPinVerificationDialog
      v-model="showPinDialog"
      @verified="handlePinVerified"
      @error="handlePinError"
      @forgot-pin="handleForgotPin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '~/stores/useWalletStore'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['validate', 'processing', 'payment-complete'])

const router = useRouter()
const walletStore = useWalletStore()
const snackStore = useSnackMessageStore()

// Pin verification
const showPinDialog = ref(false)
const isPinVerified = ref(false)
const isPinProcessing = ref(false)
const walletValidationStatus = ref({ valid: false, status: '', data: {} })

// Handler for wallet validation events from the WalletStatusAlert component
function handleWalletValidation(validationData) {
  walletValidationStatus.value = validationData
  emit('validate', validationData)
}

// Watch for changes in pin verification status
watch(
  () => isPinVerified.value,
  (verified) => {
    if (verified) {
      emit('validate', {
        ...walletValidationStatus.value,
        isPinVerified: true,
      })
    }
  }
)

// Custom handlers for button clicks from WalletStatusAlert
function handleDepositClick() {
  router.push('/wallet/deposit')
}

function handleActivateClick() {
  router.push('/wallet/activate')
}

// Pin verification handlers
function showPinVerification() {
  showPinDialog.value = true
}

function handlePinVerified() {
  isPinVerified.value = true
  isPinProcessing.value = false
  emit('payment-complete')
}

function handlePinError(err: any) {
  isPinVerified.value = false
  isPinProcessing.value = false
  snackStore.error(err?.message || 'PIN verification failed')
}

function handleForgotPin() {
  router.push('/wallet/reset-pin')
}

// Expose the showPinVerification method to parent component
defineExpose({
  showPinVerification,
})
</script>

<style scoped>
.wallet-payment-form {
  width: 100%;
}

.wallet-payment-compact {
  width: 100%;
  padding: 0;
}

.payment-header-compact {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 12px;
}

@media (max-width: 600px) {
  .payment-header-compact {
    text-align: center;
    padding-bottom: 8px;
  }
  
  .payment-header-compact .d-flex {
    justify-content: center;
  }
}
</style>
