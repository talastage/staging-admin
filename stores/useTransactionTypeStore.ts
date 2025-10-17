// stores/useTransactionTypeStore.ts

import { defineStore } from "pinia";

// Define the interface for TransactionType
interface TransactionType {
  id: number;
  name: string;
  icon_url?: string;
  active: boolean;
}

export const useTransactionTypeStore = defineStore("transactionTypes", {
  state: (): { transactionTypes: TransactionType[]; isFetched: boolean } => ({
    transactionTypes: [],
    isFetched: false,
  }),
  actions: {
    async fetchTransactionTypes() {
      if (!this.isFetched) {
        try {
          const { $axios } = useNuxtApp();
          const response = await $axios.get("/admin/transaction/types");
          this.transactionTypes = response.data.transaction_types;
          this.isFetched = true;
        } catch (error) {
          console.error("Error fetching transaction types:", error);
        }
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [{ key: "transactionTypes", storage: localStorage }],
  },
});
