<template>
  <v-container>
    <!-- Project Header -->
    <ProjectPageHeader
      :project="project"
      :loading="projectLoading"
      :elevation="10"
      subtitle="InvestorEarnings & Revenue Analytics"
    >
    </ProjectPageHeader>

    <!-- Balance Card -->
    <project-investor-balance-card
      :balance="projectInvestorBalanceStore.balance"
      :loading="projectInvestorBalanceStore.isLoading"
      :access-uuid="accessUuid"
      class="mb-6"
    />

    <!-- Tabs Section -->
    <v-card elevation="10">
      <v-tabs
        v-model="activeTab"
        fixed-tabs
        bg-color="primary"
        slider-color="secondary"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          class="text-none"
        >
          <v-icon :icon="tab.icon" class="mr-2" />
          {{ tab.label }}
        </v-tab>
      </v-tabs>
      <v-card-text class="pa-0">
        <v-window v-model="activeTab">
          <v-window-item value="transactions">
            <project-investor-transactions
              :access-uuid="accessUuid"
              :investor-id="investorId"
              @update:transactions="transactionsData = $event"
              @update:loading="isLoading.transactions = $event"
              @update:total="transactionsTotal = $event"
            />
          </v-window-item>
          <v-window-item value="history">
            <project-investor-balance-history
              :access-uuid="accessUuid"
              :investor-id="investorId"
              @update:history="balanceHistoryData = $event"
              @update:loading="isLoading.balanceHistory = $event"
              @update:total="balanceHistoryTotal = $event"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '~/stores/useProjectStore'
import { useProjectInvestorBalanceStore } from '~/stores/useProjectInvestorBalanceStore'
import { storeToRefs } from 'pinia'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: { showCategories: true, showDrawer: true, miniDrawer: true },
  layout: 'default',
  middleware: ['auth', 'investor-project-earnings-access', 'noindex'],
})

// Route and Store Setup
const route = useRoute()
const projectStore = useProjectStore()
const projectInvestorBalanceStore = useProjectInvestorBalanceStore()
const { project, isLoading: projectLoading } = storeToRefs(projectStore)

const accessUuid = computed(() => route.params.access_uuid as string)
const investorId = computed(() => route.params.investorId as string)

// Tabs Configuration
const tabs = [
  { label: 'Transactions', value: 'transactions', icon: 'mdi-swap-horizontal' },
  { label: 'Withdrawals', value: 'history', icon: 'mdi-cash-minus' },
]
const activeTab = ref('transactions')

// Additional State (for transactions and history)
const transactionsData = ref<TransactionItem[]>([])
const balanceHistoryData = ref<BalanceHistoryItem[]>([])
const transactionsTotal = ref(0)
const balanceHistoryTotal = ref(0)
const isLoading = ref({
  transactions: false,
  balanceHistory: false,
})

// Fetch Data on Mount and Route Changes
onMounted(async () => {
  await Promise.all([
    projectStore.fetchProject(accessUuid.value),
    projectInvestorBalanceStore.fetchBalance(
      accessUuid.value,
      investorId.value
    ),
  ])
})

watch(
  [() => route.params.access_uuid, () => route.params.investorId],
  async ([newAccessUuid, newInvestorId]) => {
    if (newAccessUuid && newInvestorId) {
      await projectInvestorBalanceStore.fetchBalance(
        newAccessUuid,
        newInvestorId
      )
    }
  }
)
</script>

<style scoped>
.investor-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}
.investor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
:deep(.v-tabs) {
  border-radius: 12px 12px 0 0;
}
:deep(.v-window) {
  border-radius: 0 0 12px 12px;
}
:deep(.v-tab) {
  text-transform: none;
  letter-spacing: normal;
}
</style>
