// stores\useCountries.ts

import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface Country {
  id: number
  name: string
  phone_code: string
  flag?: string
}

export const useCountryStore = defineStore('countries', {
  state: () => ({
    countries: [] as Country[],
    selectedCountry: null as Country | null,
    isFetched: false,
  }),
  actions: {
    async fetchCountries() {
      if (!this.isFetched) {
        try {
          const { $axios } = useNuxtApp()
          const response = await $axios.get('/api/countries')
          this.countries = response.data.countries
          this.isFetched = true
        } catch (error) {
          console.error('Error fetching countries:', error)
        }
      }
    },
    setSelectedCountry(country: Country) {
      this.selectedCountry = country
      localStorage.setItem('selectedCountry', JSON.stringify(country))
    },
    loadSelectedCountry() {
      const country = localStorage.getItem('selectedCountry')
      if (country) {
        this.selectedCountry = JSON.parse(country)
      }
    },
  },
  persist: {
    enabled: false,
    strategies: [{ key: 'countries', storage: localStorage }],
  },
})
