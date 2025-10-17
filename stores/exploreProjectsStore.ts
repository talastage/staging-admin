import { defineStore } from "pinia";
import type { Project } from "~/projectTypes"; // Adjust based on your file structure
import { useApi } from "@/composables/useApi"; // Import the useApi composable

export const useExploreProjectsStore = defineStore("exploreProjects", {
  state: () => ({
    projects: [] as Project[],
    currentPage: 1,
    lastPage: 0,
    perPage: 10,
    isLoading: false,
    isFetched: false,
  }),
  actions: {
    setProjects(data: any) {
      this.projects = [...this.projects, ...data.projects];
      this.currentPage = data.current_page;
      this.lastPage = data.last_page;
      this.perPage = data.per_page;
      this.isFetched = true;
    },
    async fetchProjects() {
      if (this.currentPage <= this.lastPage || this.lastPage === 0) {
        try {
          this.isLoading = true;
          const api = useApi();
          const response = await api.get("/api/home/projects/explore", {
            params: {
              page: this.currentPage + 1, // Fetch next page
              per_page: this.perPage,
            },
          });
          this.setProjects(response);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          this.isLoading = false;
        }
      }
    },
  },
});
