<template>
  <v-card class="earnings-overview">
    <v-card-title class="text-h5 font-weight-bold"
      >Earnings Overview</v-card-title
    >
    <v-card-text v-if="overview">
      <v-row>
        <v-col cols="12" md="4">
          <InvestmentEarningStatCard
            title="Total Earnings"
            :net-amount="overview.total_earnings.net_amount"
            :count="overview.total_earnings.count"
            :currency="overview.total_earnings.currency"
          />
        </v-col>
        <v-col cols="12" md="4" v-if="overview.project_watching_earnings">
          <InvestmentEarningStatCard
            title="Project Watching Earnings"
            :net-amount="overview.project_watching_earnings.net_amount"
            :count="overview.project_watching_earnings.count"
            :currency="overview.project_watching_earnings.currency"
          />
        </v-col>
        <v-col cols="12" md="4" v-if="overview.project_tip_earnings">
          <InvestmentEarningStatCard
            title="Project Tip Earnings"
            :net-amount="overview.project_tip_earnings.net_amount"
            :count="overview.project_tip_earnings.count"
            :currency="overview.project_tip_earnings.currency"
          />
        </v-col>
        <v-col cols="12" md="4" v-if="overview.tip_earnings">
          <InvestmentEarningStatCard
            title="Tip Earnings"
            :net-amount="overview.tip_earnings.net_amount"
            :count="overview.tip_earnings.count"
            :currency="overview.tip_earnings.currency"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-else-if="error">
      <v-alert type="error">{{ error }}</v-alert>
    </v-card-text>
    <v-card-text v-else>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useNuxtApp } from "#app";

const route = useRoute();
const { $axios } = useNuxtApp();

const overview = ref(null);
const error = ref(null);

const fetchEarningsOverview = async () => {
  try {
    const { data } = await $axios.get(
      `/api/investments/${route.params.investmentId}/overview`
    );
    overview.value = data;
  } catch (err) {
    console.error("Error fetching earnings overview:", err);
    error.value = "Failed to load earnings overview. Please try again later.";
  }
};

onMounted(fetchEarningsOverview);
</script>

<style scoped>
.earnings-overview {
  margin-bottom: 20px;
}
</style>
