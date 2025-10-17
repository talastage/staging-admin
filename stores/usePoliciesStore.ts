import { defineStore } from "pinia";
import { ref } from "vue";
import { useApi } from "@/composables/useApi";

export const usePoliciesStore = defineStore("policies", () => {
  const policies = ref([]);
  const { get } = useApi();

  const CACHE_KEY = "policiesSessionCache";
  const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Fetch policies from API with sessionStorage caching
  const fetchPolicies = async () => {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Check if cache is valid (not expired)
        if (Date.now() - timestamp < CACHE_EXPIRATION) {
          policies.value = data;
          return;
        }
      }

      // If no valid cache, fetch from API
      const response = await get("/api/policies");
      policies.value = response;

      // Save fetched policies to sessionStorage with timestamp
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: response,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  // Clear the cached policies, useful when you need to force-refresh
  const clearCache = () => {
    sessionStorage.removeItem(CACHE_KEY);
    policies.value = [];
  };

  return {
    policies,
    fetchPolicies,
    clearCache,
  };
});
