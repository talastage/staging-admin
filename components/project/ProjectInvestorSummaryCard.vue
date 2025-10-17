<!-- components/project/ProjectInvestorSummaryCard.vue -->
<template>
  <v-card>
    <v-card-item>
      <template v-if="loading">
        <v-skeleton-loader type="list-item-three-line" class="mb-2" />
        <v-skeleton-loader type="list-item-three-line" class="mb-2" />
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
          <!-- Summary Stats Grid -->
          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="mb-4">
              <v-card-item>
                <div class="text-caption">Total Transactions</div>
                <div class="text-h6">{{ summary.total_transactions }}</div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="mb-4">
              <v-card-item>
                <div class="text-caption">Gross Earnings</div>
                <div class="text-h6">
                  {{
                    currencyFormatter(
                      summary.total_gross_amount,
                      summary.currency.symbol,
                      summary.currency.code
                    )
                  }}
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="mb-4">
              <v-card-item>
                <div class="text-caption">Net Earnings</div>
                <div class="text-h6">
                  {{
                    currencyFormatter(
                      summary.total_net_amount,
                      summary.currency.symbol,
                      summary.currency.code
                    )
                  }}
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="mb-4">
              <v-card-item>
                <div class="text-caption">Service Fees</div>
                <div class="text-h6">
                  {{
                    currencyFormatter(
                      summary.total_app_service_fee,
                      summary.currency.symbol,
                      summary.currency.code
                    )
                  }}
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card variant="outlined" class="mb-4">
              <v-card-item>
                <div class="text-caption">Average Fee</div>
                <div class="text-h6">
                  {{ summary.average_fee_percentage.toFixed(2) }}%
                </div>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>

        <!-- Timeline Information -->
        <div class="mt-4 text-caption">
          <div class="d-flex align-center mb-2">
            <v-icon size="small" class="mr-2">mdi-clock-start</v-icon>
            First earning: {{ formatLocalDateTime(summary.first_earning_date) }}
          </div>
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2">mdi-clock-end</v-icon>
            Last earning: {{ formatLocalDateTime(summary.last_earning_date) }}
          </div>
        </div>
      </template>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useDateFormatter } from '~/composables/useDateFormatter'
import type { ProjectInvestorSummary } from '~/types/projectInvestor'

const { currencyFormatter } = useCurrencyFormatter()
const { formatLocalDateTime } = useDateFormatter()

defineProps({
  summary: {
    type: Object as PropType<ProjectInvestorSummary>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
