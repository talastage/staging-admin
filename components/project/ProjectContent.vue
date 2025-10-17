<template>
    <div>
      <v-card class="mb-3">
        <h1>Project Details</h1>
        <div v-if="loading">
          <v-progress-circular indeterminate></v-progress-circular>
        </div>
        <div v-if="!loading && project">
          <ProjectInfo :project="project" class="mb-3"/>
          <ProjectRequiredTalents :project="project" />
        </div>
        <div v-if="!loading && !project">
          <p>Project not found.</p>
        </div>
      </v-card>
    </div>
  </template>
  
  <script setup>
  const { $axios } = useNuxtApp();
  const route = useRoute();
  
  // Extract project slug from the route
  const slug = route.params.slug;
  
  // Project data and loading state
  const project = ref(null);
  const loading = ref(true);
  
  // Fetch the project details
  const fetchProject = async () => {
    try {
      const response = await $axios.get(`/api/project/${slug}`);
      project.value = response.data;
    } catch (error) {
      console.error("An error occurred while fetching the project:", error);
    } finally {
      loading.value = false;
    }
  };
  
  // Call the fetch function
  fetchProject();
  </script>
  