<template>
  <div>
    <BaseHeader :title="'Recent Project Tips'" />
    <v-container>
      <v-row>
        <v-col
          v-for="tip in recentTips"
          :key="tip.id"
          cols="12"
          sm="12"
          md="12"
        >
          <TransactionItemTip
            :tipper="tip.tipper"
            :amount="tip.amount"
            :created_at="tip.created_at"
            :currency="tip.currency"
            :message="tip.message"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
const { $axios } = useNuxtApp();
const recentTips = ref([]);
const route = useRoute();
const access_uuid = route.params.access_uuid;

onMounted(async () => {
  try {
    const response = await $axios.get(
      `/api/project/earnings/${access_uuid}/recent-tips`
    );
    recentTips.value = response.data.recent_tips;
  } catch (error) {
    console.error("Error fetching recent tips:", error);
  }
});
</script>
