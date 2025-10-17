<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        class="text-capitalize"
        prepend-icon="mdi-currency-usd"
      >
        {{ selectedCurrency?.name || "Select Currency" }}
        <v-icon end>mdi-menu-down</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-title class="text-h6">Select Currency</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>

      <v-list-item
        v-for="currency in currencies"
        :key="currency.id"
        @click="saveCurrency(currency.id)"
        :disabled="currency.id === selectedCurrency?.id"
      >
        <v-list-item-title>
          {{ currency.name }} ({{ currency.code }})
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useCurrencyStore } from "@/stores/useCurrencies";
import { useToast } from "vue-toastification";

const toast = useToast();
const currencyStore = useCurrencyStore();

const selectedCurrency = computed(() => currencyStore.selectedCurrency);
const currencies = computed(() => currencyStore.currencies);

onMounted(async () => {
  if (!currencyStore.isFetched) {
    await currencyStore.fetchCurrencies();
  }
});

const saveCurrency = async (currencyId) => {
  try {
    await currencyStore.updateCurrency(currencyId);
    toast.success("Currency updated successfully.", {
      timeout: 2000,
      position: "top-right",
    });
  } catch (error) {
    console.error("Error updating currency:", error);
    toast.error("Failed to update currency. Please try again.", {
      timeout: 3000,
      position: "top-right",
    });
  }
};
</script>
