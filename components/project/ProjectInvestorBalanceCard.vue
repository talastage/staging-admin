<template>
  <v-card elevation="10">
    <v-card-item>
      <!-- Loading State -->
      <template v-if="loading">
        <v-skeleton-loader type="list-item-three-line" />
      </template>

      <!-- No Data State -->
      <template v-else-if="!balance || !balance.data">
        <v-alert
          type="info"
          text="No balance information available"
          variant="tonal"
        />
      </template>

      <template v-else>
        <!-- Title Section -->
        <div class="mb-4">
          <h1 class="text-h5 font-weight-bold mb-2">
            {{ titleText }}
          </h1>
          <v-divider class="mb-4"></v-divider>
        </div>

        <!-- Investor Info Section -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <div class="mr-4">
              <user-avatar
                v-if="isUser && investorData"
                :username="investorData.username || ''"
                :profile_photo="investorData.profile_photo || ''"
                size="xl"
              />
              <page-avatar
                v-else-if="investorData"
                :page="investorData"
                size="xl"
              />
              <v-avatar v-else size="xl" color="grey lighten-2">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
            </div>
            <div>
              <h2 class="text-h6 font-weight-medium">{{ investorName }}</h2>
              <span class="text-body-2 text-medium-emphasis"
                >Project Investor</span
              >
            </div>
          </div>

          <!-- Share Percentage Display -->
          <div
            v-if="balance.data.share_percentage !== undefined"
            class="share-percentage-container"
          >
            <v-tooltip
              location="top"
              text="Your share percentage in this project"
            >
              <template v-slot:activator="{ props }">
                <div
                  class="share-percentage d-flex flex-column align-center"
                  v-bind="props"
                >
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-chart-pie" class="mr-2" color="primary" />
                    <span class="text-h6 font-weight-medium">
                      {{
                        formatSharePercentage(balance.data.share_percentage)
                      }}%
                    </span>
                  </div>
                  <span class="text-caption text-medium-emphasis"
                    >Your Share Percentage</span
                  >
                </div>
              </template>
            </v-tooltip>
          </div>
        </div>

        <!-- Amount Display Cards -->
        <v-row v-if="currencyData">
          <!-- Available Balance Card -->
          <v-col cols="12" sm="6" md="4">
            <AmountDisplayCard
              title="Available Balance"
              :amount="Number(balance.data.balance || 0)"
              :currency-symbol="currencyData.symbol"
              :currency-code="currencyData.code"
              icon="mdi-wallet"
              variant="primary"
            >
              <template #footer="{ variant }">
                <v-btn
                  variant="tonal"
                  :color="variant === 'primary' ? 'white' : 'primary'"
                  size="small"
                  @click="openTransferDialog"
                  :disabled="!Number(balance.data.balance)"
                >
                  Transfer to Wallet
                </v-btn>
              </template>
            </AmountDisplayCard>
          </v-col>

          <!-- Total Earned Card -->
          <v-col cols="12" sm="6" md="4">
            <AmountDisplayCard
              title="Total Earned"
              :amount="Number(balance.data.total_earned || 0)"
              :currency-symbol="currencyData.symbol"
              :currency-code="currencyData.code"
              icon="mdi-cash-multiple"
              tooltip="Total amount received from earnings"
            >
              <template #footer>
                <span class="text-medium-emphasis">
                  Last earning:
                  {{
                    balance.data.last_earning_at
                      ? formatRelativeDate(balance.data.last_earning_at)
                      : 'Never'
                  }}
                </span>
              </template>
            </AmountDisplayCard>
          </v-col>

          <!-- Total Withdrawn Card -->
          <v-col cols="12" sm="6" md="4">
            <AmountDisplayCard
              title="Total Withdrawn"
              :amount="Number(balance.data.total_withdrawn || 0)"
              :currency-symbol="currencyData.symbol"
              :currency-code="currencyData.code"
              icon="mdi-cash-remove"
            />
          </v-col>
        </v-row>

        <!-- Transfer Dialog -->
        <BalanceTransferDialog
          v-if="currencyData"
          v-model="showTransferDialog"
          :transfer-endpoint="transferEndpoint"
          :available-balance="Number(balance.data.balance || 0)"
          :currency-symbol="currencyData.symbol"
          :currency-code="currencyData.code"
          @transfer-success="handleTransferSuccess"
        />
      </template>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useProjectInvestorBalanceStore } from '~/stores/useProjectInvestorBalanceStore'

const props = defineProps<{
  balance: Balance | null
  loading: boolean
  accessUuid: string
}>()

const { formatRelativeDate } = useDateFormatter()
const showTransferDialog = ref(false)
const projectInvestorBalanceStore = useProjectInvestorBalanceStore()

const titleText = computed(() => {
  if (
    !props.balance ||
    !props.balance.data ||
    !props.balance.data.investor_type
  )
    return 'Investor Earnings'
  return props.balance.data.investor_type.type === 'creator'
    ? 'Project Creator Earnings'
    : 'Investor Earnings'
})

const formatSharePercentage = (percentage?: string): string => {
  if (!percentage) return '0.00'
  return Number(percentage).toFixed(2)
}

const isUser = computed(() => {
  return props.balance?.data?.investor_type?.is_user ?? false
})

const investorData = computed(() => {
  return props.balance?.data?.project_investor ?? null
})

const currencyData = computed(() => {
  return props.balance?.data?.currency ?? { symbol: '$', code: 'USD' }
})

const investorName = computed(() => {
  if (!investorData.value) return 'Unknown Investor'
  if (isUser.value) {
    const user = investorData.value as UserInvestor
    return user.display_name || user.username || 'Anonymous User'
  }
  const page = investorData.value as PageInvestor
  return page.name || 'Unnamed Page'
})

const transferEndpoint = computed(() => {
  return props.balance?.data?.project_investor
    ? `/api/projects/${props.accessUuid}/earnings/investors/${props.balance.data.project_investor.id}/transfer-to-wallet`
    : ''
})

function openTransferDialog(): void {
  showTransferDialog.value = true
}

function handleTransferSuccess(): void {
  showTransferDialog.value = false
  projectInvestorBalanceStore.updateBalanceAfterTransfer()
}
</script>

<style scoped>
.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.align-center {
  align-items: center;
}
.justify-space-between {
  justify-content: space-between;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mr-4 {
  margin-right: 1rem;
}
.mr-2 {
  margin-right: 0.5rem;
}
.share-percentage-container {
  background-color: var(--v-surface-variant);
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.share-percentage-container:hover {
  background-color: var(--v-primary-lighten-4);
}
.share-percentage {
  color: var(--v-primary-base);
  text-align: center;
}
.text-caption {
  font-size: 0.75rem;
  line-height: 1.25rem;
  letter-spacing: 0.0333333333em;
  margin-top: 4px;
}
</style>
