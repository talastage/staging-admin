import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useNuxtApp } from "#app";

export const useTalentsStore = defineStore("talents", () => {
  const { $axios } = useNuxtApp();

  const talents = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const lastPage = ref(1);
  const filters = ref({
    talent_category_id: null,
    country_id: null,
    search: "",
    per_page: 20,
  });

  const hasMore = computed(() => currentPage.value < lastPage.value);

  const fetchTalents = async (page = 1) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $axios.get("/api/talents", {
        params: {
          ...filters.value,
          page,
        },
      });

      if (page === 1) {
        talents.value = response.data.data;
      } else {
        talents.value = [...talents.value, ...response.data.data];
      }

      currentPage.value = response.data.meta.current_page;
      lastPage.value = response.data.meta.last_page;
    } catch (err) {
      console.error("Error fetching talents:", err);
      error.value = "Failed to fetch talents. Please try again.";
    } finally {
      isLoading.value = false;
    }
  };

  const loadMore = async () => {
    if (hasMore.value && !isLoading.value) {
      await fetchTalents(currentPage.value + 1);
    }
  };

  const clearFilters = () => {
    filters.value = {
      talent_category_id: null,
      country_id: null,
      search: "",
      per_page: 20,
    };
    fetchTalents(1);
  };

  return {
    talents,
    isLoading,
    error,
    filters,
    hasMore,
    fetchTalents,
    loadMore,
    clearFilters,
  };
});
