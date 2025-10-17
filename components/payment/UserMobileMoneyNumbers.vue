<template>
  <v-select
    v-model="selectedNumber"
    :items="mobileMoneyNumbers"
    item-value="phone_number"
    item-title="phone_number"
    label="Select Mobile Money Number"
    @change="emitSelectedNumber"
  ></v-select>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const props = defineProps({
  countryId: {
    type: Number,
    required: true,
  },
});

const mobileMoneyNumbers = ref([]);
const selectedNumber = ref(null);

const { $axios } = useNuxtApp();

onMounted(async () => {
  await fetchMobileMoneyNumbers();
});

async function fetchMobileMoneyNumbers() {
  try {
    const response = await $axios.get(`/api/user/mobile-money-numbers`, {
      params: { country_id: props.countryId }
    });
    mobileMoneyNumbers.value = response.data;
  } catch (error) {
    console.error("Error fetching mobile money numbers:", error);
  }
}

function emitSelectedNumber() {
  emit("numberSelected", selectedNumber.value);
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
