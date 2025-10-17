// composables/useHelpSearch.ts
export const useHelpSearch = () => {
  const searchTerm = ref("");
  const results = ref<HelpSearchResult[]>([]);
  const isSearching = ref(false);
  const totalResults = ref(0);
  const currentPage = ref(1);

  // Computed
  const hasResults = computed(() => results.value.length > 0);
  const hasMoreResults = computed(
    () => totalResults.value > results.value.length
  );
  const isEmpty = computed(
    () => !isSearching.value && searchTerm.value && !hasResults.value
  );

  // Methods
  const performSearch = async (
    options: {
      page?: number;
      limit?: number;
      showLoading?: boolean;
    } = {}
  ) => {
    const { page = 1, limit = 10, showLoading = true } = options;

    if (showLoading) {
      isSearching.value = true;
    }

    try {
      const { data } = await useNuxtApp().$axios.get("/api/help/search", {
        params: {
          q: searchTerm.value,
          page,
          limit,
        },
      });

      results.value = data.results || [];
      totalResults.value = data.total || 0;
      currentPage.value = page;
    } catch (error) {
      console.error("Search error:", error);
      useToast().error("Failed to perform search. Please try again.");
      results.value = [];
      totalResults.value = 0;
    } finally {
      if (showLoading) {
        isSearching.value = false;
      }
    }
  };

  const clearSearch = () => {
    searchTerm.value = "";
    results.value = [];
    totalResults.value = 0;
    currentPage.value = 1;
  };

  return {
    // State
    searchTerm,
    results,
    isSearching,
    totalResults,
    currentPage,

    // Computed
    hasResults,
    hasMoreResults,
    isEmpty,

    // Methods
    performSearch,
    clearSearch,
  };
};
