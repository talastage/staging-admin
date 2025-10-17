export const useStudioProjectsStore = defineStore("studioProjects", () => {
  const { $axios } = useNuxtApp();

  const projects = ref({
    published: {
      data: [],
      currentPage: 0,
      lastPage: 1,
      isLoading: false,
      isLoaded: false,
    },
    draft: {
      data: [],
      currentPage: 0,
      lastPage: 1,
      isLoading: false,
      isLoaded: false,
    },
  });

  const fetchProjects = async (type: "published" | "draft") => {
    if (
      projects.value[type].isLoading ||
      projects.value[type].currentPage >= projects.value[type].lastPage
    ) {
      return;
    }

    projects.value[type].isLoading = true;

    try {
      const response = await $axios.get(
        `/api/studio/projects?type=${type}&page=${
          projects.value[type].currentPage + 1
        }`
      );
      const responseData = response.data;

      if (responseData?.data && Array.isArray(responseData.data)) {
        projects.value[type].data = [
          ...projects.value[type].data,
          ...responseData.data,
        ];
        projects.value[type].currentPage = responseData.meta.current_page;
        projects.value[type].lastPage = responseData.meta.last_page;
      }

      projects.value[type].isLoaded = true;
    } catch (error) {
      console.error(`Error fetching ${type} projects:`, error);
      throw error;
    } finally {
      projects.value[type].isLoading = false;
    }
  };

  const deleteProject = async (accessUuid: string) => {
    try {
      await $axios.delete(`/api/studio/projects/${accessUuid}`);
      for (const tab in projects.value) {
        projects.value[tab].data = projects.value[tab].data.filter(
          (project) => project.access_uuid !== accessUuid
        );
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };

  const getProjectsByType = (type: "published" | "draft") => {
    return projects.value[type].data;
  };

  const resetProjects = (type: "published" | "draft") => {
    projects.value[type] = {
      data: [],
      currentPage: 0,
      lastPage: 1,
      isLoading: false,
      isLoaded: false,
    };
  };

  const hasMore = (type: "published" | "draft") => {
    return projects.value[type].currentPage < projects.value[type].lastPage;
  };

  return {
    projects,
    fetchProjects,
    getProjectsByType,
    resetProjects,
    hasMore,
    deleteProject,
  };
});
