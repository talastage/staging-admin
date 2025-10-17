// types\tips.ts

export interface Balance {
  id: number
  user_id: number
  currency: Currency
  balance: string
  total_earned: string
  total_withdrawn: string
  last_earning_at: string
  last_withdrawal_at: string
}

export interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

export interface Tip {
  id: number
  tipper: User
  recipient: User
  gross_amount: AmountWithCurrency
  app_service_fee: AmountWithCurrency
  net_amount: AmountWithCurrency
  currency: Currency
  message: string | null
  status: 'completed' | 'pending' | 'failed'
  record_type: 'sent' | 'received'
  created_at: string
  updated_at: string
}

export interface AmountWithCurrency {
  amount: number
  formatted: string
  currency: Currency
}

export interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

export interface TipSummary {
  sent: {
    count: number
    total_amount: string
  }
  received: {
    count: number
    total_amount: string
  }
}
