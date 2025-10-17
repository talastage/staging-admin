// stores/useTalentCategoriesWithProjects.ts
import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

interface Project {
  id: number;
  name: string;
}

interface TalentCategoryWithProjects {
  id: number;
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  cover_url?: string;
  projects_count: number;
  talents_count: number;
  recent_projects?: Project[];
}

export const useTalentCategoriesWithProjectsStore = defineStore(
  "talentCategoriesWithProjects",
  {
    state: () => ({
      categories: [] as TalentCategoryWithProjects[],
      isFetched: false,
    }),
    actions: {
      async fetchCategoriesWithProjects() {
        if (!this.isFetched) {
          try {
            const { $axios } = useNuxtApp();
            const response = await $axios.get<{
              data: TalentCategoryWithProjects[];
            }>("/api/talent/categories/with-projects");
            this.categories = response.data.data;
            this.isFetched = true;
          } catch (error) {
            console.error(
              "Error fetching talent categories with projects:",
              error
            );
          }
        }
      },
      async fetchCategoryProjects(categoryId: number) {
        const category = this.categories.find((c) => c.id === categoryId);
        if (category && !category.recent_projects) {
          try {
            const { $axios } = useNuxtApp();
            const response = await $axios.get<{ recent_projects: Project[] }>(
              `/api/talent/categories/${categoryId}/projects`
            );
            category.recent_projects = response.data.recent_projects;
          } catch (error) {
            console.error(
              `Error fetching projects for category ${categoryId}:`,
              error
            );
          }
        }
      },
    },
  }
);
