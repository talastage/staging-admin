// types/notification.ts

// Transaction Types
export type TransactionType =
  | 'withdrawal'
  | 'deposit'
  | 'transfer'
  | 'payment'
  | 'refund'
  | 'tip'
  | 'project_tip'
  | 'project_watching'
  | 'project_premiering'
  | 'project_investor_transfer'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed'

// Action Types
export interface NotificationAction {
  label: string
  type: string
  payload: Record<string, any>
}

// Transaction Data
export interface TransactionData {
  title: string
  message: string
  transaction_id: number
  amount: number
  type: TransactionType
  status: TransactionStatus
  wallet_id: number
  sender_id?: number
  order_id?: string
  currency_id?: number
}

// Investment Data
export interface InvestmentData {
  title: string
  message: string
  project_id: number
  share_percentage: number
  type: 'investment_request'
  actions: NotificationAction[]
}

// Union type for all possible notification data types
export type NotificationData = TransactionData | InvestmentData

// Notification Interface
export interface Notification {
  id: string
  type: string
  data: NotificationData
  read_at: string | null
  created_at: string
  created_at_human: string
  is_read: boolean
  actions: NotificationAction[]
  title: string
  message: string
}

// Pagination Interface
export interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// API Response Interfaces
export interface NotificationResponse {
  notifications: Notification[]
  unread_count: number
  pagination: PaginationData
}

export interface ActionResponse {
  message: string
  unread_count: number
}

// Store State Interface
export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  hasNewNotifications: boolean
  pagination: PaginationData
  lastFetchTime: number
  error: string | null
}
