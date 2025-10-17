<!-- pages/settings.vue -->
<template>
  <div class="settings-page">
    <h1>Account Settings</h1>

    <div class="settings-section">
      <h2>Currency Preferences</h2>

      <CurrencyCountrySelector
        v-model="selectedCurrencyId"
        label="Select your preferred currency"
        @change="handleCurrencyChange"
      />

      <div v-if="updateStatus" class="update-status" :class="updateStatus.type">
        {{ updateStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useCurrencies } from '~/composables/useCurrencies'

const selectedCurrencyId = ref(null)
const updateStatus = ref(null)
const { userCurrency } = useCurrencies()
const { $axios } = useNuxtApp()
const isLoading = ref(false)

const changeCurrency = async (currencyId) => {
  isLoading.value = true
  
  try {
    const response = await $axios.post('/api/currencies/change', {
      currency_id: currencyId,
    })

    if (response.data?.currency) {
      // Update the user currency if needed
      if (userCurrency) {
        userCurrency.value = response.data.currency
      }
      return true
    }
    return false
  } catch (err) {
    console.error('Error changing currency:', err)
    return false
  } finally {
    isLoading.value = false
  }
}

const handleCurrencyChange = async (currency) => {
  updateStatus.value = {
    type: 'loading',
    message: 'Updating your currency preference...',
  }

  try {
    const success = await changeCurrency(currency.id)

    if (success) {
      updateStatus.value = {
        type: 'success',
        message: 'Currency updated successfully!',
      }
      setTimeout(() => {
        updateStatus.value = null
      }, 3000)
    } else {
      updateStatus.value = {
        type: 'error',
        message: 'Failed to update currency.',
      }
    }
  } catch (err) {
    updateStatus.value = {
      type: 'error',
      message: 'An error occurred while updating currency.',
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.update-status {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
}

.update-status.loading {
  background-color: #ebf8ff;
  color: #2b6cb0;
}

.update-status.success {
  background-color: #f0fff4;
  color: #2f855a;
}

.update-status.error {
  background-color: #fff5f5;
  color: #c53030;
}
</style>