<template>
  <v-form v-model="isValid" @submit.prevent>
    <v-container>
      <v-row>
        <!-- Investment Settings Section -->
        <v-col cols="12">
          <h3 class="text-h6 mb-4">Investment Preferences</h3>
          <v-row>
            <v-col cols="12">
              <currency-amount-input
                v-model="form.max_investment_amount"
                label="Maximum Investment Amount"
                :rules="[
                  (v) => !!v || 'Amount is required',
                  (v) => v > 0 || 'Amount must be greater than 0',
                ]"
                hint="What's the maximum amount you're willing to invest in a single project?"
                required
              />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                class="text-body-2"
              >
                Setting your maximum investment amount helps project creators understand your investment capacity and match you with suitable opportunities.
              </v-alert>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { usePageRegistrationStore } from '~/stores/usePageRegistration'
import { useCurrencyStore } from '~/stores/useCurrencies'

const store = usePageRegistrationStore()
const currencyStore = useCurrencyStore()
const isValid = ref(false)

const form = reactive({
  max_investment_amount: store.investmentSettings.max_investment_amount || null,
})

// Watch for form changes and update store
watch(
  form,
  (newValue) => {
    store.investmentSettings = {
      ...store.investmentSettings,
      max_investment_amount: newValue.max_investment_amount,
      currency_id: currencyStore.selectedCurrency?.id || null,
    }
  },
  { deep: true }
)

onMounted(async () => {
  // Fetch currencies
  await currencyStore.fetchCurrencies()
})

defineExpose({ isValid })
</script>

<style scoped>
.v-row {
  margin-bottom: 16px;
}
</style>