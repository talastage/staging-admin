// types/projectInvestor.ts
export interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

export interface ProjectInvestorSummary {
  total_transactions: number
  total_gross_amount: number
  total_net_amount: number
  total_app_service_fee: number
  average_fee_percentage: number
  first_earning_date: string
  last_earning_date: string
  currency: Currency
}

export interface ProjectInvestorTransaction {
  id: number
  gross_amount: number
  net_amount: number
  app_service_fee: number
  fee_percentage: number
  status: string
  created_at: string
  currency: Currency
}

export interface ProjectInvestorTransactionsPagination {
  data: ProjectInvestorTransaction[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
