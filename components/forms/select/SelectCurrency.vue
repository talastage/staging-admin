<!-- components/SelectCurrency.vue -->
<template>
  <v-menu offset-y :close-on-content-click="true" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        class="text-capitalize currency-selector"
        :disabled="isLoading"
      >
        <template v-if="selectedCurrencyDetails">
          <CurrencyDisplay
            :symbol="selectedCurrencyDetails.symbol"
            :code="selectedCurrencyDetails.code"
            :name="selectedCurrencyDetails.name"
          />
          {{ selectedCurrencyDetails.name }}
        </template>
        <template v-else>
          <v-icon icon="mdi-currency-usd" class="mr-2" />
          Select Currency
        </template>
        <v-icon end>mdi-menu-down</v-icon>
      </v-btn>
    </template>

    <v-list width="300">
      <v-list-item>
        <v-list-item-title class="text-h6">Select Currency</v-list-item-title>
      </v-list-item>
      <v-divider />

      <v-list-item
        v-for="currency in availableCurrencies"
        :key="currency.id"
        :value="currency.id"
        @click="selectCurrency(currency.id)"
        :active="modelValue === currency.id"
      >
        <v-list-item-title class="d-flex align-center">
          <CurrencyDisplay
            :symbol="currency.symbol"
            :code="currency.code"
            :name="currency.name"
          />
          {{ currency.name }}
          <v-icon
            v-if="modelValue === currency.id"
            color="primary"
            class="ml-auto"
            icon="mdi-check"
          />
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCurrencyStore } from '@/stores/useCurrencies'

interface Props {
  modelValue: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const currencyStore = useCurrencyStore()
const isLoading = ref(false)

const availableCurrencies = computed(() => currencyStore.currencies)

const selectedCurrencyDetails = computed(() =>
  props.modelValue
    ? availableCurrencies.value.find((c) => c.id === props.modelValue)
    : currencyStore.selectedCurrency
)

onMounted(async () => {
  if (!currencyStore.isFetched) {
    isLoading.value = true
    await currencyStore.fetchCurrencies()
    isLoading.value = false
  }

  if (!props.modelValue && currencyStore.selectedCurrency) {
    emit('update:modelValue', currencyStore.selectedCurrency.id)
  }
})

const selectCurrency = async (currencyId: number) => {
  try {
    isLoading.value = true
    await currencyStore.updateCurrency(currencyId)
    emit('update:modelValue', currencyId)
  } catch (error) {
    console.error('Failed to update currency:', error)
    // Here you might want to show an error notification
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.currency-selector {
  min-width: 200px;
}

:deep(.v-list-item-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
