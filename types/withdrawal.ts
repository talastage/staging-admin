// types/withdrawal.ts
export interface PaymentMethod {
  id: number;
  name: string;
  logo_url: string | null;
  type: string;
}

export interface BankPaymentable {
  id: number;
  country_id: number;
  name: string;
  logo_url: string;
  bank_code: string;
  swift_code: string;
}

export interface MobileMoneyPaymentable {
  id: number;
  country_id: number;
  name: string;
  logo_url: string;
  provider_code: string;
  phone_number_prefix: string;
  customer_care_number: string;
  website_url: string;
  currency_id: number;
  description: string;
  active: boolean;
}

export interface WithdrawalMethod {
  id: number;
  gateway_id: number;
  payment_method_id: number;
  payment_method: PaymentMethod;
  type: 'bank' | 'mobile_money';
  paymentable: BankPaymentable | MobileMoneyPaymentable | null;
}

// types/withdrawal.ts
export interface WithdrawalRequest {
  amount: number;
  withdrawal_method_id: number;
  payment_method_id: number;
  gateway_id: number;
  type: string;
  paymentable_id: number;
  country_id: number; // Add country_id
  bank_account_number?: string;
  account_holder_name?: string;
  mobile_number?: string;
}
