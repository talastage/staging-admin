<template>
  <v-dialog v-model="dialog" max-width="400px" persistent>
    <v-card class="transaction-confirm-dialog">
      <v-card-title class="text-h6 font-weight-bold pb-2">
        Confirm {{ capitalizedTransactionType }}
      </v-card-title>
      <v-card-text>
        <v-container v-if="loading">
          <v-row justify="center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-row>
        </v-container>
        <v-container v-else-if="error">
          <v-alert type="error" dense>{{ error }}</v-alert>
        </v-container>
        <v-container v-else class="pa-0">
          <DisplayAmount
            :amount="amount"
            :currency-symbol="currencySymbol"
            title="Amount"
            type="default"
          />
          <DisplayAmount
            :amount="calculatedFee"
            :currency-symbol="currencySymbol"
            title="Charge fee"
            type="fee"
          />
          <DisplayAmount
            :amount="totalAmount"
            :currency-symbol="currencySymbol"
            title="Total"
            type="total"
          />

          <div class="payment-method-section mt-4">
            <div class="text-subtitle-2 font-weight-medium mb-2">
              Payment Method
            </div>
            <v-card flat class="pa-2 d-flex align-center">
              <v-avatar size="36" color="grey lighten-2" class="mr-3">
                <v-icon
                  v-if="!selectedMethod.payment_method.logo_url"
                  size="24"
                  color="grey darken-2"
                  >mdi-credit-card</v-icon
                >
                <v-img
                  v-else
                  :src="selectedMethod.payment_method.logo_url"
                  :alt="selectedMethod.payment_method.name"
                ></v-img>
              </v-avatar>
              <div>
                <div class="text-subtitle-1">
                  {{ selectedMethod.payment_method.name }}
                </div>
                <div class="text-caption">
                  {{ paymentDetailsLabel }}: {{ paymentDetailsValue }}
                </div>
              </div>
            </v-card>
          </div>
        </v-container>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="confirmTransaction"
          :disabled="loading || error"
          class="confirm-button"
        >
          CONFIRM
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNuxtApp } from '#app'

const props = defineProps({
  show: Boolean,
  countryId: Number,
  gatewayId: Number,
  selectedMethod: Object,
  transactionType: String,
  amount: Number,
  paymentDetails: Object,
  currencySymbol: String,
})

const emit = defineEmits(['update:show', 'confirm'])

const { $axios } = useNuxtApp()

const dialog = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const loading = ref(false)
const error = ref(null)
const feePercentage = ref(0)
const calculatedFee = ref(0)

const capitalizedTransactionType = computed(() => {
  return (
    props.transactionType.charAt(0).toUpperCase() +
    props.transactionType.slice(1)
  )
})

const totalAmount = computed(() => {
  return props.transactionType === 'deposit'
    ? props.amount - calculatedFee.value
    : props.amount + calculatedFee.value
})

const paymentDetailsLabel = computed(() => {
  return props.selectedMethod.payment_method.type === 'mobile_money'
    ? 'Phone Number'
    : 'Account Number'
})

const paymentDetailsValue = computed(() => {
  return props.selectedMethod.payment_method.type === 'mobile_money'
    ? props.paymentDetails.phone_number
    : props.paymentDetails.account_number
})

const fetchFees = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await $axios.get('/api/gateway-fees', {
      params: {
        country_id: props.countryId,
        gateway_id: props.gatewayId,
        payment_method_id: props.selectedMethod.payment_method.id,
        transaction_type: props.transactionType,
      },
    })
    feePercentage.value = response.data.international_charge_fee_percentage
    calculatedFee.value = (props.amount * feePercentage.value) / 100
  } catch (err) {
    console.error('Error fetching fees:', err)
    error.value = 'Failed to fetch transaction fees. Please try again.'
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
}

const confirmTransaction = () => {
  emit('confirm', calculatedFee.value)
  closeDialog()
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      fetchFees()
    }
  }
)
</script>

<style scoped>
.transaction-confirm-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.payment-method-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.confirm-button {
  font-weight: bold;
}
</style>
