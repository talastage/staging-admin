import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

interface PaymentMethod {
  id: number;
  name: string;
  logo_url: string | null;
  type: string;
}

interface WithdrawalMethodsResponse {
  withdrawal_methods: PaymentMethod[];
  message: string;
}

export const useWithdrawalMethodStore = defineStore("withdrawalMethods", {
  state: () => ({
    methods: [] as PaymentMethod[],
    isFetched: false,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    cardMethods: (state) =>
      state.methods.filter((method) => method.type === "card"),

    bankMethods: (state) =>
      state.methods.filter((method) => method.type === "bank_transfer"),

    mobileMoneyMethods: (state) =>
      state.methods.filter((method) => method.type === "mobile_money"),

    digitalWalletMethods: (state) =>
      state.methods.filter((method) =>
        ["apple_pay", "google_pay", "samsung_pay", "wallet"].includes(
          method.type
        )
      ),
  },

  actions: {
    async fetchWithdrawalMethods(countryId: number) {
      if (this.isFetched) return;

      this.loading = true;
      this.error = null;

      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.get<WithdrawalMethodsResponse>(
          `/api/countries/${countryId}/withdrawal-methods`
        );

        this.methods = response.data.withdrawal_methods;
        this.isFetched = true;
      } catch (error: any) {
        console.error("Error fetching withdrawal methods:", error);
        this.error =
          error.response?.data?.message || "Failed to fetch withdrawal methods";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearWithdrawalMethods() {
      this.methods = [];
      this.isFetched = false;
      this.error = null;
    },
  },

  persist: {
    enabled: true,
    strategies: [{ key: "withdrawalMethods", storage: localStorage }],
  },
});
