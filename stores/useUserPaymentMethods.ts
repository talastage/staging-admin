// stores/useUserPaymentMethodsStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { useApi } from "@/composables/useApi";

export const useUserPaymentMethodsStore = defineStore(
  "userPaymentMethods",
  () => {
    const api = useApi();
    const paymentMethods = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchUserPaymentMethods = async (
      userId: number,
      methodType: string
    ) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await api.get(
          `/api/payment-methods/user/${userId}/${methodType}`
        );
        if (response && response.user_country_payment_methods) {
          paymentMethods.value = response.user_country_payment_methods;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching user payment methods:", err);
        error.value = "Failed to load payment methods. Please try again later.";
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      paymentMethods,
      loading,
      error,
      fetchUserPaymentMethods,
    };
  }
);
