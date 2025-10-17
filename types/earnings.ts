// types/earnings.ts
export interface Currency {
  id: number
  name: string
  code: string
  symbol: string
}

export interface EarningsSummary {
  available_amount: string
  creator_total_earnings: string
  creator_total_transferred: string
  currency: Currency
}

export interface EarningTransaction {
  id: number
  amount: string
  available_amount: string
  transaction_type: 'earning' | 'transfer' | 'project_tip' | 'project_watching'
  status: string
  created_at: string
  currency: Currency
}

export interface EarningByType {
  transaction_type: string
  total_amount: string
  transaction_count: number
}

export interface InvestmentOverview {
  summary: {
    available_amount: string
    total_transactions: number
    last_earning_date: string | null
    currency: Currency
  }
  earnings_by_type: EarningByType[]
  recent_transactions: EarningTransaction[]
}
