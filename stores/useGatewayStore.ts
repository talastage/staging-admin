// stores/useGatewayStore.ts

import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';

// Define the interface for Gateway
interface Gateway {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

export const useGatewayStore = defineStore('gateways', {
  state: () => ({
    gateways: [] as Gateway[],
    isFetched: false,
  }),
  actions: {
    async fetchGateways() {
      if (!this.isFetched) {
        try {
          const { $axios } = useNuxtApp();
          const response = await $axios.get<{ gateways: Gateway[] }>('/admin/gateways');
          
          this.gateways = response.data.gateways;
          this.isFetched = true;
        } catch (error) {
          console.error('Error fetching gateways:', error);
          // Handle the error as per your requirements
        }
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [{ key: 'gateways', storage: localStorage }],
  },
});
