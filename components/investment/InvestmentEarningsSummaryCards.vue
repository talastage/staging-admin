<template>
  <div class="summary-cards">
    <v-row>
      <!-- Card 1: Project Viewing Earnings -->
      <v-col cols="12" sm="6" md="4">
        <AmountDisplayCard
          title="Viewing Earnings"
          :amount="parseAmount(summary.project_total_earnings)"
          :currency-symbol="summary.currency.symbol"
          :currency-code="summary.currency.code"
          icon="mdi-eye"
          :elevation="10"
        >
          <template #footer>
            <span class="text-body-2 text-medium-emphasis">
              <v-chip
                size="x-small"
                color="primary"
                variant="flat"
                density="compact"
                class="earnings-chip"
              >
                {{ summary.total_transactions }} transactions
              </v-chip>
            </span>
          </template>
        </AmountDisplayCard>
      </v-col>

      <!-- Card 2: Project Creator Earnings -->
      <v-col cols="12" sm="6" md="4">
        <AmountDisplayCard
          title="Creator Earnings"
          :amount="parseAmount(summary.creator_total_earnings)"
          :currency-symbol="summary.currency.symbol"
          :currency-code="summary.currency.code"
          icon="mdi-account-star"
          variant="primary"
          :elevation="10"
        >
          <template #footer="{ variant }">
            <v-btn
              :color="variant === 'primary' ? 'white' : 'primary'"
              :variant="variant === 'primary' ? 'tonal' : 'elevated'"
              size="small"
              prepend-icon="mdi-bank-transfer"
              @click="navigateToWithdraw"
              class="earnings-btn"
            >
              My Earnings
            </v-btn>
          </template>
        </AmountDisplayCard>
      </v-col>

      <!-- Card 3: Project Investors Earnings -->
      <v-col cols="12" sm="6" md="4">
        <AmountDisplayCard
          title="Investors Earnings"
          :amount="parseAmount(summary.investors_total_earnings)"
          :currency-symbol="summary.currency.symbol"
          :currency-code="summary.currency.code"
          icon="mdi-account-group"
          :elevation="10"
        >
          <template #footer>
            <div class="d-flex align-center justify-space-between">
              <v-chip
                size="x-small"
                color="success"
                variant="flat"
                density="compact"
                class="earnings-chip"
              >
                {{ summary.project_investors }} investors
              </v-chip>
              <v-btn
                color="primary"
                variant="text"
                size="small"
                @click="navigateToInvestors"
                class="earnings-btn"
              >
                View All
                <v-icon end>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </template>
        </AmountDisplayCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

interface Summary {
  investment_id?: number
  creator_id?: number
  project_total_earnings: string
  creator_total_earnings: string
  investors_total_earnings: string
  total_transactions: number
  total_fees: string
  project_investors: number
  currency: Currency
}

const props = defineProps<{
  summary: Summary
}>()

const router = useRouter()
const route = useRoute()

/**
 * Parses a formatted number string into a number
 * @param value - The formatted number string to parse
 * @returns The parsed number value
 */
const parseAmount = (value: string | undefined): number => {
  if (!value) return 0
  // Remove commas and convert to number
  return Number(value.replace(/,/g, ''))
}

// Get access UUID from route params
const accessUuid = computed(() => {
  return route.params.access_uuid || ''
})

// Get creator ID from props
const creatorId = computed(() => {
  return props.summary?.creator_id || 0
})

/**
 * Navigates to the withdraw page using investment and creator IDs
 */
const navigateToWithdraw = async (): Promise<void> => {
  if (creatorId.value && accessUuid.value) {
    const path = `/investments/earnings/projects/${accessUuid.value}/investor-details-${creatorId.value}`
    try {
      await navigateTo(path, { external: false })
    } catch (error) {
      router.push(path)
    }
  } else {
    console.error('Missing required parameters for navigation')
  }
}

/**
 * Navigates to the investors page using the access UUID from the route
 */
const navigateToInvestors = async (): Promise<void> => {
  if (accessUuid.value) {
    try {
      // Using Nuxt's navigation helper
      await navigateTo(`/project/${accessUuid.value}/earnings/investors`, {
        external: false,
      })
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to Vue Router
      router.push(`/project/${accessUuid.value}/earnings/investors`)
    }
  } else {
    console.error('Missing access UUID for navigation')
  }
}
</script>

<style scoped>
.summary-cards {
  margin-bottom: 24px;
}

/* Chip Styles */
.earnings-chip {
  font-size: 0.75rem !important;
  height: 20px !important;
  --v-chip-height: 20px;
}

/* Button Styles */
.earnings-btn {
  text-transform: none;
}
</style>
