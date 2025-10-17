import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import { Ref } from "vue";

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
}

interface PaymentDetails {
  [key: number]: any;
}

interface State {
  paymentMethods: PaymentMethod[];
  paymentDetails: PaymentDetails;
  selectedCountry: Ref<any>;
}

export const usePaymentMethodDetails = defineStore("payment", {
  state: (): State => ({
    paymentMethods: [],
    paymentDetails: {},
    selectedCountry: null,
  }),
  actions: {
    async fetchPaymentMethods(countryId: number) {
      const { $axios } = useNuxtApp();
      try {
        const response = await $axios.get(`/api/payment/methods/by-country`, {
          params: { country_id: countryId, transaction_type: "paying" },
        });
        this.paymentMethods = response.data.paymentMethods.filter(
          (method: PaymentMethod) => method && method.id
        );
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
      }
    },
    async fetchPaymentDetails(countryId: number, methodId: number) {
      const { $axios } = useNuxtApp();
      try {
        const response = await $axios.get(
          `/api/payment/methods/details/${countryId}/${methodId}`
        );
        this.paymentDetails[methodId] = response.data;
      } catch (error) {
        console.error("Failed to fetch payment details:", error);
      }
    },
  },
});
