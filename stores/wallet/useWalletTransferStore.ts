// stores/wallet/useWalletTransferStore.ts
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth' // Import auth store

// Interfaces
interface WalletCurrency {
  id: number
  code: string
  symbol: string
  name: string
  is_active: boolean
  is_default: boolean
}

interface VerifiedWallet {
  id: number
  balance: number
  currency: WalletCurrency
  name: string
  owner_id: number
  status: string
  wallet_code: string
  user?: {
    display_name: string
    // other user properties
  }
}

interface TransferData {
  sender_wallet_id: number
  receiver_wallet_code: string
  amount: number
  currency_id: number
  exchange_rate?: number | null
  converted_amount?: number | null
}

export const useWalletTransferStore = defineStore('walletTransfer', () => {
  const { $axios } = useNuxtApp()
  const authStore = useAuthStore()

  const verifyWallet = async (walletCode: string): Promise<VerifiedWallet> => {
    try {
      // Check if user is trying to transfer to their own wallet
      // by comparing the owner_id with the authenticated user's ID
      const { data } = await $axios.get(`/api/wallet/verify/${walletCode}`)

      if (data.status === 'error') {
        throw new Error(data.message)
      }

      // Compare with authenticated user's ID
      if (data.data?.owner_id === authStore.user?.value?.id) {
        throw new Error('You cannot transfer funds to your own wallet')
      }

      return data.data
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to verify wallet'
      console.error('Failed to verify wallet:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getExchangeRate = async (
    fromCurrencyId: number,
    toCurrencyId: number
  ): Promise<number> => {
    try {
      // Return 1 if same currency
      if (fromCurrencyId === toCurrencyId) {
        return 1
      }

      const { data } = await $axios.get(`/api/wallet/currency/exchange-rate`, {
        params: {
          from_currency_id: fromCurrencyId,
          to_currency_id: toCurrencyId,
        },
      })

      if (data.status === 'error') {
        throw new Error(data.message)
      }

      return data.data.rate || 1
    } catch (error: any) {
      console.error('Failed to get exchange rate:', error)
      // Return a reasonable default or throw based on your app's requirement
      throw new Error('Failed to get exchange rate. Please try again.')
    }
  }

  const transferFunds = async (transferData: TransferData) => {
    try {
      console.log('Making API call to /api/wallet/transfer with:', transferData)
      const { data } = await $axios.post('/api/wallet/transfer', transferData)
      console.log('API response:', data)

      if (data.status === 'error') {
        throw new Error(data.message)
      }

      return {
        data: data.data,
        message: data.message,
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred during the transfer'
      console.error('Failed to transfer funds:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    verifyWallet,
    transferFunds,
    getExchangeRate,
  }
})

export type { WalletCurrency, VerifiedWallet, TransferData }
