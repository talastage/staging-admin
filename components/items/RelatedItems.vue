<template>
    <v-container>
      <v-list dense>
        <v-list-item-group>
          <v-list-item v-for="relatedProject in relatedProjects" :key="relatedProject.id" two-line>
            <v-list-item-avatar size="56" tile>
              <v-img :src="relatedProject.thumbnail_url"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ relatedProject.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ relatedProject.description }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-thumb-up</v-icon><span>{{ relatedProject.likes_count }}</span>
              <v-icon>mdi-eye</v-icon><span>{{ relatedProject.views_count }}</span>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn icon :href="relatedProject.project_url" target="_blank">
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-container>
  </template>
  
  <script setup>
  import { watch, ref } from 'vue';
  
  const props = defineProps({
    project: {
      type: Object,
      required: true,
    },
  });
  
  const relatedProjects = ref([]);
  
  const { $axios } = useNuxtApp();
  
  const fetchRelatedProjects = async (projectId) => {
    try {
      const response = await $axios.get(`/api/projects/related/${projectId}`);
      relatedProjects.value = response.data.projects;
    } catch (error) {
      console.error(error);
    }
  };
  
  // Watch for changes on the project prop
  watch(() => props.project, (newProject, oldProject) => {
    if (newProject && newProject.id && (!oldProject || newProject.id !== oldProject.id)) {
      fetchRelatedProjects(newProject.id);
    }
  }, { immediate: true });
  </script>
  
  