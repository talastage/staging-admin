// stores/useGatewayFeesStore.ts
import { defineStore } from "pinia";

interface GatewayFee {
  currency: string;
  domestic_fee_percentage: number;
  domestic_fee_fixed: number;
  international_fee_percentage: number;
  international_fee_fixed: number;
}

interface GatewayFeeResponse {
  fees: GatewayFee[];
  international_charge_fee_percentage: number;
}

interface FeeParams {
  country_id: number;
  gateway_id: number;
  payment_method_id: number;
  transaction_type: "deposit" | "withdrawal";
}

export const useGatewayFeesStore = defineStore("gatewayFees", {
  state: () => ({
    fees: [] as GatewayFee[],
    internationalChargeFeePercentage: 0,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchFees(params: FeeParams) {
      this.loading = true;
      this.error = null;

      try {
        const response: GatewayFeeResponse = await $fetch("/api/gateway-fees", {
          params: {
            country_id: params.country_id,
            gateway_id: params.gateway_id,
            payment_method_id: params.payment_method_id,
            transaction_type: params.transaction_type,
          },
        });

        this.fees = response.fees;
        this.internationalChargeFeePercentage =
          response.international_charge_fee_percentage;
      } catch (error) {
        console.error("Error fetching gateway fees:", error);
        this.error = "Failed to fetch gateway fees. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    calculateFee(amount: number): number {
      if (
        this.fees.length === 0 ||
        this.internationalChargeFeePercentage === 0
      ) {
        return 0;
      }

      // For simplicity, we're using the international charge fee percentage
      // You might want to implement more complex logic based on your requirements
      return (amount * this.internationalChargeFeePercentage) / 100;
    },
  },

  getters: {
    isLoaded: (state): boolean => state.fees.length > 0,
  },
});
