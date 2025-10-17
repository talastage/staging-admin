// stores/projectGenres.js
import { defineStore } from 'pinia';
import { useApiFetch } from '@/composables/apiFetch';

export const useProjectGenresStore = defineStore('projectGenres', {
  state: () => ({
    genres: {
      list: []
    }
  }),
  actions: {
    async fetchProjectGenres() {
      const { data, error } = await useApiFetch('/api/projects/audio-genres');
      if (data.value) {
        this.genres.list = data.value.data;
      } else {
        console.error('Error fetching genres:', error.value);
      }
    }
  }
});
