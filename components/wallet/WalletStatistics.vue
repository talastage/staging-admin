<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>Wallet Statistics</h2>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col cols="12">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="statistics">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Overview</v-card-title>
            <v-card-text>
              <CountStats
                :count="statistics.total_balance"
                label="Total Balance"
              />
              <CountStats
                :count="statistics.total_transactions"
                label="Total Transactions"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Transaction Types</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(stats, type) in statistics.transaction_types"
                  :key="type"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ type }}</v-list-item-title>
                    <v-list-item-subtitle>
                      Count: {{ stats.count }} | Total Amount:
                      {{ stats.total_amount }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Monthly Summary</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="summary in statistics.monthly_summary"
                  :key="summary.date"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{
                      formatDate(summary.date)
                    }}</v-list-item-title>
                    <v-list-item-subtitle>
                      Count: {{ summary.count }} | Inflow:
                      {{ summary.total_inflow }} | Outflow:
                      {{ summary.total_outflow }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Recent Activity</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="activity in statistics.recent_activity"
                  :key="activity.id"
                >
                  <v-list-item-content>
                    <v-list-item-title
                      >{{ activity.transaction_type }} - {{ activity.amount }}
                      {{ activity.currency }}</v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      formatRelativeDate(activity.created_at)
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWalletStore } from '@/stores/useWalletStore'
import { useDateFormatter } from '@/composables/useDateFormatter'

const walletStore = useWalletStore()
const { formatRelativeDate } = useDateFormatter()

const statistics = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await walletStore.fetchWalletStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('Failed to fetch wallet statistics:', error)
  } finally {
    isLoading.value = false
  }
})

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}
</script>
