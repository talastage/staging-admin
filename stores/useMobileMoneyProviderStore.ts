import { defineStore } from 'pinia';
import { useNuxtApp } from '#app'; // Import to access the Nuxt app context

// Define the interface for a MobileMoneyProvider
interface MobileMoneyProvider {
  id: number;
  name: string;
  active: boolean;
}

// Define the store for MobileMoneyProvider
export const useMobileMoneyProviderStore = defineStore('mobileMoneyProviders', {
  state: () => ({
    providers: [] as MobileMoneyProvider[],
    isFetched: false,
  }),
  actions: {
    async fetchMobileMoneyProviders() {
      if (!this.isFetched) {
        try {
          const { $axios } = useNuxtApp(); // Access $axios from the Nuxt app context
          const response = await $axios.get<{
            mobile_money_providers: MobileMoneyProvider[];
          }>("/api/mobile-money/providers");

          this.providers = response.data.mobile_money_providers;
          this.isFetched = true;
        } catch (error) {
          console.error("Error fetching mobile money providers:", error);
          // Optionally handle the error, e.g., set an error state, show a message, etc.
        }
      }
    },
  },
  // Persist state in local storage
  persist: {
    enabled: true,
    strategies: [{ key: 'mobileMoneyProviders', storage: localStorage }],
  },
});
