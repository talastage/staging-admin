<template>
    <v-container>
      <h3 class="mb-3">Related Categories</h3>
      <CategoriesList :categories="relatedCategories" />
    </v-container>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useProjectCategoriesStore } from '@/stores/projectCategories'; 
  
  const route = useRoute();
  const projectCategoriesStore = useProjectCategoriesStore();
  
  // Assuming categoryData is reactive and contains the current category's info
  const currentCategory = computed(() => projectCategoriesStore.categories.list.find(
    category => category.slug === route.params.slug
  ));
  
  const relatedCategories = computed(() => {
  if (currentCategory.value && currentCategory.value.relatedIds) {
    return projectCategoriesStore.findRelatedCategories(currentCategory.value.relatedIds);
  }
  return [];
});
  </script>
  