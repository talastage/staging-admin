import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useNuxtApp } from "#app";
import { useAuthStore } from "@/stores/auth";

export const useTransactionManagerStore = defineStore(
  "transactionManager",
  () => {
    const { $axios } = useNuxtApp();
    const authStore = useAuthStore();
    const selectedPaymentMethod = ref(null);
    const paymentDetails = ref(null);
    const amount = ref(0);
    const currency_id = ref(null);
    const action = ref("");

    const selectPaymentMethod = (method) => {
      selectedPaymentMethod.value = method;
    };

    const setPaymentDetails = (details) => {
      paymentDetails.value = details;
    };

    const setAmount = (value) => {
      amount.value = value;
    };

    const setAction = (actionType) => {
      action.value = actionType;
    };

    const setCurrency = (currencyId) => {
      currency_id.value = currencyId;
    };

    const canProceedWithTransaction = computed(() => {
      return (
        amount.value > 0 && 
        currency_id.value && 
        selectedPaymentMethod.value && 
        paymentDetails.value
      );
    });

    const transact = async (transactionData) => {
      try {
        const response = await $axios.post(
          `/api/transactions/${action.value}`,
          transactionData
        );
        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || "Transaction failed");
        }
      } catch (error) {
        console.error("Transaction failed:", error);
        if (error.response) {
          throw new Error(
            error.response.data.message || "Transaction failed due to a server error"
          );
        } else if (error.request) {
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        } else {
          throw error;
        }
      }
    };

    const resetTransaction = () => {
      selectedPaymentMethod.value = null;
      paymentDetails.value = null;
      amount.value = 0;
      currency_id.value = null;
      action.value = "";
    };

    return {
      selectedPaymentMethod,
      paymentDetails,
      amount,
      currency_id,
      action,
      selectPaymentMethod,
      setPaymentDetails,
      setAmount,
      setAction,
      setCurrency,
      canProceedWithTransaction,
      transact,
      resetTransaction,
    };
  }
);
