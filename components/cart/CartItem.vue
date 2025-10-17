<!-- components/cart/CartItem.vue -->
<template>
  <v-card class="cart-item" flat rounded="lg">
    <v-row no-gutters align="center">
      <!-- Icon/Media Column -->
      <v-col cols="12" sm="3" class="d-flex justify-center align-center pa-4">
        <template v-if="isWalletOperation">
          <v-avatar
            size="72"
            :color="item.payment_type === 'withdrawal' ? 'error' : 'primary'"
            class="elevation-1"
          >
            <v-icon size="42" color="white">
              {{
                item.payment_type === 'withdrawal'
                  ? 'mdi-cash-minus'
                  : 'mdi-cash-plus'
              }}
            </v-icon>
          </v-avatar>
        </template>
        <template v-else-if="isProjectType">
          <MediaThumbnail
            :thumbnailUrl="item.payable?.thumbnail_url"
            :videoUrl="item.payable?.video_url"
            :access_uuid="item.payable?.access_uuid"
            class="project-thumbnail rounded-lg overflow-hidden"
          />
        </template>
        <template v-else-if="isUserType">
          <div class="user-tip-container">
            <UserAvatar
              :username="item.payable?.username"
              :profile_photo="item.payable?.profile_photo"
              size="lg"
              class="mb-2"
            />
            <div class="text-center">
              <div class="font-weight-medium">
                {{ item.payable?.display_name }}
              </div>
              <div class="text-caption">@{{ item.payable?.username }}</div>
            </div>
          </div>
        </template>
      </v-col>

      <!-- Content Column -->
      <v-col cols="12" sm="9">
        <v-card-text>
          <div
            class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-3"
          >
            <h3 class="text-h6 font-weight-medium text-truncate mb-2 mb-sm-0">
              {{ displayName }}
            </h3>
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              text-color="white"
              class="status-chip"
            >
              {{ item.status }}
            </v-chip>
          </div>

          <p class="text-subtitle-2 text-medium-emphasis mb-3">
            {{ formatPaymentType(item.payment_type) }}
          </p>

          <!-- Transaction Info -->
          <template v-if="isWalletOperation">
            <div class="transaction-info pa-3 mb-4" :class="item.payment_type">
              <v-icon
                :color="item.payment_type === 'withdrawal' ? 'error' : 'info'"
                class="mr-2"
                size="18"
              >
                mdi-information
              </v-icon>
              <span class="text-body-2">
                {{ getTransactionDescription(item.payment_type) }}
              </span>
            </div>
          </template>

          <div
            class="d-flex flex-column flex-sm-row justify-space-between align-sm-center"
          >
            <div class="amount-display mb-3 mb-sm-0">
              <div class="text-body-2 text-medium-emphasis mb-1">Amount</div>
              <div class="text-h6 font-weight-bold">
                {{
                  formatCurrency(
                    item.paying_amount,
                    item.currency?.code || 'USD'
                  )
                }}
              </div>
            </div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              @click="removeFromCart(item.id)"
              prepend-icon="mdi-delete"
              rounded="lg"
              class="remove-btn"
            >
              Remove
            </v-btn>
          </div>
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

interface Payable {
  id: number
  name?: string
  display_name?: string
  thumbnail_url?: string
  video_url?: string
  access_uuid?: string
  username?: string
  profile_photo?: string
}

interface CartItem {
  id: number
  cart_id: number
  paying_amount: string | number
  status: string
  created_at: string
  updated_at: string
  currency?: Currency
  payable_type: string
  payable_id: number
  payment_type: string
  payable: Payable | null
}

const props = defineProps<{
  item: CartItem
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
}>()

// Detect item types based on payable_type
const isProjectType = computed(
  () => props.item.payable_type === 'App\\Models\\Project'
)
const isUserType = computed(
  () => props.item.payable_type === 'App\\Models\\User'
)
const isWalletOperation = computed(() =>
  ['deposit', 'withdrawal'].includes(props.item.payment_type)
)

// For status colors
const getStatusColor = (status: string) => {
  const statusColors = {
    pending: 'warning',
    paid: 'success',
    failed: 'error',
    canceled: 'grey',
    default: 'primary',
  }
  return statusColors[status] || statusColors.default
}

// Format payment type for display
const formatPaymentType = (type: string) => {
  const typeMapping = {
    project_watching: 'Project Purchase',
    tip: 'User Tip',
    deposit: 'Wallet Deposit',
    withdrawal: 'Wallet Withdrawal',
    default: 'Payment',
  }
  return typeMapping[type] || typeMapping.default
}

// Get transaction description
const getTransactionDescription = (type: string) => {
  if (type === 'withdrawal') {
    return 'Funds will be transferred to your linked account or mobile number provided.'
  }
  return 'Funds will be added to your wallet balance'
}

// Format currency with symbol
const formatCurrency = (amount: string | number, currencyCode = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  })
  return formatter.format(Number(amount))
}

const displayName = computed(() => {
  if (isWalletOperation.value) {
    return props.item.payment_type === 'withdrawal'
      ? 'Wallet Withdrawal'
      : 'Wallet Deposit'
  }
  if (isUserType.value) {
    return `Tip for ${
      props.item.payable?.display_name || props.item.payable?.username || 'User'
    }`
  }
  return props.item.payable?.name || 'Unknown Item'
})

const removeFromCart = (id: number) => {
  emit('remove', id)
}
</script>

<style scoped>
.cart-item {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.project-thumbnail {
  width: 100%;
  height: 120px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 12px;
  overflow: hidden;
}

.user-tip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 150px;
}

.status-chip {
  font-weight: 500;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.amount-display {
  font-weight: 500;
  color: var(--v-primary-base);
}

.transaction-info {
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.transaction-info.deposit {
  background-color: rgba(var(--v-theme-info), 0.1);
}

.transaction-info.withdrawal {
  background-color: rgba(var(--v-theme-error), 0.1);
}

.remove-btn {
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: rgba(var(--v-theme-error), 0.1);
}

@media (min-width: 600px) {
  .project-thumbnail {
    width: 100%;
    max-height: 120px;
  }
}
</style>
