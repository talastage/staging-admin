<template>
  <v-select :items="countryOptionsWithAll" item-value="id" item-title="name" label="Filter by Country"
    v-model="selectedCountryIdLocal"></v-select>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useCountryStore } from "~/stores/countries";

const authStore = useAuthStore();
const countryStore = useCountryStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);

// Initialize selectedCountryIdLocal based on the logged-in user's country or 'all'
const selectedCountryIdLocal = ref('all');

// Define the emitter for the countrySelected event
const emit = defineEmits(["countrySelected"]);

// Only watch for changes after the component is mounted to avoid immediate emit
watch(isLoggedIn, (newVal) => {
  selectedCountryIdLocal.value = newVal ? authStore.user?.country.id : 'all';
  // Ensure that initial value is emitted only after user log-in status is confirmed
  emit("countrySelected", selectedCountryIdLocal.value);
});

const countryOptionsWithAll = computed(() => [
  { name: 'All', id: 'all' },
  ...countryStore.countries.list
]);

onMounted(async () => {
  await countryStore.fetchCountries();
  // Now that countries have been fetched, set the initial country based on user status
  selectedCountryIdLocal.value = isLoggedIn.value ? authStore.user?.country.id : 'all';
});

watch(selectedCountryIdLocal, (newValue, oldValue) => {
  // Emit only when the selected country changes after the component has been mounted
  if (newValue !== oldValue) {
    emit("countrySelected", newValue);
  }
});
</script>
