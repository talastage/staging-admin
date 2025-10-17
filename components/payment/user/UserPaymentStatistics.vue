<!-- components/payment/user/UserPaymentStatistics.vue -->
<template>
  <v-row>
    <v-col
      v-for="(stat, index) in statistics"
      :key="index"
      cols="12"
      sm="6"
      md="3"
    >
      <v-card elevation="10">
        <v-card-text>
          <div class="text-subtitle-2 mb-2">{{ stat.title }}</div>
          <div v-if="loading" class="d-flex align-center">
            <v-progress-circular
              indeterminate
              size="20"
              width="2"
              color="primary"
            />
          </div>
          <template v-else>
            <div class="text-h5">{{ stat.value }}</div>
            <div v-if="stat.subtext" class="text-caption text-medium-emphasis">
              {{ stat.subtext }}
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface StatisticItem {
  title: string;
  value: string | number;
  subtext?: string;
}

const loading = ref(true);
const statistics = ref<StatisticItem[]>([
  { title: "Total Transactions", value: "0" },
  { title: "Success Rate", value: "0%" },
  { title: "Total Volume", value: "0" },
  { title: "Processing Orders", value: "0" },
]);

const fetchStatistics = async () => {
  try {
    loading.value = true;
    const { $axios } = useNuxtApp();
    const { data } = await $axios.get("/api/user/payments/statistics");

    if (data) {
      const { summary } = data;
      const currencyData = data.data[0];

      statistics.value = [
        {
          title: "Total Transactions",
          value: summary.total_transactions,
          subtext: `${summary.completed_transactions} completed`,
        },
        {
          title: "Success Rate",
          value: `${summary.success_rate}%`,
          subtext: `${summary.failed_transactions} failed transactions`,
        },
        {
          title: "Total Volume",
          value: formatAmount(currencyData.total_amount),
          subtext: currencyData.currency.code,
        },
        {
          title: "Processing Orders",
          value: summary.processing_transactions,
          subtext: "Currently in progress",
        },
      ];
    }
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount: string): string => {
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

onMounted(() => {
  fetchStatistics();
});
</script>
