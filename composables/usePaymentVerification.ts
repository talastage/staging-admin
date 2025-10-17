import { ref } from 'vue'

interface PaymentVerificationResult {
  success: boolean
  message: string
  status?: string
  transaction_id?: string
  amount?: number
  currency?: string
}

export const usePaymentVerification = () => {
  const isVerifying = ref(false)
  const verificationResult = ref<PaymentVerificationResult | null>(null)

  const verifyPayment = async (reference: string, transactionId?: string, isPawaPay = false): Promise<PaymentVerificationResult> => {
    isVerifying.value = true
    
    try {
      const { $axios } = useNuxtApp()
      
      // Build payload based on gateway type
      const payload: any = {
        transaction_id: transactionId
      }
      
      if (isPawaPay) {
        payload.depositId = reference
      } else {
        payload.tx_ref = reference
      }
      
      const response = await $axios.post('/api/payments/verify', payload)

      verificationResult.value = response.data
      return response.data
    } catch (error: any) {
      const errorResult = {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed'
      }
      verificationResult.value = errorResult
      return errorResult
    } finally {
      isVerifying.value = false
    }
  }

  return {
    isVerifying: readonly(isVerifying),
    verificationResult: readonly(verificationResult),
    verifyPayment
  }
}