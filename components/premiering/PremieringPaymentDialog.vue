<!-- components/premiering/PremieringPaymentDialog.vue -->
<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title || `Premiering in ${props.project?.premiering_category?.name || 'Selected Category'}`"
    max-width="800"
  >
    <template #title v-if="!requirementsStore.loading">
      <div class="d-flex align-center">
        <v-avatar
          :image="props.project?.premiering_category?.avatar_url"
          size="40"
          class="mr-3"
        />
        <span class="text-h5">
          {{
            title ||
            `Premiering in ${
              props.project?.premiering_category?.name || 'Selected Category'
            }`
          }}
        </span>
      </div>
    </template>
    
    <!-- Skeleton Loader -->
    <template v-if="requirementsStore.loading">
      <v-row>
        <v-col cols="12" md="6">
          <v-skeleton-loader type="card" height="200" />
        </v-col>
        <v-col cols="12" md="6">
          <v-skeleton-loader type="card" height="200" />
        </v-col>
      </v-row>
      <v-skeleton-loader type="card" height="100" class="mt-4" />
    </template>

    <!-- Content when loaded -->
    <template v-else>
      <!-- Display error message if provided -->
      <AlertMessage
        v-if="errorMessage"
        :message="errorMessage"
        type="error"
        :visible="true"
        :dismissTime="5000"
        class="mt-2"
      />
          <!-- Premiering Requirements Section -->
          <v-card class="mb-6" elevation="2" v-if="showRequirements">
            <v-card-title class="text-h6">Premiering Requirements</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <PremieringMediaRequirements
                    title="Main Video Requirements"
                    :max-size="requirementsStore.formattedMaxFileSize"
                    :resolution="requirementsStore.mainRequirements.resolution"
                    :format="requirementsStore.mainRequirements.format"
                    :duration="requirementsStore.mainRequirements.duration"
                    layout="vertical"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <PremieringMediaRequirements
                    title="Trailer Requirements"
                    :max-size="requirementsStore.formattedMaxFileSize"
                    :resolution="
                      requirementsStore.trailerRequirements.resolution
                    "
                    :format="requirementsStore.trailerRequirements.format"
                    :duration="requirementsStore.trailerRequirements.duration"
                    layout="vertical"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Payment Confirmation Card -->
          <PaymentConfirmationCard
            v-if="isEligible"
            :amount="
              requirementsStore.requirements?.premiering_fee?.amount || 0
            "
            :currency-symbol="
              requirementsStore.requirements?.premiering_fee?.currency
                ?.symbol || ''
            "
            :currency-code="
              requirementsStore.requirements?.premiering_fee?.currency?.code ||
              ''
            "
            :loading="requirementsStore.loading"
            :disabled="!isEligible"
            :payment-label="paymentLabel"
          >
            <template #actions>
              <!-- Continue to Upload Button -->
              <v-btn
                v-if="project === null || project?.payment_status === 'pending'"
                color="primary"
                block
                height="40"
                :loading="requirementsStore.loading"
                :disabled="!isEligible"
                @click="handleContinue"
              >
                <v-icon start>mdi-arrow-right</v-icon>
                Continue to upload
              </v-btn>
              <!-- Pay Now Button -->
              <v-btn
                v-else
                color="primary"
                block
                size="large"
                :loading="isProcessing"
                @click="handlePayment"
              >
                Pay Now
              </v-btn>
            </template>
          </PaymentConfirmationCard>

          <!-- Payment Error Handling -->
          <template v-if="!isEligible">
            <WalletStatusAlert
              :amount="premieringFee.amount"
              :currency="premieringFee.currency"
              :wallet-status="walletStatus"
              :insufficient-funds-message="insufficientFundsMessage"
              :currency-mismatch-message="currencyMismatchMessage"
              :error-message="'Unable to verify wallet status. Please try again later.'"
              use-compact-layout
              :payment-label="paymentLabel"
              @validate="handleWalletValidation"
            />
          </template>

          <!-- Help Section -->
          <HelpPremiering v-if="!showRequirements" />
      </template>
    
    <template #actions>
      <v-spacer />
      <v-btn
        color="secondary"
        variant="tonal"
        @click="$emit('update:modelValue', false)"
      >
        Close
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PropType } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'
import { usePremieringMediaUploadRequirementsStore } from '~/stores/premiering/usePremieringMediaUploadRequirementsStore'
import { useWalletStatus } from '~/composables/useWalletStatus'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import BaseDialog from '~/components/dialogs/BaseDialog.vue'
import type { StudioProject } from '~/types/studio-project'

