<template>
  <v-container class="investor-earnings">
    <BaseHeader :title="'Earnings'">
      <template #actionable>
        <v-btn @click="goToHistory" color="primary">View All</v-btn>
      </template>
    </BaseHeader>
    <v-skeleton-loader v-if="isLoading" type="card" />
    <ErrorAlert :error="error" v-else />
    <div v-if="!error && !isLoading && investorEarnings.length">
      <v-list>
        <TransactionItem
          v-for="earning in paginatedEarnings"
          :key="earning.id"
          :earning="earning"
        />
      </v-list>
      <v-pagination
        v-model:page="currentPage"
        :length="totalPages"
        @input="onPageChange"
      />
    </div>
    <div v-if="!isLoading && !error && !investorEarnings.length">
      <p>No earnings found.</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter, useNuxtApp } from "#app";
import { useCurrencyFormatter } from "@/composables/useCurrencyFormatter";

const { currencyFormatter } = useCurrencyFormatter();
const route = useRoute();
const router = useRouter();
const { $axios } = useNuxtApp();
const investorEarnings = ref([]);
const isLoading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 5;

function formatCurrency(value, symbol) {
  return currencyFormatter(value, symbol);
}

const paginatedEarnings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return investorEarnings.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(investorEarnings.value.length / itemsPerPage);
});

async function fetchData() {
  try {
    const { access_uuid } = route.params;
    const response = await $axios.get(
      `/api/earnings/project/${access_uuid}/investor/recent-earnings`
    );
    investorEarnings.value = response.data.earnings;
  } catch (err) {
    error.value = "Failed to fetch data: " + err.message;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

function onPageChange(page) {
  currentPage.value = page;
}

function goToHistory() {
  const { access_uuid } = route.params;
  router.push(`/project/${access_uuid}/earnings/investor/history`);
}

onMounted(fetchData);
</script>

<style scoped>
.investor-earnings {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
</style>
