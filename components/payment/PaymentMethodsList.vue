<template>
  <v-card class="payment-methods-card rounded-xl elevation-3">
    <v-card-title class="text-h5 pt-6 pb-3 px-6">
      <v-icon size="28" color="primary" class="mr-2"
        >mdi-credit-card-outline</v-icon
      >
      {{ methodsTitle }}
    </v-card-title>

    <v-card-subtitle class="px-6">
      Select your preferred {{ methodsSubtitle }} method
    </v-card-subtitle>

    <v-divider class="mx-4 my-2"></v-divider>

    <v-card-text class="px-4 methods-container">
      <div v-if="loading" class="d-flex justify-center align-center pa-4">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>

      <div v-else-if="error" class="error-container pa-4 text-center">
        <v-icon color="error" class="mb-2">mdi-alert-circle</v-icon>
        <div class="text-body-1 text-error">{{ error }}</div>
        <v-btn
          color="primary"
          size="small"
          class="mt-2"
          @click="fetchPaymentMethods"
        >
          Retry
        </v-btn>
      </div>

      <div v-else-if="paymentMethods.length === 0" class="text-center pa-4">
        <v-icon color="grey" size="48" class="mb-2">mdi-credit-card-off</v-icon>
        <div class="text-body-1 text-medium-emphasis">
          No {{ methodsSubtitle.toLowerCase() }} methods available for your
          country
        </div>
      </div>

      <v-list v-else class="payment-methods-list pa-0">
        <v-list-item
          v-for="method in paymentMethods"
          :key="method.id"
          :class="{ 'selected-method': isMethodSelected(method) }"
          @click="selectMethod(method)"
          class="payment-method-item mb-2 rounded-lg"
        >
          <template v-slot:prepend>
            <v-avatar size="42" class="method-avatar mr-3">
              <v-img
                :src="getPaymentMethodIcon(method)"
                :alt="method.payment_method.name"
                cover
              ></v-img>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ method.payment_method.name }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ getPaymentMethodDescription(method) }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-icon
              v-if="isMethodSelected(method)"
              color="primary"
              icon="mdi-check-circle"
            ></v-icon>
            <v-icon v-else color="grey" icon="mdi-chevron-right"></v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions class="px-6 py-4 actions-container">
      <v-btn
        block
        color="primary"
        variant="tonal"
        class="help-button"
        prepend-icon="mdi-help-circle"
        :to="`/help/${props.transactionType}`"
      >
        {{ methodsSubtitle }} Help
      </v-btn>
    </v-card-actions>

    <!-- Help dialog is no longer needed since we're navigating to a help page -->
    <v-dialog v-model="showHelpDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ methodsTitle }} Help
        </v-card-title>
        <v-card-text class="pa-4">
          <h3 class="mb-2">Available {{ methodsTitle }}</h3>
          <p class="mb-4">
            We offer various {{ methodsSubtitle.toLowerCase() }} methods based
            on your country. If you don't see your preferred
            {{ methodsSubtitle.toLowerCase() }} method, please contact customer
            support.
          </p>

          <h3 class="mb-2">Having Issues?</h3>
          <ul class="mb-4">
            <li>
              Ensure your {{ methodsSubtitle.toLowerCase() }} details are
              correct
            </li>
            <li>Check your internet connection</li>
            <li>Verify that your account has sufficient funds</li>
            <li>
              Contact your bank if
              {{
                props.transactionType === 'withdrawal'
                  ? 'withdrawals'
                  : props.transactionType + 's'
              }}
              are being declined
            </li>
          </ul>

          <h3 class="mb-2">Need More Help?</h3>
          <p>
            Our support team is available 24/7 to assist you with any
            {{ methodsSubtitle.toLowerCase() }} issues.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showHelpDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCountryPaymentMethods } from '~/composables/useCountryPaymentMethods'
import { useWalletStore } from '~/stores/useWalletStore'

const props = defineProps({
  transactionType: {
    type: String,
    default: 'deposit',
  },
  selectedMethod: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['select-method'])

const walletStore = useWalletStore()

// Using the composable to fetch payment methods
const { paymentMethods, loading, error, fetchPaymentMethods } =
  useCountryPaymentMethods(props.transactionType)

// Dynamic title and subtitle based on transaction type
const methodsTitle = computed(() => {
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Withdrawal Methods'
    case 'deposit':
      return 'Deposit Methods'
    case 'payment':
    default:
      return 'Payment Methods'
  }
})

const methodsSubtitle = computed(() => {
  switch (props.transactionType) {
    case 'withdrawal':
      return 'Withdrawal'
    case 'deposit':
      return 'Deposit'
    case 'payment':
    default:
      return 'Payment'
  }
})

// Watch for transaction type changes
watch(
  () => props.transactionType,
  (newType) => {
    if (newType) {
      fetchPaymentMethods()
    }
  }
)

// Get formatted wallet balance
const formattedWalletBalance = computed(() => {
  if (!walletStore.currentBalance) {
    return (walletStore.currentCurrency?.code || 'RWF') + ' 0.00'
  }

  return (
    (walletStore.currentCurrency?.symbol ||
      walletStore.currentCurrency?.code ||
      'RWF') +
    ' ' +
    Number(walletStore.currentBalance).toFixed(2)
  )
})

// Fetch payment methods on component mount
onMounted(async () => {
  await fetchPaymentMethods()

  // Auto-select first method if none is selected
  if (paymentMethods.value.length > 0 && !props.selectedMethod) {
    selectMethod(paymentMethods.value[0])
  }
})

// Methods
const getPaymentMethodIcon = (method: any): string => {
  return (
    method.payment_method.logo_url || `/icons/${method.payment_method.type}.png`
  )
}

const getPaymentMethodDescription = (method: any): string => {
  switch (method.payment_method.type) {
    case 'wallet':
      return `Balance: ${formattedWalletBalance.value}`
    case 'mobile_money':
      return `Provider: ${method.depositable?.name || 'N/A'}`
    case 'bank_transfer':
      return `Bank: ${method.depositable?.name || 'N/A'}`
    case 'card':
      return `${method.depositable?.name || 'Credit/Debit Card'}`
    default:
      return method.payment_method.name
  }
}

const isMethodSelected = (method: any): boolean => {
  return props.selectedMethod && props.selectedMethod.id === method.id
}

const selectMethod = (method: any) => {
  emit('select-method', method)
}
</script>

<style scoped>
.payment-methods-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.methods-container {
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

.payment-method-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.payment-method-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

.selected-method {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid var(--v-primary-base);
}

.method-avatar {
  background-color: white;
  border: 1px solid #e0e0e0;
}

.actions-container {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.help-button {
  transition: transform 0.2s;
}

.help-button:hover {
  transform: scale(1.02);
}

.error-container {
  border: 1px dashed #ff5252;
  border-radius: 8px;
}

@media (max-width: 959px) {
  .methods-container {
    max-height: 300px;
  }
}
</style>