const props = defineProps({
  modelValue: Boolean,
  project: {
    type: Object as PropType<StudioProject>,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
  // NEW: Error message prop for showing errors from background uploads or payment issues.
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:modelValue',
  'payment-success',
  'payment-failed',
  'continue',
])

const walletStore = useWalletStore()
const requirementsStore = usePremieringMediaUploadRequirementsStore()
const snackStore = useSnackMessageStore()
const isProcessing = ref(false)
const router = useRouter()

const premieringFee = computed(() => ({
  amount: requirementsStore.requirements?.premiering_fee?.amount || 0,
  currency: {
    id: requirementsStore.requirements?.premiering_fee?.currency?.id || 0,
    code: requirementsStore.requirements?.premiering_fee?.currency?.code || '',
    symbol:
      requirementsStore.requirements?.premiering_fee?.currency?.symbol || '',
  },
}))

const paymentLabel = computed(() => {
  const categoryName =
    requirementsStore.selectedCategory?.name || 'Selected Category'
  return `Premiering Fee for ${categoryName}`
})

// Using the new useWalletStatus composable instead of useWalletPaymentEligibility
const { status: walletStatus, isEligible } = useWalletStatus(premieringFee)

const selectedCategory = computed(
  () => requirementsStore.selectedCategory || props.project?.premiering_category
)

const insufficientFundsMessage = computed(() => {
  return `You need ${premieringFee.value.currency.symbol}${premieringFee.value.amount} to proceed, 
          but your current balance is ${premieringFee.value.currency.symbol}${walletStore.currentBalance}.`
})

const currencyMismatchMessage = computed(() => {
  return `Your wallet currency (${walletStore.currentCurrency?.code}) 
          doesn't match the payment currency (${premieringFee.value.currency.code}). 
          Please contact support.`
})

const showRequirements = computed(
  () => requirementsStore.requirements && !requirementsStore.error
)

const handleWalletValidation = (validation) => {
  // You can add additional logic here if needed
  console.log('Wallet validation:', validation)
}

const handleContinue = () => {
  emit('continue')
  emit('update:modelValue', false)
}

const handlePayment = async (): Promise<void> => {
  if (!isEligible.value) {
    snackStore.error('Please ensure you have sufficient funds to continue.')
    return
  }

  try {
    isProcessing.value = true

    // Build the payload following the pattern in TipDialog.vue
    const payload = {
      paying_amount: premieringFee.value.amount,
      currency_id: premieringFee.value.currency.id,
      payment_type: 'project_premiering',
      payable_type: 'App\\Models\\Project',
      payable_id: props.project?.id,
    }

    // Update to use /api/cart/items (new route) as in TipDialog.vue
    const { $axios } = useNuxtApp()
    const response = await $axios.post('/api/cart/items', payload)

    // Check new response signature (success = true/false)
    if (response.data?.success) {
      emit('payment-success', response.data)
      snackStore.success(
        response.data.message || 'Premiering fee added to cart successfully!'
      )

      // Redirect to checkout using window.location for a full page navigation
      window.location.href = '/checkout'
    } else {
      throw new Error(response.data?.message || 'Transaction failed')
    }
  } catch (error: any) {
    emit('payment-failed', error)

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
          'Failed to process payment. Please try again.'
      )
    }
  } finally {
    isProcessing.value = false
  }
}
// Fetch initial data if needed
onMounted(async () => {
  if (props.project?.premiering_category) {
    await requirementsStore.selectCategory(props.project.premiering_category)
  }
})
</script>
