// composables/useWalletStatus.ts
import { computed, Ref } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'

interface PaymentInfo {
  amount: number
  currency: {
    id?: number
    code: string
    symbol: string
  }
}

type WalletStatus =
  | 'inactive'
  | 'insufficient'
  | 'sufficient'
  | 'currencyMismatch'
  | 'error'

export function useWalletStatus(paymentInfo: Ref<PaymentInfo> | PaymentInfo) {
  const walletStore = useWalletStore()

  // Get payment info, handling both reactive and non-reactive usage
  const getPaymentInfo = () => {
    if ('value' in paymentInfo) {
      return paymentInfo.value
    }
    return paymentInfo
  }

  // Is wallet active
  const isWalletActive = computed(() => walletStore.isWalletActive)

  // Calculate available balance
  const availableBalance = computed(() =>
    Number(walletStore.currentBalance || 0)
  )

  // Check for currency mismatch
  const isCurrencyMismatch = computed(() => {
    const payment = getPaymentInfo()
    if (!walletStore.currentCurrency || !payment.currency) return false
    return walletStore.currentCurrency.code !== payment.currency.code
  })

  // Check for insufficient funds
  const hasInsufficientFunds = computed(() => {
    const payment = getPaymentInfo()
    if (isCurrencyMismatch.value) return false // Handle separately
    return availableBalance.value < payment.amount
  })

  // Determine overall status
  const status = computed<WalletStatus>(() => {
    if (!isWalletActive.value) return 'inactive'
    if (isCurrencyMismatch.value) return 'currencyMismatch'
    if (hasInsufficientFunds.value) return 'insufficient'
    return 'sufficient'
  })

  // Is payment eligible
  const isEligible = computed(() => {
    return (
      isWalletActive.value &&
      !hasInsufficientFunds.value &&
      !isCurrencyMismatch.value
    )
  })

  return {
    status,
    isEligible,
    isWalletActive,
    hasInsufficientFunds,
    isCurrencyMismatch,
    availableBalance,
  }
}
