// stores/useCountryPaymentMethodsStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { useNuxtApp } from "#app";

interface PaymentMethod {
  id: number;
  payment_method_id: number;
  gateway_id: number;
  currency_id: number | null;
  charge_percentage: number | null;
  max_deposit_amount: number | null;
  gateway: {
    id: number;
    name: string;
    slug: string;
    logo: string;
  };
  payment_method: {
    id: number;
    name: string;
    type: string;
    logo_url: string | null;
  };
  paymentable_type: string;
  paymentable_id: number;
  paymentable: {
    id: number;
    name: string;
    logo_url: string;
    [key: string]: any;
  };
}

export const useCountryPaymentMethodsStore = defineStore(
  "countryPaymentMethods",
  () => {
    const { $axios } = useNuxtApp();
    const paymentMethods = ref<PaymentMethod[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const selectedCountryId = ref<number | null>(null);

    const fetchCountryPaymentMethods = async (transactionType: string) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await $axios.get("/api/payment-methods", {
          params: { transaction_type: transactionType },
        });
        paymentMethods.value = response.data.country_payment_methods;
        selectedCountryId.value = response.data.selected_country_id;
      } catch (err: any) {
        console.error("Error fetching country payment methods:", err);
        error.value = err.response?.data?.message || "Failed to load payment methods. Please try again later.";
      } finally {
        loading.value = false;
      }
    };

    return {
      paymentMethods,
      loading,
      error,
      selectedCountryId,
      fetchCountryPaymentMethods,
    };
  }
);