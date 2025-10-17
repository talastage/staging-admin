<template>
  <v-select
    v-model="selectedFilter"
    :items="investmentFilters"
    item-title="text"
    item-value="value"
    label="Filter by"
    @update:model-value="emitFilter"
  ></v-select>
</template>

<script setup>
import { ref } from "vue";
import { investmentFilters } from "@/constants/dataFilters";

const selectedFilter = ref("all");

const emit = defineEmits(["filter"]);

const emitFilter = (value) => {
  emit("filter", value);
};
</script>
