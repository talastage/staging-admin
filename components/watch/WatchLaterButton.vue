<template>
  <v-btn
    :color="isWatchLater ? 'primary' : 'default'"
    @click="toggleWatchLater"
  >
    <v-icon left>{{
      isWatchLater ? "mdi-clock-check" : "mdi-clock-outline"
    }}</v-icon>
    <span>{{ isWatchLater ? "Watch Later" : "Add to Watch Later" }}</span>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const props = defineProps({
  projectId: {
    type: Number,
    required: true,
  },
});

const { $axios } = useNuxtApp();
const isWatchLater = ref(false);

const checkWatchLater = async () => {
  try {
    const response = await $axios.get(`/api/watch-later`);
    isWatchLater.value = response.data.watch_later.some(
      (item: any) => item.project_id === props.projectId
    );
  } catch (error) {
    console.error("Error fetching Watch Later status", error);
  }
};

const toggleWatchLater = async () => {
  try {
    if (isWatchLater.value) {
      await $axios.delete(`/api/watch-later/remove/${props.projectId}`);
    } else {
      await $axios.post(`/api/watch-later/add`, {
        project_id: props.projectId,
      });
    }
    isWatchLater.value = !isWatchLater.value;
  } catch (error) {
    console.error("Error toggling Watch Later status", error);
  }
};

onMounted(checkWatchLater);
</script>

<style scoped>
/* Add your styles here */
</style>
