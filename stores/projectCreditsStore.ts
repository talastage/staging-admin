import { defineStore } from "pinia";
import { ref } from "vue";
import { useNuxtApp } from "#app";

export const useProjectCreditsStore = defineStore("projectCredits", () => {
  const credits = ref([]);
  const loading = ref(false);
  const { $axios } = useNuxtApp();

  const fetchCredits = async (
    accessUuid,
    limit = null,
    perPage = 12,
    page = 1
  ) => {
    loading.value = true;
    try {
      console.log(`Fetching credits for project ${accessUuid}, page ${page}`);
      const params = {
        per_page: perPage,
        page,
      };
      if (limit) {
        params.limit = limit;
      }

      const response = await $axios.get(
        `/guest/projects/${accessUuid}/credits`,
        {
          params,
        }
      );
      console.log("Credits fetched:", response.data);
      credits.value = response.data.data;
      return response.data;
    } catch (error) {
      console.error("Error fetching credits:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    credits,
    loading,
    fetchCredits,
  };
});
