// useInvestmentCategoriesStore.js
import { defineStore } from 'pinia';
import { reactive } from 'vue';

interface InvestmentCategory {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    avatar_url?: string;
    cover_url?: string;
    order: number;
    is_featured: boolean;
    status: 'active' | 'inactive' | 'archived';
}

export const useInvestmentCategoriesStore = defineStore('investmentCategories', () => {
    const categories = reactive<{
        list: InvestmentCategory[],
        isFetched: boolean
    }>({
        list: [],
        isFetched: false,
    });

    const { $axios } = useNuxtApp();

    const fetchInvestmentCategories = async () => {
        if (!categories.isFetched) {
            try {
                const response = await $axios.get('/api/investments/categories');
                categories.list = response.data.categories;
                categories.isFetched = true;
            } catch (error) {
                console.error('Error fetching Investment categories:', error);
            }
        }
    };

    const getRelatedCategories = (currentSlug: string) => {
        return categories.list.filter((category) => category.slug !== currentSlug);
    };

    return {
        categories,
        fetchInvestmentCategories,
        getRelatedCategories,
    };
});
