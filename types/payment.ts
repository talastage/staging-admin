// types/payment.ts

export interface PaymentError {
  code: string
  message: string
}

export interface PaymentResponse {
  status: 'success' | 'error' | 'failed'
  message: string
  data?: any
  error?: PaymentError
}

export type PaymentMethodType =
  | 'wallet'
  | 'card'
  | 'mobile_money'
  | 'bank_transfer'
export type TransactionType = 'deposit' | 'withdrawal' | 'payment'

export interface Currency {
  id: number
  code: string
  symbol: string
  [key: string]: any
}

export interface Gateway {
  id: number
  name: string
  slug: string
  logo: string | null
}

export interface PaymentMethod {
  id: number
  name: string
  type: PaymentMethodType
  logo_url: string | null
}

export interface Depositable {
  id: number
  name: string
  [key: string]: any
}

export interface Country {
  id: number
  name: string
  [key: string]: any
}

export interface CountryPaymentMethod {
  id: number
  payment_method_id: number
  gateway_id: number
  currency_id: number
  charge_fee_percentage: number | null
  gateway: Gateway
  payment_method: PaymentMethod
  depositable_type: string
  depositable: Depositable
  currency: Currency
  country: Country
}

export interface PaymentValidation {
  valid: boolean
  data: any
}

export interface CartItem {
  id: number
  payment_type: string
  payable_id: number
  paying_amount: string | number
}

export interface PaymentPayload {
  payment_method_id: number
  gateway_id: number
  currency_id: number
  total_amount: number
  cart_items: CartItem[]
  payment_data: Record<string, any>
}

export interface PaymentRequestPayload {
  paying_amount: number
  currency_id: number
  payment_type: TransactionType
  payable_type: string
  payable_id: number | string
}

// ------------------------
// Additional types for order events
// ------------------------

/**
 * Minimal order data required for notifications.
 */
export interface OrderData {
  id: number
  reference: string
  order_type:
    | 'tip'
    | 'project_watching'
    | 'project_premiering'
    | 'project_tip'
    | 'project_promotion'
    | 'event_promotion'
    | 'ticket_promotion'
    | 'user_profile_promotion'
  status: string
  completed_at?: string | null
}

/**
 * A minimal Project interface matching ProjectViewResource.
 */
export interface Project {
  id: number
  access_uuid: string
  name: string
  video_url: string
  thumbnail_url: string
  created_at: string
}

/**
 * A minimal User interface matching UserViewResource.
 */
export interface AppUser {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

/**
 * Payload for broadcast event when an order is successfully paid.
 *
 * - If order_type is project_watching, project_premiering, project_tip or project_promotion,
 *   the resource will be of type Project.
 * - If order_type is tip, the resource will be of type AppUser.
 */
export interface OrderPaymentCompletedPayload {
  order: OrderData
  resource?: Project | AppUser | null
}
