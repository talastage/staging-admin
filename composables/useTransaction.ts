// composables/useTransaction.ts
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

export const useTransaction = () => {
  const { $axios } = useNuxtApp()

  const transactionType = ref<'deposit' | 'withdraw'>('deposit')
  const amount = ref(0)
  const selectedMethod = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const canProceed = computed(() => amount.value > 0 && selectedMethod.value)

  const processTransaction = async () => {
    if (!canProceed.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $axios.post(`/api/wallet/transactions/${transactionType.value}`, {
        amount: amount.value,
        gateway_id: selectedMethod.value.gateway.id,
        payment_method_id: selectedMethod.value.payment_method.id,
        paymentable_type: selectedMethod.value.paymentable_type,
        paymentable_id: selectedMethod.value.paymentable_id,
      })

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || `Failed to process ${transactionType.value}`
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    amount.value = 0
    selectedMethod.value = null
    error.value = null
  }

  return {
    transactionType,
    amount,
    selectedMethod,
    loading,
    error,
    canProceed,
    processTransaction,
    reset,
  }
}