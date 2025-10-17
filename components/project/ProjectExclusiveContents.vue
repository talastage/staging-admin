<template>
  <div>
    <h3>Exclusive Contents</h3>
    <v-container>
      <v-row>
        <!-- Loop through each exclusive content and display it using ProjectCard -->
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="content in exclusiveContents"
          :key="content.id"
        >
          <ProjectExclusiveContentCard :project="content" />
        </v-col>
      </v-row>
    </v-container>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
// Define the prop that will be passed into this component
const route = useRoute();
const accessUuid = route.params.access_uuid as string;
// State for exclusive content data and loading status
const exclusiveContents = ref([]);
const loading = ref(false);
const error = ref(null);
const { $axios } = useNuxtApp();

// Fetch the exclusive contents from the API
const fetchExclusiveContents = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await $axios.get(
      `/api/projects/${accessUuid}/statistics/exclusive-contents`
    );
    exclusiveContents.value = response.data.exclusive_contents; // Adjust if your API response structure is different
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching exclusive contents:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchExclusiveContents);
</script>

<style>
/* Your styles here */
</style>
