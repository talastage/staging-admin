<template>
  <div>
    <BaseHeader :title="'Recent Project Watchings'" />
    <v-container>
      <v-row>
        <v-col
          v-for="watching in recentWatchings"
          :key="watching.id"
          cols="12"
          md="12"
        >
          <TransactionItemWatcher
            :watcher="watching.watcher"
            :amount="watching.amount"
            :created_at="watching.created_at"
            :currency="watching.currency"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
const { $axios } = useNuxtApp();
const recentWatchings = ref([]);
const route = useRoute();
const access_uuid = route.params.access_uuid;

onMounted(async () => {
  try {
    const response = await $axios.get(
      `/api/project/earnings/${access_uuid}/recent-watchings`
    );
    recentWatchings.value = response.data.recent_watchings;
  } catch (error) {
    console.error("Error fetching recent watchings:", error);
  }
});
</script>
