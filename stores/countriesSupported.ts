import { defineStore } from 'pinia';
import { reactive } from 'vue';

interface SupportedCountry {
  id: number;
  name: string;
  code: string;
  supported: boolean;
}

export const useCountriesSupportedStore = defineStore('countriesSupported', () => {
  const countriesSupported = reactive({
    list: [] as SupportedCountry[],
    isFetching: false
  });

  const { $axios } = useNuxtApp();

  const fetchSupportedCountries = async () => {
    countriesSupported.isFetching = true;
    try {
      const response = await $axios.get('/api/countries/supported');
      countriesSupported.list = response.data.countries;
    } catch (error) {
      console.error('Failed to fetch supported countries:', error);
    } finally {
      countriesSupported.isFetching = false;
    }
  };

  return {
    countriesSupported,
    fetchSupportedCountries
  };
});
