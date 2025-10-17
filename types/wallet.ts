// types/wallet.ts
export interface WalletData {
  id: number
  wallet_code: string
  name: string
  owner_id: number
  balance: string
  currency: {
    id: number
    name: string
    code: string
  }
  status: 'active' | 'inactive' | 'suspended' | 'frozen'
}

export interface WalletResponse {
  data: WalletData
}
