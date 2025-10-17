// composables\useAmountFormatter.ts

import { computed } from 'vue'

interface Currency {
  id: number
  name: string
  code: string
  symbol: string
  is_default: boolean
}

interface FormatOptions {
  decimals?: number
  showCurrency?: boolean
  compact?: boolean
}

export const useAmountFormatter = () => {
  /**
   * Format raw amount with currency
   */
  const formatAmount = (
    amount: string | number,
    currency: Currency,
    options: FormatOptions = {}
  ) => {
    const { decimals = 2, showCurrency = true, compact = false } = options

    // Convert string to number if needed
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount

    try {
      const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        notation: compact ? 'compact' : 'standard',
      })

      const formattedNumber = formatter.format(numericAmount)
      return showCurrency
        ? `${currency.symbol} ${formattedNumber}`
        : formattedNumber
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      const fallbackNumber = numericAmount.toFixed(decimals)
      return showCurrency
        ? `${currency.symbol} ${fallbackNumber}`
        : fallbackNumber
    }
  }

  /**
   * Format without currency symbol
   */
  const formatNumeric = (amount: string | number, decimals = 2) => {
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount

    try {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(numericAmount)
    } catch (error) {
      return numericAmount.toFixed(decimals)
    }
  }

  /**
   * Format in compact notation (e.g., 1K, 1M)
   */
  const formatCompact = (amount: string | number, currency: Currency) => {
    return formatAmount(amount, currency, { compact: true })
  }

  /**
   * Format for precise display (e.g., for transactions)
   */
  const formatPrecise = (amount: string | number, currency: Currency) => {
    return formatAmount(amount, currency, { decimals: 4 })
  }

  /**
   * Format wallet balance
   */
  const formatWalletBalance = (wallet: {
    balance: string
    currency: Currency
  }) => {
    if (!wallet?.balance || !wallet?.currency) return ''
    return formatAmount(wallet.balance, wallet.currency)
  }

  return {
    formatAmount,
    formatNumeric,
    formatCompact,
    formatPrecise,
    formatWalletBalance,
  }
}
