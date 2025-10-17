import { ref, watch } from 'vue'
import { useNuxtApp } from '#app'

export function useCountryPaymentMethods(initialType?: string) {
  const paymentMethods = ref<any[]>([])
  const loading = ref(false)
  const error = ref('')
  const selectedCountryId = ref<number | null>(null)
  const transactionType = ref(initialType)

  const { $axios } = useNuxtApp()

  // Fetch payment methods based on transaction type
  async function fetchPaymentMethods(type?: string) {
    // Update transaction type if provided
    if (type) {
      transactionType.value = type
    }

    // Default to 'payment' if no transaction type is set
    const currentType = transactionType.value || 'payment'

    loading.value = true
    error.value = ''

    try {
      const response = await $axios.get(
        `/api/payment/methods/by-country/${currentType}`
      )

      // Store the payment methods and selected country
      paymentMethods.value = response.data.country_payment_methods || []
      selectedCountryId.value = response.data.selected_country_id || null

      // Sort payment methods by type for better UI organization
      sortPaymentMethods()
    } catch (err: any) {
      console.error('Error fetching payment methods:', err)
      error.value =
        err.response?.data?.message || 'Failed to load payment methods.'
      paymentMethods.value = []
    } finally {
      loading.value = false
    }
  }

  // Helper function to sort payment methods by a predefined order
  function sortPaymentMethods() {
    const order: Record<string, number> = {
      wallet: 1, // Wallet first (usually preferred)
      card: 2, // Card second
      mobile_money: 3, // Mobile money third
      bank_transfer: 4, // Bank transfer last
    }

    paymentMethods.value.sort((a, b) => {
      const orderA = order[a.type as keyof typeof order] || 99
      const orderB = order[b.type as keyof typeof order] || 99
      return orderA - orderB
    })
  }

  // Get payment methods by type
  function getMethodsByType(type: string) {
    return paymentMethods.value.filter((method) => method.type === type)
  }

  // Check if a specific payment method type is available
  function hasMethodType(type: string): boolean {
    return paymentMethods.value.some((method) => method.type === type)
  }

  return {
    paymentMethods,
    loading,
    error,
    selectedCountryId,
    fetchPaymentMethods,
    getMethodsByType,
    hasMethodType,
    transactionType,
  }
}
