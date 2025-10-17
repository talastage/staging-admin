<!-- components/OrderHistoryItem.vue -->
<template>
  <BaseCard
    :to="`/orders/order-${order.reference}`"
    class="order-history-item"
    :elevation="2"
  >
    <div class="d-flex justify-space-between">
      <!-- Left Section: Order Info -->
      <div class="flex-grow-1">
        <div class="d-flex align-center mb-2">
          <div class="text-subtitle-1 font-weight-medium">
            #{{ order.reference }}
          </div>
          <v-chip
            size="small"
            :color="getOrderTypeColor(order.order_type)"
            class="ml-2"
            variant="flat"
          >
            {{ formatOrderType(order.order_type) }}
          </v-chip>
        </div>

        <div class="d-flex align-center text-grey text-body-2">
          <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
          <span class="mr-4">{{ formatRelativeDate(order.created_at) }}</span>
          <span class="text-caption">{{
            formatLocalDateTime(order.created_at)
          }}</span>
        </div>
      </div>

      <!-- Right Section: Amount and Status -->
      <div class="text-right">
        <div class="text-h6 mb-1">
          {{
            currencyFormatter(
              order.total_amount,
              order.currency.symbol,
              order.currency.code
            )
          }}
        </div>
        <StatusBadge :status="order.status" />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useDateFormatter } from '~/composables/useDateFormatter'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const { currencyFormatter } = useCurrencyFormatter()
const { formatRelativeDate, formatLocalDateTime } = useDateFormatter()

const formatOrderType = (type: string): string => {
  if (!type) return ''
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getOrderTypeColor = (type: string): string => {
  const colorMap = {
    tip: 'purple',
    project_watching: 'blue',
    project_tip: 'deep-purple',
    project_promotion: 'indigo',
    project_premiering: 'red',
    event_promotion: 'green',
    ticket_promotion: 'orange',
    user_profile_promotion: 'pink',
  }
  return colorMap[type] || 'grey'
}
</script>

<style scoped>
.order-history-item {
  transition: transform 0.2s ease-in-out;
}

.order-history-item:hover {
  transform: translateY(-2px);
}

/* Ensure the card maintains its shape during hover */
.order-history-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  transition: box-shadow 0.2s ease-in-out;
}

.order-history-item:hover::before {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>

<script lang="ts">
// Types for the component
interface Order {
  id: number
  reference: string
  total_amount: number
  currency_id: number
  order_type: string
  status: string
  created_at: string
  currency: {
    id: number
    code: string
    symbol: string
  }
}
</script>
