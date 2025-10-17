<template>
  <div class="investor-earnings">
    <v-progress-circular v-if="isLoading" indeterminate color="primary" />
    <v-alert v-else-if="error" type="error" prominent>{{ error }}</v-alert>
    <div v-else>
      <v-card>
        <UserAvatar :user="investor" size="medium" />
        <v-card-subtitle>Username: {{ investor.username }}</v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col>
              <h3>Tips Earnings</h3>
              <p>
                {{
                  formatCurrency(
                    earnings.ProjectTip.total_amount,
                    earnings.ProjectTip.currency.symbol
                  )
                }}
              </p>
            </v-col>
            <v-col>
              <h3>Watchings Earnings</h3>
              <p>
                {{
                  formatCurrency(
                    earnings.ProjectWatching.total_amount,
                    earnings.ProjectWatching.currency.symbol
                  )
                }}
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useNuxtApp } from "#app";
import { useCurrencyFormatter } from "@/composables/useCurrencyFormatter"; // Import the named export

const { currencyFormatter } = useCurrencyFormatter();
const route = useRoute();
const { $axios } = useNuxtApp();
const earnings = ref({});
const investor = ref({});
const isLoading = ref(true);
const error = ref(null);

function formatCurrency(value, symbol) {
  return currencyFormatter(value, symbol);
}

async function fetchData() {
  isLoading.value = true;
  error.value = null;
  try {
    const { access_uuid, investorId } = route.params;
    const response = await $axios.get(
      `/api/earnings/project/${access_uuid}/investor/${investorId}`
    );
    earnings.value = response.data.earnings_by_source_type;
    investor.value = response.data.investor;
  } catch (err) {
    error.value = "Failed to fetch data: " + err.message;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.investor-earnings {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  text-align: center;
}
</style>
