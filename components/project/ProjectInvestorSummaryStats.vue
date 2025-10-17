<!-- components/investor/InvestorSummaryStats.vue -->
<template>
  <v-card>
    <v-card-item>
      <template v-if="loading">
        <v-skeleton-loader type="list-item-three-line" />
      </template>

      <template v-else-if="!summary">
        <v-alert
          type="info"
          text="No summary information available"
          variant="tonal"
        />
      </template>

      <template v-else>
        <div class="text-h6 mb-4">Earnings Summary</div>

        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="stat-card">
              <v-card-item>
                <div class="text-caption">Total Transactions</div>
                <div class="text-h5">{{ summary.total_transactions }}</div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="stat-card">
              <v-card-item>
                <div class="text-caption">Total Gross Amount</div>
                <div class="text-h5">
                  {{ formatCurrency(summary.total_gross_amount, currency) }}
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="stat-card">
              <v-card-item>
                <div class="text-caption">Total Net Amount</div>
                <div class="text-h5">
                  {{ formatCurrency(summary.total_net_amount, currency) }}
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="stat-card">
              <v-card-item>
                <div class="text-caption">Total Service Fee</div>
                <div class="text-h5">
                  {{ formatCurrency(summary.total_app_service_fee, currency) }}
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="stat-card">
              <v-card-item>
                <div class="text-caption">Average Fee</div>
                <div class="text-h5">
                  {{ summary.average_fee_percentage.toFixed(2) }}%
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="stat-card">
              <v-card-item>
                <div class="text-caption">Earning Period</div>
                <div class="text-body-1">
                  {{ formatDate(summary.first_earning_date) }} -
                  {{ formatDate(summary.last_earning_date) }}
                </div>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-card-item>
  </v-card>
</template>

<script setup>
import { formatCurrency, formatDate } from '~/utils/formatting'

const props = defineProps({
  summary: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.stat-card {
  height: 100%;
}
</style>
