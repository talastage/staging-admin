<template>
  <span>&copy; {{ appName }} {{ currentYear }}</span>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAppsStore } from "@/stores/useApps";
import { useCurrentYear } from "@/composables/useCurrentYear";

const { currentYear } = useCurrentYear();
const appsStore = useAppsStore();

// Efficiently get the app name from the store
const appName = computed(() => {
  return appsStore.talastageApp?.name || "Loading...";
});

// Fetch the app details on component mount
onMounted(() => {
  if (!appsStore.talastageApp) {
    appsStore.fetchTalaStageApp();
  }
});
</script>

<style scoped>
span {
  font-size: 14px;
  color: #606770;
}
</style>
