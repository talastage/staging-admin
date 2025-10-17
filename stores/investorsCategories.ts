// investorsCategories.ts
import { defineStore } from 'pinia';
import { reactive } from 'vue';

interface InvestorCategory {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  avatar_url?: string;
  cover_url?: string;
}

export const useInvestorsCategoriesStore = defineStore('investorsCategories', () => {
  const categories = reactive<{ list: InvestorCategory[] }>({
    list: [],
  });

  const { $axios } = useNuxtApp();

  const fetchInvestorCategories = async () => {
    try {
      const response = await $axios.get('/api/investors/categories');
      categories.list = response.data.categories;
    } catch (error) {
      console.error('Error fetching investor categories:', error);
    }
  };

  return {
    categories,
    fetchInvestorCategories,
  };
});
