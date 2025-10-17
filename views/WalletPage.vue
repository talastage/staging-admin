<template>
  <v-row>
    <v-col cols="12">
      <WalletTransactions
        transaction-type="all"
        :limit="10"
        :show-view-all="false"
        :show-pagination="false"
        :enable-infinite-scroll="false"
        :recent="true"
      />
    </v-col>
  </v-row>
  <TransactionStatusDialog
    v-model="showStatusDialog"
    :status="transactionStatus"
    :message="statusMessage"
    :transaction-type="transactionType"
    :amount="transactionAmount"
    :currency="transactionCurrency"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useWalletStore } from '@/stores/useWalletStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'

const walletStore = useWalletStore()
const { wallet, isFetching } = storeToRefs(walletStore)
const toast = useToast()
const route = useRoute()

const showStatusDialog = ref(false)
const transactionStatus = ref('')
const statusMessage = ref('')
const transactionType = ref('')
const transactionAmount = ref(0)
const transactionCurrency = ref({ code: '', symbol: '' })

const handleTransactionStatus = () => {
  const status = route.query.status
  const message = route.query.message
  transactionType.value = route.query.transaction_type || route.query.type || ''
  transactionAmount.value = parseFloat(route.query.amount) || 0
  transactionCurrency.value = {
    code: route.query.currency_code || '',
    symbol: route.query.currency_symbol || '',
  }

  if (status) {
    transactionStatus.value = status === 'successful' ? 'success' : status
    statusMessage.value = decodeURIComponent(message || '')
    showStatusDialog.value = true
  }
}

const getDefaultMessage = (status) => {
  switch (status) {
    case 'success':
      return `Your ${transactionType.value} was successful!`
    case 'error':
      return `Your ${transactionType.value} failed. Please try again.`
    case 'processing':
      return `Your ${transactionType.value} is being processed.`
    default:
      return `There's an update on your ${transactionType.value}.`
  }
}

onMounted(async () => {
  try {
    await walletStore.fetchWallet()
    console.log('Wallet data:', wallet.value)
    handleTransactionStatus()
  } catch (error) {
    console.error('Failed to fetch wallet:', error)
    toast.error('Failed to load wallet information. Please try again.')
  }
})
</script>

<style scoped>
.transaction-card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
