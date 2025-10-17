// composables/useWalletBalance.ts
import { useWalletStore } from '~/stores/useWalletStore'

interface BalanceComparison {
  numericBalance: number
  isSufficient: boolean
  difference: number
  formattedBalance: string
}

export const useWalletBalance = () => {
  const walletStore = useWalletStore()

  const numericBalance = computed(() => {
    try {
      if (!walletStore.currentBalance) return 0
      // Remove non-numeric characters except decimal point
      const numericString = walletStore.currentBalance.replace(/[^0-9.]/g, '')
      return parseFloat(numericString) || 0
    } catch (error) {
      console.error('Error parsing wallet balance:', error)
      return 0
    }
  })

  const formattedBalance = computed(() => {
    return walletStore.currentCurrency?.code
      ? `${walletStore.currentCurrency.code} ${numericBalance.value.toFixed(2)}`
      : numericBalance.value.toFixed(2)
  })

  const compareWithAmount = (requiredAmount: number): BalanceComparison => {
    const balance = numericBalance.value
    return {
      numericBalance: balance,
      isSufficient: balance >= requiredAmount,
      difference: balance - requiredAmount,
      formattedBalance: formattedBalance.value,
    }
  }

  const checkSufficientFunds = (amount: number) => {
    return numericBalance.value >= amount
  }

  return {
    numericBalance,
    formattedBalance,
    compareWithAmount,
    checkSufficientFunds,
    currencyCode: computed(() => walletStore.currentCurrency?.code || ''),
  }
}
