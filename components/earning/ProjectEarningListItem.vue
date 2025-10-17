<template>
  <v-card class="earning-item" elevation="2" rounded="lg">
    <v-card-text class="pa-4">
      <div class="d-flex align-center gap-4">
        <!-- User Avatar & Info -->
        <div class="d-flex align-center gap-3 flex-shrink-0">
          <v-avatar size="48">
            <v-img
              :src="earning.user.profile_photo"
              :alt="earning.user.display_name"
            >
              <template #error>
                <v-icon size="24" color="grey-lighten-1">mdi-account-circle</v-icon>
              </template>
            </v-img>
          </v-avatar>
          
          <div class="user-info">
            <div class="text-subtitle-1 font-weight-medium">
              {{ earning.user.display_name }}
            </div>
            <div class="d-flex align-center gap-1 text-caption text-grey-darken-1">
              <v-icon size="12">{{ getTypeIcon(earning.type) }}</v-icon>
              {{ getTypeLabel(earning.type) }}
              <span class="mx-1">•</span>
              {{ formatRelativeDate(earning.created_at) }}
            </div>
          </div>
        </div>

        <v-spacer />

        <!-- Financial Breakdown -->
        <div class="financial-breakdown text-right">
          <!-- Net Amount (Most Important) -->
          <div class="net-amount mb-2">
            <div class="text-h6 font-weight-bold text-success">
              {{ formatAmount(earning.net_amount, earning.currency) }}
            </div>
            <div class="text-caption text-grey-darken-1">Net Earned</div>
          </div>

          <!-- Breakdown Details -->
          <div class="breakdown-details">
            <div class="d-flex justify-end align-center gap-2 text-body-2">
              <span class="text-grey-darken-2">
                {{ formatAmount(earning.amount, earning.currency) }}
              </span>
              <v-icon size="12" color="grey-darken-1">mdi-minus</v-icon>
              <span class="text-warning">
                {{ formatAmount(earning.app_service_fee, earning.currency) }}
              </span>
            </div>
            <div class="text-caption text-grey mt-1">
              Gross - Service Fee
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'

const { formatRelativeDate } = useDateFormatter()
const { currencyFormatter } = useCurrencyFormatter()

const props = defineProps<{
  earning: {
    id: number
    type: string
    amount: string | number
    net_amount: string | number
    app_service_fee: string | number
    currency: {
      id: number
      name: string
      symbol: string
      code: string
    }
    user: {
      id: number
      username: string
      display_name: string
      profile_photo: string
    }
    payment_reference: string | null
    created_at: string
  }
}>()

const formatAmount = (
  amount: string | number,
  currency: { symbol: string; code: string }
) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return currencyFormatter(numAmount, currency.symbol, currency.code)
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'project_watching':
      return 'mdi-eye'
    case 'tip':
      return 'mdi-heart'
    default:
      return 'mdi-cash'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'project_watching':
      return 'Project Watching'
    case 'tip':
      return 'Tip'
    default:
      return 'Payment'
  }
}
</script>

<style scoped>
.earning-item {
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.earning-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(0, 0, 0, 0.12);
}

.user-info {
  min-width: 0;
}

.financial-breakdown {
  min-width: 140px;
}

.breakdown-details {
  opacity: 0.8;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .earning-item .pa-4 {
    padding: 12px !important;
  }
  
  .d-flex.gap-4 {
    gap: 12px !important;
  }
  
  .financial-breakdown {
    min-width: 120px;
  }
  
  .text-h6 {
    font-size: 1.1rem !important;
  }
}

@media (max-width: 400px) {
  .d-flex.gap-4 {
    flex-direction: column;
    align-items: stretch !important;
    gap: 16px !important;
  }
  
  .financial-breakdown {
    text-align: left !important;
    min-width: unset;
  }
  
  .breakdown-details .d-flex {
    justify-content: start !important;
  }
}
</style>