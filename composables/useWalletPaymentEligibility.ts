// composables\useWalletPaymentEligibility.ts

import { computed, type ComputedRef } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'

interface PaymentFee {
  amount: number
  currency: { id: number; name: string; code: string }
}

type EligibilityStatus =
  | 'sufficient'
  | 'insufficient'
  | 'currencyMismatch'
  | 'loading'
  | 'error'

export function useWalletPaymentEligibility(
  paymentFee: ComputedRef<PaymentFee>
) {
  const walletStore = useWalletStore()

  const status = computed<EligibilityStatus>(() => {
    // If our PaymentFee doesn’t exist or has no currency code, treat it as loading
    if (
      !paymentFee.value ||
      !paymentFee.value.currency ||
      !paymentFee.value.currency.code
    ) {
      return 'loading'
    }

    // If the wallet hasn’t loaded
    if (walletStore.isFetching || !walletStore.wallet) {
      return 'loading'
    }

    // If wallet is not active
    if (!walletStore.isWalletActive) {
      return 'error'
    }

    // Compare codes (trim and uppercase to avoid small mismatches)
    const walletCurrency = walletStore.wallet.data.currency.code
      ?.trim()
      .toUpperCase()
    const feeCurrency = paymentFee.value.currency.code.trim().toUpperCase()

    if (!walletCurrency || !feeCurrency) {
      return 'loading'
    }
    if (walletCurrency !== feeCurrency) {
      return 'currencyMismatch'
    }

    // Check balance
    const walletBalance = parseFloat(walletStore.wallet.data.balance)
    return walletBalance >= paymentFee.value.amount
      ? 'sufficient'
      : 'insufficient'
  })

  const isEligible = computed(() => status.value === 'sufficient')
  const difference = computed(() => {
    if (
      status.value === 'currencyMismatch' ||
      status.value === 'loading' ||
      status.value === 'error'
    ) {
      return 0
    }
    const walletBalance = parseFloat(walletStore.wallet.data.balance)
    return walletBalance - paymentFee.value.amount
  })

  return { status, isEligible, difference }
}
