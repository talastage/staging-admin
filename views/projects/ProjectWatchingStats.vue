<template>
  <div class="watching-stats">
    <h2>Watching Statistics</h2>
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-circular>
    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>
    <v-card v-if="watchingStats" class="mt-4">
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(stat, index) in watchingStats.stats"
            :key="index"
          >
            <v-list-item-content>
              <v-list-item-title
                >{{ stat.currency
                }}{{ parseFloat(stat.amount).toFixed(2) }}</v-list-item-title
              >
              <v-list-item-subtitle>
                Count: {{ stat.count }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider class="my-4"></v-divider>
        <div class="text-h6">Total</div>
        <div>
          Amount: {{ watchingStats.total_amount.currency
          }}{{ watchingStats.total_amount.amount.toFixed(2) }}
        </div>
        <div>Count: {{ watchingStats.total_count }}</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApi } from "@/composables/useApi";

const route = useRoute();
const { get } = useApi();

interface WatchingStat {
  currency: string;
  amount: string;
  count: number;
}

interface WatchingStats {
  stats: WatchingStat[];
  total_amount: {
    currency: string;
    amount: number;
  };
  total_count: number;
}

const watchingStats = ref<WatchingStats | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchWatchingStats = async () => {
  const accessUuid = route.params.access_uuid as string;
  try {
    loading.value = true;
    watchingStats.value = await get<WatchingStats>(
      `/api/project/earnings/${accessUuid}/watching-stats`
    );
  } catch (err) {
    error.value =
      "Failed to fetch watching statistics. Please try again later.";
    console.error("Error fetching watching stats:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchWatchingStats);
</script>

<style scoped>
.watching-stats {
  max-width: 600px;
  margin: 0 auto;
}
</style>
