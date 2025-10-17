<template>
  <v-chip :color="statusColor" dark>{{ statusText }}</v-chip>
</template>

<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  status: String,
});

const statusColors = {
  authorized: "green",
  cancelled: "grey",
  completed: "blue",
  confirmed: "green",
  declined: "red",
  failed: "red",
  on_hold: "orange",
  paid: "green",
  pending: "yellow",
  processed: "blue",
  refunded: "purple",
  rejected: "red",
  reversed: "light-blue",
  in_progress: "blue",
  shipped: "green",
  delivered: "green",
  returned: "orange",
  published: "green",
  draft: "grey",
};

const statusColor = computed(
  () => statusColors[props.status.toLowerCase()] || "default"
);
const statusText = computed(
  () =>
    props.status.charAt(0).toUpperCase() +
    props.status.slice(1).toLowerCase().replace("_", " ")
);
</script>