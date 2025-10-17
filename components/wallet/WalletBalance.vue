<template>
  <div class="wallet-balance">
    <!-- Balance Display -->
    <div class="mt-3">
      <div class="text-subtitle-2 text-grey-darken-1 font-weight-medium mb-1">
        Available Balance
      </div>
      <div v-if="formattedBalance" class="balance-container">
        <div class="d-flex align-baseline">
          <span class="balance-amount font-weight-bold">{{
            formattedBalance
          }}</span>
          <span
            class="text-subtitle-1 ml-2 text-grey-darken-2 font-weight-medium"
          >
            {{ wallet?.data?.currency?.code }}
          </span>
        </div>
        <div class="balance-chart-container mt-2" v-if="showBalanceChart">
          <div class="balance-chart-placeholder"></div>
        </div>
      </div>
      <div v-else-if="walletStore.isFetching" class="mt-3">
        <v-skeleton-loader type="text" width="300" height="50" />
      </div>
      <div
        v-else-if="walletStore.error"
        class="text-subtitle-1 mt-3 text-error font-weight-medium"
      >
        <v-icon start color="error" class="mr-1">mdi-alert-circle</v-icon>
        {{ walletStore.error.message }}
      </div>
      <div v-else class="text-subtitle-1 mt-3 text-grey font-weight-medium">
        <v-icon start color="grey" class="mr-1">mdi-information-outline</v-icon>
        Balance information unavailable
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
const walletStore = useWalletStore()
const { currencyFormatter } = useCurrencyFormatter()
const showBalanceChart = ref(false) // Toggle for future chart implementation
// Get wallet from store
const wallet = computed(() => walletStore.wallet)
const formattedBalance = computed(() => {
  if (!wallet.value?.data) return null
  const { balance, currency } = wallet.value.data
  if (balance && currency && currency.code) {
    const numericBalance = parseFloat(balance)
    if (!isNaN(numericBalance)) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericBalance)
    }
  }
  return null
})
</script>
<style scoped>
.wallet-balance {
  padding: 8px 0;
}
.balance-container {
  position: relative;
}
.balance-amount {
  font-size: 2.75rem;
  line-height: 1.2;
  letter-spacing: -0.5px;
  /* Fixed gradient text that ensures visibility */
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 30%,
    rgb(var(--v-theme-secondary)) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* Fallback color in case the gradient doesn't work */
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.balance-chart-container {
  height: 80px;
  position: relative;
  opacity: 0.7;
}
.balance-chart-placeholder {
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-primary), 0.1) 0%,
    rgba(var(--v-theme-primary), 0) 100%
  );
  border-radius: 12px;
}
@media (max-width: 600px) {
  .balance-amount {
    font-size: 2.25rem;
  }
}
</style>
