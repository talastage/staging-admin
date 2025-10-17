<template>
  <v-card class="transfer-detail-card w-100" elevation="10">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="d-flex align-center justify-center pa-4"
      style="height: 200px"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      ></v-progress-circular>
      <span class="ml-4 text-medium-emphasis">Checking transfer status...</span>
    </div>

    <template v-else>
      <!-- Header with Status -->
      <v-card-item :class="statusClass" class="d-flex align-center pa-4">
        <v-icon
          :icon="statusIcon"
          :color="statusColor"
          size="36"
          class="mr-4"
        ></v-icon>
        <v-card-title tag="h2" class="text-h5 font-weight-bold">{{
          statusTitle
        }}</v-card-title>
        <v-spacer></v-spacer>
        <v-chip
          v-if="transferData"
          class="text-capitalize"
          :color="statusColor"
          size="small"
          variant="elevated"
          text-color="white"
        >
          {{ transferData.status }}
        </v-chip>
      </v-card-item>

      <p v-if="errorMessage" class="error-message mx-4 pa-2">
        {{ errorMessage }}
      </p>

      <!-- Transfer Details -->
      <v-card-text
        v-if="transferData && transferStatus !== 'failed'"
        class="px-4 pt-2 pb-0"
      >
        <!-- Amount Card -->
        <v-card
          elevation="10"
          class="mb-4 pa-3"
          color="primary"
          variant="elevated"
        >
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <p class="text-caption text-medium-emphasis mb-0">
                Amount Transferred
              </p>
              <h3 class="text-h4 font-weight-bold text-white mb-0">
                {{
                  formatCurrency(
                    transferData.amount,
                    transferData.currency.code
                  )
                }}
              </h3>
              <p class="text-caption text-white text-medium-emphasis mt-0">
                {{ transferData.currency.code }}
              </p>
            </div>
            <v-icon
              icon="mdi-bank-transfer"
              color="white"
              size="large"
            ></v-icon>
          </div>
        </v-card>

        <!-- Recipient Info -->
        <v-card elevation="10" class="mb-4">
          <v-card-item class="px-4 py-2">
            <v-card-subtitle class="pb-0 pt-0 text-caption"
              >Sent To</v-card-subtitle
            >
            <div class="d-flex align-center mt-1">
              <UserAvatar
                :profile_photo="transferData.receiver?.profile_photo"
                :username="transferData.receiver?.username"
                size="md"
                class="mr-3"
              />
              <div>
                <v-card-title class="pa-0 text-subtitle-1">{{
                  transferData.receiver?.display_name
                }}</v-card-title>
                <v-card-subtitle class="pa-0 text-caption"
                  >@{{ transferData.receiver?.username }}</v-card-subtitle
                >
              </div>
            </div>
          </v-card-item>
        </v-card>

        <!-- Transfer Details -->
        <v-card elevation="10" class="mb-4">
          <v-list density="compact">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-identifier"
                  color="primary"
                  size="small"
                ></v-icon>
              </template>
              <v-list-item-title class="text-caption"
                >Reference Number</v-list-item-title
              >
              <v-list-item-subtitle
                class="text-right text-caption text-truncate"
                style="max-width: 180px"
              >
                {{ transferData.reference_number }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-calendar"
                  color="primary"
                  size="small"
                ></v-icon>
              </template>
              <v-list-item-title class="text-caption"
                >Date & Time</v-list-item-title
              >
              <v-list-item-subtitle class="text-right text-caption">{{
                formatDate(transferData.created_at)
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-card-text>

      <!-- Action Buttons -->
      <v-card-actions class="px-4 py-3">
        <v-btn
          v-if="transferStatus === 'pending'"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="checkStatus"
          size="small"
        >
          Check Status
        </v-btn>
        <v-btn
          v-else-if="transferStatus === 'failed'"
          color="primary"
          to="/wallet/transfer"
          prepend-icon="mdi-refresh"
          size="small"
        >
          Try Again
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="tonal"
          to="/wallet"
          prepend-icon="mdi-wallet"
          size="small"
        >
          Back to Wallet
        </v-btn>
        <v-btn
          v-if="transferStatus === 'completed'"
          color="primary"
          to="/wallet/transfer"
          prepend-icon="mdi-bank-transfer"
          size="small"
        >
          New Transfer
        </v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useToast } from 'vue-toastification'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

interface CurrencyInfo {
  code: string
  symbol: string
}

interface ReceiverInfo {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

interface TransferData {
  reference_number: string
  amount: string | number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  currency: CurrencyInfo
  receiver: ReceiverInfo
  sender_wallet_id: number
  receiver_wallet_id: number
}

// Setup
const route = useRoute()
const toast = useToast()
const snackStore = useSnackMessageStore()
const { $axios } = useNuxtApp()

// State
const loading = ref(true)
const transferStatus = ref<
  'pending' | 'completed' | 'failed' | 'cancelled' | null
>(null)
const transferData = ref<TransferData | null>(null)
const errorMessage = ref('')

// Computed properties for UI
const statusClass = computed(() => {
  if (!transferStatus.value) return ''
  return `status-${transferStatus.value}`
})

const statusColor = computed(() => {
  switch (transferStatus.value) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
    case 'cancelled':
      return 'error'
    default:
      return 'grey'
  }
})

const statusIcon = computed(() => {
  switch (transferStatus.value) {
    case 'completed':
      return 'mdi-check-circle'
    case 'pending':
      return 'mdi-clock-outline'
    case 'failed':
      return 'mdi-alert-circle'
    case 'cancelled':
      return 'mdi-cancel'
    default:
      return 'mdi-help-circle'
  }
})

const statusTitle = computed(() => {
  switch (transferStatus.value) {
    case 'completed':
      return 'Transfer Successful!'
    case 'pending':
      return 'Transfer in Progress'
    case 'failed':
      return 'Transfer Failed'
    case 'cancelled':
      return 'Transfer Cancelled'
    default:
      return 'Transfer Status'
  }
})

// Use composables
const { formatLocalDateTime } = useDateFormatter()
const { currencyFormatter } = useCurrencyFormatter()

// Formatting helpers
const formatCurrency = (amount: string | number, currency: string) => {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount)
  } catch (error) {
    return `${amount} ${currency || 'USD'}`
  }
}

const formatDate = (date: string) => {
  return formatLocalDateTime(date)
}

// API call
const checkStatus = async () => {
  try {
    loading.value = true

    // Get reference from route params (for dynamic route) or query params
    const referenceNumber =
      (route.params.referenceNumber as string) ||
      (route.query.reference as string)

    if (!referenceNumber) {
      throw new Error('No reference number provided')
    }

    // Use Nuxt's $axios instance
    const { data } = await $axios.get(`/api/wallet/transfer/${referenceNumber}`)

    if (data.status === 'success') {
      transferData.value = data.data
      transferStatus.value = data.data.status

      if (data.data.status === 'completed') {
        snackStore.success('Transfer completed successfully')
      }
    } else {
      throw new Error(data.message || 'Failed to get transfer status')
    }
  } catch (error: any) {
    console.error('Status check failed:', error)
    transferStatus.value = 'failed'
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Could not check transfer status'
    snackStore.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  checkStatus()
})
</script>

<style scoped>
.transfer-detail-card {
  overflow: hidden;
}

.error-message {
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-completed {
  background-color: #f0fff4;
  border-bottom: 1px solid #c6f6d5;
}

.status-pending {
  background-color: #fffaf0;
  border-bottom: 1px solid #feebc8;
}

.status-failed,
.status-cancelled {
  background-color: #fff5f5;
  border-bottom: 1px solid #fed7d7;
}
</style>
