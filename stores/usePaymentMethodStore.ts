import { defineStore } from "pinia";
import { useNuxtApp } from "#app"; // Import to access the Nuxt app context

// Define the interface for a PaymentMethod
interface PaymentMethod {
  id: number;
  name: string;
  active: boolean;
}

// Define the store for PaymentMethod
export const usePaymentMethodStore = defineStore("paymentMethods", {
  state: () => ({
    methods: [] as PaymentMethod[],
    isFetched: false,
  }),
  actions: {
    async fetchPaymentMethods() {
      if (!this.isFetched) {
        try {
          const { $axios } = useNuxtApp(); // Access $axios from the Nuxt app context
          const response = await $axios.get<{
            payment_methods: PaymentMethod[];
          }>("/api/payment/methods");

          this.methods = response.data.payment_methods;
          this.isFetched = true;
        } catch (error) {
          console.error("Error fetching payment methods:", error);
          // Optionally handle the error, e.g., set an error state, show a message, etc.
        }
      }
    },
  },
  // Persist state in local storage
  persist: {
    enabled: true,
    strategies: [{ key: "paymentMethods", storage: localStorage }],
  },
});
